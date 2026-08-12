<!--
  SPIKE · JellySurface
  A `GlassSurface` that wobbles when poked.

  The whole subtlety is *where the transform goes*, and it depends on how
  the surface ended up drawing its refraction:

    real / none — Chromium anywhere, WebKit outside an iframe. The panel
                  uses a genuine `backdrop-filter`, so a transform on the
                  glass simply scales the filtered result. The backdrop
                  stretches with the panel; this is the good one.

    echo        — WebKit inside an iframe (Storybook) and Firefox. The
                  panel filters a *copy* of the backdrop, anchored with
                  `background-attachment: fixed`. Per the CSS Transforms
                  spec a transformed element becomes the containing block
                  for descendant fixed background attachments — so the
                  moment the glass is transformed, that copy re-anchors
                  from the viewport to the panel. It jumps, and a `cover`
                  background re-resolves against a 400px box instead of a
                  whole screen. Both of which are exactly what you see.

  So in echo mode the transform goes on an inner wrapper instead. The
  contents squash, the silhouette morphs at the corners, the ring travels
  — and the refracted backdrop stays put rather than leaping about.

  A worthwhile thing to know: WebKit only uses echo *inside an iframe*.
  In a real app at the top level Safari takes the `real` path and behaves
  exactly like Chrome. Open this story in its own tab to see that. Firefox
  uses echo everywhere, so for Firefox this fallback is permanent.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import GlassSurface from "../../components/atoms/GlassSurface/GlassSurface.svelte";
  import { useWobble, type WobbleTuning } from "../../motion/wobble.svelte";

  interface Props extends WobbleTuning {
    shape?: "pill" | "circle" | "rounded" | "square";
    elevation?: "flat" | "raised" | "floating";
    refraction?: boolean | "auto";
    /** Rendered tag. `"button"` for a control, `"div"` for a plain panel. */
    element?: keyof HTMLElementTagNameMap;
    /**
     * Keep the transform off the glass wherever it would disturb the
     * backdrop copy. Turn it off to see the bug the spike is about.
     */
    echoSafe?: boolean;
    /** Draw a small badge naming the refraction mode in play. */
    showMode?: boolean;
    style?: string;
    class?: string;
    onpoke?: () => void;
    children?: Snippet;
  }

  let {
    shape = "rounded",
    elevation = "floating",
    refraction = "auto",
    element = "div",
    echoSafe = true,
    showMode = false,
    style = "",
    class: className = "",
    onpoke,
    children,
    ...tuning
  }: Props = $props();

  let host = $state<HTMLElement | null>(null);
  let mode = $state<"real" | "echo" | "none">("none");

  const wobble = useWobble(() => tuning);

  /** Is a transform on the glass itself safe here? */
  const transformOnGlass = $derived(!echoSafe || mode !== "echo");

  const surfaceStyle = $derived(
    [style, wobble.shapeStyle, transformOnGlass ? wobble.deformStyle : ""]
      .filter(Boolean)
      .join(";"),
  );

  function poke(event: MouseEvent) {
    wobble.kick(event, host);
    onpoke?.();
  }

  // Keyboard activation has no coordinates, so it deforms from the centre.
  function onKey(event: KeyboardEvent) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    wobble.kick();
    onpoke?.();
  }
</script>

<div class="jelly {className}" bind:this={host}>
  <GlassSurface
    {shape}
    {elevation}
    {refraction}
    {element}
    interactive={element === "button"}
    style={surfaceStyle}
    onmode={(m) => (mode = m)}
    onclick={poke}
    onkeydown={element === "button" ? onKey : undefined}
  >
    <!-- In echo mode this wrapper carries the squash instead of the glass.
         It is a plain flex box at rest and costs nothing. -->
    <span class="jelly__inner" style={transformOnGlass ? "" : wobble.deformStyle}>
      {@render children?.()}
    </span>

    {#if wobble.ring}
      <span
        class="jelly__ring"
        style:left="{wobble.ring.x}%"
        style:top="{wobble.ring.y}%"
        style:width="{wobble.ring.radius}%"
        style:height="{wobble.ring.radius}%"
        style:opacity={wobble.ring.opacity}
        aria-hidden="true"
      ></span>
    {/if}
  </GlassSurface>

  {#if showMode}
    <span class="jelly__mode" class:jelly__mode--echo={mode === "echo"}>
      {mode}
    </span>
  {/if}
</div>

<style>
  .jelly {
    position: relative;
    display: inline-flex;
  }

  .jelly__inner {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    transform-origin: 50% 50%;
  }

  /* The ring is a child of the glass, so the surface clips it — a ring
     that escaped the panel would read as a shockwave in the page rather
     than a disturbance in the liquid. */
  .jelly__ring {
    position: absolute;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    border: 1.5px solid rgba(255, 255, 255, 0.75);
    background: radial-gradient(
      closest-side,
      rgba(255, 255, 255, 0) 62%,
      rgba(255, 255, 255, 0.22) 88%,
      rgba(255, 255, 255, 0)
    );
    pointer-events: none;
    z-index: 3;
  }

  .jelly__mode {
    position: absolute;
    top: -9px;
    left: 50%;
    transform: translateX(-50%);
    padding: 2px 8px;
    border-radius: 999px;
    background: #1f7a4d;
    color: #fff;
    font-family: var(--l-font-sans, "Helvetica Neue", Helvetica, Arial, sans-serif);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    pointer-events: none;
  }

  .jelly__mode--echo {
    background: #a6641b;
  }
</style>
