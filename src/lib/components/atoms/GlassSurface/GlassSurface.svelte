<!--
  ATOM · GlassSurface
  The one place where "liquid glass" is defined. Everything else in this
  library (bar, ball, pen) is the same surface in a different shape.

  Five layers, back to front:
    1 refract   — refraction: picks up the backdrop (backdrop-filter)
                  and displaces it (SVG filter)
    2 tint      — a shallow gradient that gives the glass a body
    3 specular  — bright edge along the top, bloom in the lower left
    4 bevel     — the chamfer: light running round the inside rim
    5 content   — the children

  On refraction: `blur()` alone gives frosted glass — the backdrop goes
  soft but stays geometrically put. A solid block of glass displaces it:
  the centre is magnified, contours tip away close to the rim. The maths
  lives in `lens.ts`; this file only wires it up.

  Why the displacement sits on a layer of its own rather than as a `url()`
  inside the panel's own backdrop-filter: see `refractStyle` below. Short
  version — otherwise only Chrome would show it.

  SELF-CONTAINED BY DESIGN. Every custom property below carries its own
  fallback, so the component renders correctly when dropped into a project
  that never imports `tokens.css`. Declare any `--glass-*` variable on
  `:root` (or on any ancestor) to retheme it.

  ONE RULE FOR CALLERS: in `"echo"` refraction, do not put a `transform` on
  this element or on any ancestor of it. The backdrop copy is held in place
  with `background-attachment: fixed`, and the CSS Transforms spec makes a
  transformed element the containing block for *descendant fixed background
  attachments* — so a transform anywhere above the copy re-anchors it from
  the viewport to that element. The panel then shows a slice of backdrop
  from the wrong place, at the wrong zoom. It is silent, it looks like a
  rendering bug, and Chromium never reproduces it because Chromium uses the
  `real` path. Subscribe to `onmode` if you need to know which path applies.
-->
<script lang="ts">
  import { untrack, type Snippet } from "svelte";
  import { buildLens, lensFingerprint, refractionMode } from "./lens";

  interface Props {
    /** Corner radius preset. `pill` for bars, `circle` for balls,
     *  `rounded` for cards, `square` for full-bleed panels. */
    shape?: "pill" | "circle" | "rounded" | "square";
    /** Explicit corner radius. Any CSS length; overrides `shape`. */
    radius?: string | number;
    /** Scattering strength in px. Overrides --glass-blur locally. */
    blur?: number;
    /** Saturation in percent. Pulls colour out of the backdrop. */
    saturate?: number;
    /**
     * Refraction like a solid block of glass. `"auto"` enables it wherever
     * the engine draws SVG filters over a backdrop; elsewhere it stays
     * frosted. `false` forces frosted, `true` forces refraction.
     */
    refraction?: boolean | "auto";
    /** Magnification on the inside (1 = none). The "lens" quality. */
    magnify?: number;
    /** Width of the rim zone in px, inside which contours tip away. */
    rim?: number;
    /** Displacement at the outermost edge in px — how thick the glass reads. */
    rimBend?: number;
    /** Colour fringe at the rim (0 = off). Thick glass splits colours. */
    chroma?: number;
    /** Height above the content — drives shadow depth. */
    elevation?: "flat" | "raised" | "floating";
    /** Reacts to the pointer: lifts, light travels with it. */
    interactive?: boolean;
    /** Draws the specular edge and bloom. Turn off for debugging or docs. */
    specular?: boolean;
    /** Rendered tag. Use `"button"`, `"a"`, `"section"`… as needed. */
    element?: keyof HTMLElementTagNameMap;
    /**
     * Reports which way the refraction ended up being drawn, whenever that
     * changes. Worth listening to if you intend to put a `transform` on the
     * surface: in `"echo"` mode the backdrop copy is anchored with
     * `background-attachment: fixed`, and per the CSS Transforms spec a
     * transformed element becomes the containing block for descendant fixed
     * background attachments — so the copy would re-anchor to the panel and
     * visibly jump. See the jelly spike for how to work around it.
     */
    onmode?: (mode: "real" | "echo" | "none") => void;
    class?: string;
    style?: string;
    children?: Snippet;
    [key: string]: unknown;
  }

  let {
    shape = "pill",
    radius,
    blur,
    saturate,
    refraction = "auto",
    magnify = 1.4,
    rim = 12,
    rimBend = 12,
    chroma = 0.015,
    elevation = "floating",
    interactive = false,
    specular = true,
    element = "div",
    onmode,
    class: className = "",
    style = "",
    children,
    ...rest
  }: Props = $props();

  const uid = $props.id();

  let host = $state<HTMLElement | null>(null);
  let width = $state(0);
  let height = $state(0);

  /** How this engine can draw the refraction (see `refractionMode`). */
  let mode = $state<"real" | "echo" | "none">("none");
  /** Does the environment provide a backdrop copy for echo mode? */
  let echoSource = $state(false);
  /** Transparency is a preference: whoever opts out of it also opts out of
      the distortion — otherwise the unrest just moves from the surface to
      the rim. */
  let reducedTransparency = $state(false);

  $effect(() => {
    mode = refractionMode();

    const query = window.matchMedia("(prefers-reduced-transparency: reduce)");
    reducedTransparency = query.matches;
    const onChange = (e: MediaQueryListEvent) => (reducedTransparency = e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  });

  /**
   * The map depends on size: a 34px ball needs a different rim zone than a
   * 400px bar. So the element is measured — but the lens is deliberately
   * *not* rebuilt on every measurement.
   *
   * Rebuilding means discarding the `<filter>` and the refracting layer and
   * mounting new ones (see `filterId`). That is cheap once and ruinous sixty
   * times a second: an element whose width animates would tear its own
   * refraction down every frame, which reads as flicker and torn edges
   * rather than as a resize.
   *
   * So the committed size settles first. During the transient the old
   * filter keeps drawing, and it keeps drawing something sensible: the maps
   * are `feImage`s with `preserveAspectRatio="none"` filling the filter
   * region, and the filter region is the element. A stale map therefore
   * stretches to whatever size the element currently is — slightly wrong in
   * proportion for a few frames, never wrong in position, and corrected as
   * soon as the size stops changing.
   */
  const SETTLE_MS = 120;

  $effect(() => {
    if (!host) return;

    // Plain locals, not state: comparing against them must not make this
    // effect depend on its own output and re-subscribe the observer.
    let committedWidth = -1;
    let committedHeight = -1;
    let settle: ReturnType<typeof setTimeout> | undefined;

    const commit = (w: number, h: number) => {
      committedWidth = w;
      committedHeight = h;
      width = w;
      height = h;
      // A forced style recalculation, so it happens when the size settles
      // rather than on every resize notification.
      const vars = getComputedStyle(host!);
      echoSource =
        vars.getPropertyValue("--glass-echo").trim() !== "" ||
        vars.getPropertyValue("--glass-echo-color").trim() !== "";
    };

    const measure = () => {
      if (!host) return;
      const w = host.offsetWidth;
      const h = host.offsetHeight;
      if (w === committedWidth && h === committedHeight) return;
      if (committedWidth < 0) {
        commit(w, h); // first measurement: no reason to wait
        return;
      }
      clearTimeout(settle);
      settle = setTimeout(() => commit(w, h), SETTLE_MS);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => {
      clearTimeout(settle);
      observer.disconnect();
    };
  });

  /** The mode actually drawn. `"echo"` only when the environment really
      supplies the copy — otherwise it would be an empty layer. */
  const wanted = $derived.by((): "real" | "echo" | "none" => {
    if (refraction === false) return "none";
    const usable = mode === "echo" && !echoSource ? "none" : mode;
    if (refraction === true && usable === "none") return "real";
    return usable;
  });
  const active = $derived(
    wanted !== "none" && !reducedTransparency && width > 12 && height > 12,
  );

  // Untracked, so a caller that stores the mode in state cannot loop back
  // round and re-trigger this.
  $effect(() => {
    const settled = wanted;
    untrack(() => onmode?.(settled));
  });

  const lens = $derived(
    active ? buildLens({ width, height, magnify, rim, rimBend }) : null,
  );

  /**
   * The id changes as soon as anything about the lens changes — and with it
   * (through the `{#key}` block below) the whole filter plus the refracting
   * layer.
   *
   * This is not fussiness but the only version that lands in WebKit: Safari
   * resolves `filter: url(#…)` when the element is inserted and keeps that
   * resolution. Changed filter attributes are ignored; even a swapped-out
   * filter with a re-pointed reference stays inert. Only a newly inserted
   * layer pointing at a new id repaints. In Chrome the attribute change was
   * enough — which is why nobody noticed that `magnify` and friends were
   * dead controls in Safari.
   */
  const filterId = $derived(
    `glass-lens-${uid}-${lensFingerprint(width, height, magnify, rim, rimBend, chroma)}`,
  );

  /**
   * And two more stages, both purely because of WebKit:
   *
   * 1. The refracting layer may only come into existence once the new
   *    filter is already in the document. `$effect` runs after the DOM
   *    update and reports the mounted filter here; the layer is then built
   *    on the next pass.
   * 2. Safari will not repaint a once-filtered layer as long as its
   *    `backdrop-filter` stays unchanged — not even when both the filter
   *    and the element are replaced. So every change carries an
   *    imperceptible deviation into the scattering (one thousandth of a
   *    pixel, alternating on and off). It is invisible, and it is the only
   *    reason `magnify` and friends respond at all in Safari.
   */
  let mounted = $state<{ id: string; nudge: number } | null>(null);

  $effect(() => {
    const id = lens ? filterId : null;
    untrack(() => {
      if (!id) {
        mounted = null;
      } else if (mounted?.id !== id) {
        mounted = { id, nudge: mounted?.nudge ? 0 : 0.001 };
      }
    });
  });

  const mountedFilter = $derived(mounted?.id ?? null);

  /** Scattering of the refracting layer — including the nudge from above. */
  const refractBackdrop = $derived(
    `blur(calc(var(--glass-lens-blur, 0.8px) + ${mounted?.nudge ?? 0}px)) ` +
      `saturate(var(--glass-lens-saturate, 140%)) ` +
      `brightness(var(--glass-lens-brightness, 1.02))`,
  );

  // Colour fringe: the same displacement three times, each marginally
  // different in strength, then reassembled channel by channel.
  const scaleR = $derived(lens ? lens.scale * (1 + chroma) : 0);
  const scaleG = $derived(lens ? lens.scale : 0);
  const scaleB = $derived(lens ? lens.scale * (1 - chroma) : 0);

  const cssRadius = $derived(
    radius == null ? null : typeof radius === "number" ? `${radius}px` : radius,
  );

  const localVars = $derived(
    [
      blur != null ? `--glass-blur:${blur}px` : "",
      saturate != null ? `--glass-saturate:${saturate}%` : "",
      cssRadius != null ? `border-radius:${cssRadius}` : "",
      style,
    ]
      .filter(Boolean)
      .join(";"),
  );

  /**
   * The displacement hangs off the refracting layer as an ordinary `filter`
   * — not as a `url()` inside a `backdrop-filter`. That is the difference
   * between "Chrome only" and "Chrome and Safari": WebKit refuses to draw
   * SVG filters inside a backdrop-filter, but happily filters a layer that
   * itself carries a backdrop-filter.
   *
   * Where that layer gets its backdrop from depends on the mode:
   *
   *   real — `backdrop-filter` picks up the real backdrop. Works everywhere
   *          in Chromium, in WebKit only in the top-level document.
   *   echo — the layer paints itself a *copy* of the backdrop: the same
   *          values the environment gives its own background, handed down
   *          through `--glass-echo-*` and placed pixel-aligned underneath
   *          the element with `background-attachment: fixed`. Scattering
   *          and displacement then run together through an ordinary
   *          `filter` — which WebKit draws even inside an iframe
   *          (Storybook!) and Gecko draws at all. The copy is only correct
   *          as long as the backdrop itself does not scroll.
   */
  const refractStyle = $derived.by(() => {
    if (!mountedFilter) return "";
    const bend = `filter:url(#${mountedFilter});-webkit-filter:url(#${mountedFilter})`;
    if (wanted === "echo") {
      const scatter =
        `url(#${mountedFilter}) blur(var(--glass-lens-blur, 0.8px)) ` +
        `saturate(var(--glass-lens-saturate, 140%)) ` +
        `brightness(var(--glass-lens-brightness, 1.02))`;
      // The copy is opaque and would cover the host's body tint. So the
      // tint travels along as the topmost background layer — that way it
      // runs through the filter too, exactly as it does in real mode.
      return (
        `background-color:var(--glass-echo-color,transparent);` +
        `background-image:var(--glass-lens-tint, linear-gradient(150deg, rgba(255,255,255,0.2), rgba(255,255,255,0.06) 48%, rgba(255,255,255,0.16))),var(--glass-echo,none);` +
        `background-size:auto,var(--glass-echo-size,cover);` +
        `background-repeat:no-repeat,var(--glass-echo-repeat,no-repeat);` +
        `background-position:0 0,var(--glass-echo-position,center);` +
        `background-attachment:scroll,fixed;` +
        `filter:${scatter};-webkit-filter:${scatter}`
      );
    }
    return (
      `-webkit-backdrop-filter:${refractBackdrop};backdrop-filter:${refractBackdrop};` +
      bend
    );
  });
</script>

<svelte:element
  this={element}
  bind:this={host}
  class="glass glass--{shape} glass--{elevation} {className}"
  class:glass--interactive={interactive}
  class:glass--lens={!!lens}
  style={localVars}
  {...rest}
>
  {#if lens}
    <!-- The key is the filter id: change anything about the lens and both
         the definition and the layer are discarded and rebuilt. Nothing
         else lands in WebKit (see `filterId` above).

         The order inside is a condition too: definition first, then the
         layer that uses it. WebKit resolves `filter: url(#…)` on insertion;
         if the filter is not there yet, the reference stays dead — in
         Chrome this goes unnoticed, because it is resolved later.

         The map: red displaces horizontally, green vertically, 128 means
         "leave alone". feComposite lays both axes on top of each other. -->
    {#key filterId}
    <svg class="glass__lens" width="0" height="0" aria-hidden="true" focusable="false">
      <filter
        id={filterId}
        filterUnits="objectBoundingBox"
        primitiveUnits="userSpaceOnUse"
        color-interpolation-filters="sRGB"
        x="0"
        y="0"
        width="100%"
        height="100%"
      >
        <!-- Deliberately without x/y/width/height: without them feImage
             fills the filter region, and that region is placed exactly on
             the element above. Given pixel values, WebKit resolves them
             against the document origin instead of the element edge — far
             from the origin only a constant map value arrives, and the lens
             turns into a uniform shift. -->
        <feImage
          href={lens.mapX}
          xlink:href={lens.mapX}
          preserveAspectRatio="none"
          result="mapX"
        />
        <feImage
          href={lens.mapY}
          xlink:href={lens.mapY}
          preserveAspectRatio="none"
          result="mapY"
        />
        <feComposite
          in="mapX"
          in2="mapY"
          operator="arithmetic"
          k2="1"
          k3="1"
          result="map"
        />

        <feDisplacementMap
          in="SourceGraphic"
          in2="map"
          scale={scaleR}
          xChannelSelector="R"
          yChannelSelector="G"
          result="bentR"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="map"
          scale={scaleG}
          xChannelSelector="R"
          yChannelSelector="G"
          result="bentG"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="map"
          scale={scaleB}
          xChannelSelector="R"
          yChannelSelector="G"
          result="bentB"
        />

        <feColorMatrix
          in="bentR"
          type="matrix"
          values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
          result="onlyR"
        />
        <feColorMatrix
          in="bentG"
          type="matrix"
          values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
          result="onlyG"
        />
        <feColorMatrix
          in="bentB"
          type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
          result="onlyB"
        />

        <feBlend in="onlyR" in2="onlyG" mode="screen" result="rg" />
        <feBlend in="rg" in2="onlyB" mode="screen" />
      </filter>
    </svg>

    {/key}

    <!-- The refracting layer: it picks up the backdrop (backdrop-filter)
         and displaces it (filter). Sits behind light and content — and
         deliberately only comes into being once its filter is in the
         document. -->
    {#key mountedFilter}
      {#if mountedFilter}
        <span class="glass__refract" style={refractStyle} aria-hidden="true"></span>
      {/if}
    {/key}
  {/if}

  {#if specular}
    <span class="glass__edge" aria-hidden="true"></span>
    <span class="glass__bloom" aria-hidden="true"></span>
  {/if}
  <span class="glass__content">
    {@render children?.()}
  </span>
</svelte:element>

<style>
  .glass {
    position: relative;
    isolation: isolate;
    display: inline-flex;
    align-items: center;
    overflow: hidden;

    /* 1 · Refraction */
    -webkit-backdrop-filter: blur(var(--glass-blur, 22px))
      saturate(var(--glass-saturate, 190%));
    backdrop-filter: blur(var(--glass-blur, 22px))
      saturate(var(--glass-saturate, 190%));

    /* 2 · Body */
    background: var(
      --glass-tint,
      linear-gradient(
        150deg,
        rgba(255, 255, 255, 0.52),
        rgba(255, 255, 255, 0.2) 48%,
        rgba(255, 255, 255, 0.44)
      )
    );
    border: var(--glass-border, 0.75px solid rgba(255, 255, 255, 0.62));
    color: var(--glass-ink, #26262b);

    /* NO `transform` HERE, in either the transition or the states below.
       Two independent reasons, and each on its own is decisive:

       1 · In echo refraction the backdrop copy is held by
           `background-attachment: fixed`, and the CSS Transforms spec makes
           a transformed element the containing block for descendant fixed
           background attachments. Any transform on this element — even a
           1px hover lift, even `translateY(0)` — re-anchors that copy from
           the viewport to the panel. It jumps, and a `cover` background
           re-resolves against the panel instead of the screen. Chromium
           never shows it, because Chromium uses the `real` path.

       2 · Callers animate `transform` themselves (the jelly wobble drives
           it per frame). A transition here would low-pass their animation
           and a `:hover` rule would silently overwrite it. */
    transition:
      top var(--l-dur-base, 220ms) var(--l-ease-out, cubic-bezier(0.16, 1, 0.3, 1)),
      box-shadow var(--l-dur-base, 220ms) var(--l-ease-out, cubic-bezier(0.16, 1, 0.3, 1));
  }

  /* The filter definition must not touch layout — but it must not be
     `display:none` either, or CSS can no longer find the filter. */
  .glass__lens {
    position: absolute;
    width: 0;
    height: 0;
    pointer-events: none;
  }

  /* Solid glass: the backdrop is displaced, not atomised. So less body
     colour — a dense gradient would cover the refraction up. The filtering
     is done by the refracting layer here; the panel itself passes the
     backdrop through untouched, otherwise it would scatter twice. */
  .glass--lens {
    background: var(
      --glass-lens-tint,
      linear-gradient(
        150deg,
        rgba(255, 255, 255, 0.2),
        rgba(255, 255, 255, 0.06) 48%,
        rgba(255, 255, 255, 0.16)
      )
    );
    border: var(--glass-lens-border, 0.75px solid rgba(255, 255, 255, 0.52));
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }

  /* The scattering deliberately does not live here but inline: it carries
     the deviation that makes Safari repaint (see `mounted`). */
  .glass__refract {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    /* The layer rounds itself, rather than relying on the `overflow: hidden`
       of the host. In `real` mode this layer carries a `backdrop-filter`,
       and Chromium does not apply an ancestor's rounded clip to a
       backdrop-filtered descendant: the filtered backdrop is painted to the
       full border box and the pill reads as a rectangle. WebKit clips it,
       which is why this only ever showed up in Chrome — and only in `real`
       mode, so never in the Storybook iframe on Safari, where the same
       surface takes the `echo` path.
       `inherit` rather than a repeat of the shape rules: the host's radius
       may also come from the `radius` prop as an inline style. */
    border-radius: inherit;
  }

  .glass--pill {
    border-radius: var(--l-radius-pill, 999px);
  }
  .glass--rounded {
    border-radius: var(--l-radius-md, 14px);
  }
  .glass--square {
    border-radius: 0;
  }
  .glass--circle {
    border-radius: 50%;
    aspect-ratio: 1;
    justify-content: center;
  }

  /* Height = shadow. The shadow is warm, so the layer does not look like a
     UI element cut out and pasted onto a photograph. */
  .glass--flat {
    box-shadow: var(
      --glass-inner-light,
      inset 0 1.2px 0 rgba(255, 255, 255, 1),
      inset 0 -10px 18px rgba(255, 255, 255, 0.34),
      inset 0 -1px 0 rgba(255, 255, 255, 0.55)
    );
  }
  .glass--raised {
    box-shadow:
      0 8px 18px var(--l-shade-15, rgba(12, 12, 22, 0.15)),
      0 0 0 0.5px var(--l-shade-10, rgba(60, 60, 75, 0.1)),
      var(
        --glass-inner-light,
        inset 0 1.2px 0 rgba(255, 255, 255, 1),
        inset 0 -10px 18px rgba(255, 255, 255, 0.34),
        inset 0 -1px 0 rgba(255, 255, 255, 0.55)
      );
  }
  .glass--floating {
    box-shadow:
      var(
        --glass-shadow,
        0 18px 40px rgba(12, 12, 22, 0.24),
        0 6px 12px rgba(12, 12, 22, 0.15),
        0 0 0 0.5px rgba(60, 60, 75, 0.1)
      ),
      var(
        --glass-inner-light,
        inset 0 1.2px 0 rgba(255, 255, 255, 1),
        inset 0 -10px 18px rgba(255, 255, 255, 0.34),
        inset 0 -1px 0 rgba(255, 255, 255, 0.55)
      );
  }

  /* 4 · The bevel. On a solid block the light does not sit along the top
     only, it runs around the entire rim — where the image behind tips. */
  .glass--lens.glass--flat {
    box-shadow: var(
      --glass-bevel,
      inset 0 1.2px 0 rgba(255, 255, 255, 1),
      inset 0 0 0 0.75px rgba(255, 255, 255, 0.34),
      inset 10px 0 16px -12px rgba(255, 255, 255, 0.8),
      inset -10px 0 16px -12px rgba(255, 255, 255, 0.8),
      inset 0 -12px 18px -14px rgba(255, 255, 255, 0.8),
      inset 0 12px 18px -16px rgba(255, 255, 255, 0.62)
    );
  }
  .glass--lens.glass--raised {
    box-shadow:
      0 8px 18px var(--l-shade-15, rgba(12, 12, 22, 0.15)),
      0 0 0 0.5px var(--l-shade-10, rgba(60, 60, 75, 0.1)),
      var(
        --glass-bevel,
        inset 0 1.2px 0 rgba(255, 255, 255, 1),
        inset 0 0 0 0.75px rgba(255, 255, 255, 0.34),
        inset 10px 0 16px -12px rgba(255, 255, 255, 0.8),
        inset -10px 0 16px -12px rgba(255, 255, 255, 0.8),
        inset 0 -12px 18px -14px rgba(255, 255, 255, 0.8),
        inset 0 12px 18px -16px rgba(255, 255, 255, 0.62)
      );
  }
  .glass--lens.glass--floating {
    box-shadow:
      var(
        --glass-shadow,
        0 18px 40px rgba(12, 12, 22, 0.24),
        0 6px 12px rgba(12, 12, 22, 0.15),
        0 0 0 0.5px rgba(60, 60, 75, 0.1)
      ),
      var(
        --glass-bevel,
        inset 0 1.2px 0 rgba(255, 255, 255, 1),
        inset 0 0 0 0.75px rgba(255, 255, 255, 0.34),
        inset 10px 0 16px -12px rgba(255, 255, 255, 0.8),
        inset -10px 0 16px -12px rgba(255, 255, 255, 0.8),
        inset 0 -12px 18px -14px rgba(255, 255, 255, 0.8),
        inset 0 12px 18px -16px rgba(255, 255, 255, 0.62)
      );
  }

  /* 3 · Specular light */
  .glass__edge {
    position: absolute;
    inset: 0.8px 26% auto 4%;
    height: 44%;
    border-radius: var(--l-radius-pill, 999px);
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.85),
      rgba(255, 255, 255, 0.05)
    );
    pointer-events: none;
    z-index: 1;
  }

  .glass__bloom {
    position: absolute;
    left: -10%;
    bottom: -60%;
    width: 60%;
    height: 120%;
    border-radius: 50%;
    background: radial-gradient(
      closest-side,
      rgba(255, 255, 255, 0.45),
      rgba(255, 255, 255, 0)
    );
    pointer-events: none;
    z-index: 1;
  }

  /* Over a refracted backdrop the panel's own light may step back. */
  .glass--lens .glass__edge {
    opacity: 0.7;
  }
  .glass--lens .glass__bloom {
    opacity: 0.55;
  }

  .glass--circle .glass__edge {
    inset: 1px 22% auto 22%;
    height: 30%;
  }

  /* Content sits above the light. Layout (padding, direction) is brought by
     the consuming component — the surface does not meddle in arrangement. */
  .glass__content {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  /* The lift is a relative offset, not a translate — see the note on
     `.glass`. The baseline sits here rather than on `.glass` so that a
     surface positioned absolutely by its caller (the dock plate pins itself
     with `bottom`) is not over-constrained by an inherited `top: 0`. */
  .glass--interactive {
    top: 0;
  }

  .glass--interactive:hover {
    top: -1px;
    box-shadow:
      0 22px 46px var(--l-shade-24, rgba(12, 12, 22, 0.24)),
      0 8px 14px var(--l-shade-15, rgba(12, 12, 22, 0.15)),
      0 0 0 0.5px var(--l-shade-10, rgba(60, 60, 75, 0.1)),
      var(
        --glass-inner-light,
        inset 0 1.2px 0 rgba(255, 255, 255, 1),
        inset 0 -10px 18px rgba(255, 255, 255, 0.34),
        inset 0 -1px 0 rgba(255, 255, 255, 0.55)
      );
  }

  .glass--lens.glass--interactive:hover {
    box-shadow:
      0 22px 46px var(--l-shade-24, rgba(12, 12, 22, 0.24)),
      0 8px 14px var(--l-shade-15, rgba(12, 12, 22, 0.15)),
      var(
        --glass-bevel,
        inset 0 1.2px 0 rgba(255, 255, 255, 1),
        inset 0 0 0 0.75px rgba(255, 255, 255, 0.34),
        inset 10px 0 16px -12px rgba(255, 255, 255, 0.8),
        inset -10px 0 16px -12px rgba(255, 255, 255, 0.8),
        inset 0 -12px 18px -14px rgba(255, 255, 255, 0.8),
        inset 0 12px 18px -16px rgba(255, 255, 255, 0.62)
      );
  }

  .glass--interactive:active {
    top: 0;
    transition-duration: var(--l-dur-fast, 140ms);
  }
</style>
