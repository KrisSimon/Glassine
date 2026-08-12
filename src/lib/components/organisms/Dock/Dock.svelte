<!--
  ORGANISM · Dock
  A macOS-style dock: app tiles on a glass plate, magnifying under the
  pointer, pushing their neighbours aside, and widening the plate to make
  room for themselves.

  Three decisions carry the whole thing:

  1 · The tiles live *outside* the glass. `GlassSurface` clips its content
      (it must — the refraction is drawn inside it), so a magnified tile
      placed inside would be sliced off at the top edge. The plate is a
      sibling of the row, absolutely positioned behind it, and the row keeps
      headroom above itself for the tiles to grow into.

  2 · The row's layout never changes. Slot widths are fixed; magnification
      is a `transform` and the sideways push is *computed*, never measured.
      The tempting version — grow the slots and let flexbox sort it out —
      feeds back on itself: the row widens, a centred dock's left edge
      moves, the pointer offset measured against that edge changes, and the
      tiles shiver. The plate still grows (see `plate` below), but it grows
      because we calculated where the tiles ended up, not because the
      layout pushed it.

  3 · One value drives one frame. The pointer is smoothed in JavaScript and
      everything — scales, offsets, plate geometry — derives from it, so
      tiles and plate can never disagree about how far along the animation
      is. CSS transitions were the first attempt and the wrong tool: each
      pointer event retargets a transition that is still running, and the
      plate (whose width is a layout property) cannot be transitioned in
      step with the tiles (whose transform is not).
-->
<script lang="ts">
  import GlassSurface from "../../atoms/GlassSurface/GlassSurface.svelte";
  import CountBadge from "../../atoms/CountBadge/CountBadge.svelte";
  import Icon from "../../atoms/Icon/Icon.svelte";
  import type { DockItem } from "../../../types";

  interface Props {
    items?: DockItem[];
    /** Edge length of a tile at rest, in px. */
    size?: number;
    /** Gap between tiles, in px. */
    gap?: number;
    /** Peak scale directly under the pointer. `1` turns magnification off. */
    magnification?: number;
    /** How many tiles either side are affected, as a multiple of the pitch. */
    spread?: number;
    /**
     * How quickly the dock catches up with the pointer, per frame, 0…1.
     * Higher is snappier; lower is heavier. Below about 0.15 the lag starts
     * to read as the dock being broken rather than as weight.
     */
    easing?: number;
    /** Show the name above the tile under the pointer. */
    showLabels?: boolean;
    /** Refraction of the plate. `false` gives frosted glass. */
    refraction?: boolean | "auto";
    label?: string;
    onactivate?: (item: DockItem) => void;
  }

  let {
    items = [],
    size = 52,
    gap = 8,
    magnification = 1.8,
    spread = 2.2,
    easing = 0.3,
    showLabels = true,
    refraction = "auto",
    label = "Dock",
    onactivate,
  }: Props = $props();

  const PAD = 8;
  const SEPARATOR = 13;

  const step = $derived(size + gap);
  /** Room above the row for the tallest tile to grow into, plus the label. */
  const headroom = $derived(
    Math.round(size * (magnification - 1)) + (showLabels ? 30 : 10),
  );
  const plateRadius = $derived(Math.round(size * 0.34) + PAD);

  let row = $state<HTMLElement | null>(null);
  let hovered = $state<number | null>(null);
  let bouncing = $state<string | null>(null);

  /** No hover on a touch screen, so nothing to magnify against. */
  let coarse = $state(false);
  $effect(() => {
    const query = window.matchMedia("(hover: none)");
    coarse = query.matches;
    const onChange = (e: MediaQueryListEvent) => (coarse = e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  });

  const enabled = $derived(magnification > 1 && !coarse);

  /* ── The smoothed pointer ────────────────────────────────────────────
     `x` is where along the row the magnification is centred; `amount`
     ramps 0→1 on enter and 1→0 on leave, so leaving eases the dock back
     down in place instead of snapping it. Both are advanced once per
     animation frame, and every geometric value below is derived from them
     — which is what keeps the tiles and the plate in lockstep. */
  let x = $state(0);
  let amount = $state(0);

  let targetX = 0;
  let targetAmount = 0;
  let frame = 0;

  function tick() {
    frame = 0;
    const k = Math.min(Math.max(easing, 0.05), 1);
    const nextX = x + (targetX - x) * k;
    const nextAmount = amount + (targetAmount - amount) * k;

    const settled =
      Math.abs(targetX - nextX) < 0.25 && Math.abs(targetAmount - nextAmount) < 0.002;

    x = settled ? targetX : nextX;
    amount = settled ? targetAmount : nextAmount;

    if (!settled) frame = requestAnimationFrame(tick);
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(tick);
  }

  $effect(() => () => cancelAnimationFrame(frame));

  /* The row's box never changes, so its rect is cached on entry rather
     than read on every pointer event — `getBoundingClientRect()` in a
     move handler forces a layout on each frame. */
  let rowLeft = 0;

  function cacheRect() {
    if (row) rowLeft = row.getBoundingClientRect().left;
  }

  function aim(px: number, { jump = false } = {}) {
    targetX = px;
    targetAmount = 1;
    // Coming from rest, start *at* the pointer: otherwise the focus sweeps
    // across the whole dock on the way in, magnifying everything it passes.
    if (jump || amount < 0.01) x = px;
    schedule();
  }

  function onEnter(event: PointerEvent) {
    if (!enabled) return;
    cacheRect();
    aim(event.clientX - rowLeft);
  }

  function onMove(event: PointerEvent) {
    if (!enabled) return;
    targetX = event.clientX - rowLeft;
    targetAmount = 1;
    schedule();
  }

  function release() {
    hovered = null;
    targetAmount = 0;
    schedule();
  }

  /* ── Geometry ─────────────────────────────────────────────────────── */

  /** Rest centre of tile `i`, measured from the row's left edge. Fixed,
      because the slots never change width — which is the whole point. */
  function centre(i: number): number {
    let c = PAD + size / 2;
    for (let j = 0; j < i; j++) {
      c += step + (items[j + 1]?.separatorBefore ? SEPARATOR : 0);
    }
    return c;
  }

  const rowWidth = $derived(
    items.length === 0 ? 2 * PAD : centre(items.length - 1) + size / 2 + PAD,
  );

  const live = $derived(enabled && amount > 0.001);

  const scales = $derived.by(() => {
    if (!live) return items.map(() => 1);
    return items.map((_, i) => {
      const d = Math.abs(x - centre(i)) / (spread * step);
      // A cosine falloff rather than a linear one: it arrives at 1 with
      // zero slope, so the outermost affected tile does not visibly snap.
      const f = d >= 1 ? 0 : Math.cos((d * Math.PI) / 2);
      return 1 + (magnification - 1) * amount * f;
    });
  });

  /**
   * How far each tile steps aside. A tile that grew by `e` px overhangs its
   * slot by `e/2` on each side, so a neighbour further from the pointer has
   * to clear its own half plus every full overhang in between.
   */
  const offsets = $derived.by(() => {
    if (!live) return items.map(() => 0);
    const excess = scales.map((s) => size * (s - 1));

    // Continuous index of the pointer, so the split point sits between
    // tiles rather than snapping to one.
    let u = 0;
    for (let i = 0; i < items.length; i++) {
      if (x <= centre(i)) {
        u = i === 0 ? 0 : i - 1 + (x - centre(i - 1)) / (centre(i) - centre(i - 1));
        break;
      }
      u = i;
    }

    return items.map((_, i) => {
      if (i > u) {
        let sum = excess[i] / 2;
        for (let j = Math.ceil(u); j < i; j++) sum += excess[j];
        return sum;
      }
      if (i < u) {
        let sum = excess[i] / 2;
        for (let j = i + 1; j <= Math.floor(u); j++) sum += excess[j];
        return -sum;
      }
      return 0;
    });
  });

  /**
   * The plate follows the tiles rather than containing them.
   *
   * Every tile's rendered edges are known — centre, plus its push, plus
   * half its scaled width — so the plate is simply the union of them with
   * the padding added back. Near the ends of the row the outermost tile is
   * pushed past the row's own box, and the plate grows outwards to keep it
   * covered, exactly as the real dock does.
   *
   * Derived from the same `x` and `amount` as the transforms above, so it
   * cannot drift out of step with them.
   */
  const plate = $derived.by(() => {
    if (!live || items.length === 0) return { left: 0, width: rowWidth };

    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < items.length; i++) {
      const half = (size * scales[i]) / 2;
      min = Math.min(min, centre(i) + offsets[i] - half);
      max = Math.max(max, centre(i) + offsets[i] + half);
    }

    // Rounded to whole pixels. `width` is a layout property, so every
    // change repaints the plate and its (large, soft) shadow; sub-pixel
    // values buy nothing visible and make the edge shimmer.
    const left = Math.round(Math.min(0, min - PAD));
    const right = Math.round(Math.max(rowWidth, max + PAD));
    return { left, width: right - left };
  });

  /* ── Interaction ──────────────────────────────────────────────────── */

  /** Keyboard users get the same affordance: focus magnifies too. */
  function focusAt(i: number) {
    hovered = i;
    if (enabled) aim(centre(i));
  }

  function activate(item: DockItem, event: MouseEvent) {
    bouncing = item.id;
    setTimeout(() => (bouncing = null), 620);
    if (onactivate) {
      event.preventDefault();
      onactivate(item);
    }
  }

  function controls(): HTMLElement[] {
    if (!row) return [];
    return Array.from(row.querySelectorAll<HTMLElement>(".dock__tile"));
  }

  /** Roving tabindex: the dock is exactly one tab stop, like a toolbar. */
  function rove(active: HTMLElement | null) {
    const list = controls();
    const target = active && list.includes(active) ? active : list[0];
    for (const control of list) control.tabIndex = control === target ? 0 : -1;
  }

  $effect(() => {
    void items;
    rove(document.activeElement as HTMLElement);
  });

  function handleKeydown(event: KeyboardEvent) {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(event.key)) return;

    const list = controls();
    if (list.length === 0) return;

    const current = list.indexOf(document.activeElement as HTMLElement);
    let next = current;
    if (event.key === "ArrowRight") next = (current + 1) % list.length;
    else if (event.key === "ArrowLeft") next = (current - 1 + list.length) % list.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = list.length - 1;

    if (next !== current && next >= 0) {
      event.preventDefault();
      list[next].focus();
    }
  }
</script>

<svelte:window onresize={cacheRect} onscroll={cacheRect} />

<div
  class="dock"
  style:--dock-size="{size}px"
  style:--dock-gap="{gap}px"
  style:--dock-pad="{PAD}px"
  style:--dock-sep="{SEPARATOR}px"
  style:--dock-head="{headroom}px"
  style:width="{rowWidth}px"
>
  <!-- The plate sits behind the tiles rather than around them, so a
       magnified tile can rise out of it — and it widens to follow them. -->
  <GlassSurface
    shape="rounded"
    radius={plateRadius}
    elevation="floating"
    {refraction}
    class="dock__plate"
    style="left:{plate.left}px;width:{plate.width}px"
    aria-hidden="true"
  />

  <div
    class="dock__row"
    bind:this={row}
    role="toolbar"
    tabindex="-1"
    aria-label={label}
    aria-orientation="horizontal"
    onpointerenter={onEnter}
    onpointermove={onMove}
    onpointerleave={release}
    onkeydown={handleKeydown}
    onfocusin={(e) => rove(e.target as HTMLElement)}
    onfocusout={release}
  >
    {#each items as item, i (item.id)}
      <div class="dock__slot" class:dock__slot--after-gap={item.separatorBefore}>
        {#if item.separatorBefore}
          <span class="dock__separator" aria-hidden="true"></span>
        {/if}

        <a
          class="dock__tile"
          class:dock__tile--bouncing={bouncing === item.id}
          href={item.href ?? "#"}
          aria-label={item.count ? `${item.label}, ${item.count} new` : item.label}
          style:transform="translateX({offsets[i]}px) scale({scales[i]})"
          onpointerenter={() => (hovered = i)}
          onfocus={() => focusAt(i)}
          onblur={() => (hovered = null)}
          onclick={(e) => activate(item, e)}
        >
          <span class="dock__icon" style:background={item.tint ?? "#6b7280"}>
            <Icon name={item.icon} size={Math.round(size * 0.5)} />
          </span>
          {#if item.count}
            <CountBadge count={item.count} label="new" />
          {/if}
        </a>

        {#if item.running}
          <!-- Travels with its tile, but does not scale with it. -->
          <span
            class="dock__dot"
            style:transform="translateX({offsets[i]}px)"
            aria-hidden="true"
          ></span>
        {/if}

      </div>
    {/each}

    <!-- One label for the row, not one per tile. Sweeping across the dock
         would otherwise mount and discard a fresh element on every icon;
         here the same node just moves and changes its text. -->
    {#if showLabels && hovered !== null && items[hovered]}
      <span
        class="dock__label"
        style:left="{centre(hovered) + offsets[hovered]}px"
        aria-hidden="true">{items[hovered].label}</span
      >
    {/if}
  </div>
</div>

<style>
  .dock {
    position: relative;
    display: block;
    /* Headroom for the tiles to grow into. Nothing here clips. */
    padding-top: var(--dock-head);
  }

  /* The plate covers the row only — the tiles above it are outside it.
     `left` and `width` come from the component, per frame. */
  .dock :global(.dock__plate) {
    position: absolute;
    bottom: 0;
    height: calc(var(--dock-size) + 2 * var(--dock-pad));
  }

  .dock__row {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: flex-end;
    gap: var(--dock-gap);
    padding: var(--dock-pad);
  }

  .dock__slot {
    position: relative;
    /* Fixed. Magnification is a transform, never a layout change. */
    width: var(--dock-size);
    height: var(--dock-size);
    flex: 0 0 auto;
  }

  .dock__slot--after-gap {
    margin-left: var(--dock-sep);
  }

  /* A slit of light before the trailing group, as macOS has before the
     trash. It marks a fixed position in the row, so it does not travel. */
  .dock__separator {
    position: absolute;
    top: 6%;
    left: calc(-0.5 * var(--dock-sep) - 0.5 * var(--dock-gap));
    width: 1px;
    height: 88%;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0),
      rgba(70, 70, 80, 0.4),
      rgba(255, 255, 255, 0)
    );
  }

  .dock__tile {
    /* Anchored to the bottom of its slot with `height` rather than `top`,
       so the bounce below can animate `bottom` without resizing the box. */
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 100%;
    display: block;
    /* Grows upward out of the plate, like the real thing. */
    transform-origin: 50% 100%;
    /* Deliberately no transition: the smoothing is done once per frame in
       the component, so that the plate — whose width is a layout property
       and cannot be transitioned in step — stays exactly in sync. */
    will-change: transform;
    -webkit-tap-highlight-color: transparent;
  }

  .dock__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border-radius: 24%;
    color: #fff;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.4),
      inset 0 -1px 0 rgba(0, 0, 0, 0.16),
      0 2px 5px rgba(15, 15, 25, 0.3);
  }

  /* The running-app dot, in the plate's padding below the tile. */
  .dock__dot {
    position: absolute;
    left: 50%;
    bottom: calc(-0.5 * var(--dock-pad) - 2px);
    width: 4px;
    height: 4px;
    margin-left: -2px;
    border-radius: 50%;
    background: rgba(30, 30, 38, 0.6);
    box-shadow: 0 0 0 0.5px rgba(255, 255, 255, 0.5);
  }

  /* Positioned against the row, so `left` is in the same coordinate space
     as `centre()`. No backdrop-filter: it sits over the icons rather than
     over the page, so it would buy nothing and cost a compositing layer
     that is created and destroyed on every hover. */
  .dock__label {
    position: absolute;
    bottom: calc(100% - var(--dock-pad) + 14px);
    transform: translateX(-50%);
    z-index: 3;

    padding: 4px 10px;
    border-radius: 7px;
    background: rgba(24, 24, 28, 0.88);
    color: #fff;

    font-family: var(--l-font-sans, "Helvetica Neue", Helvetica, Arial, sans-serif);
    font-size: 12px;
    font-weight: 600;
    line-height: 1.3;
    white-space: nowrap;
    pointer-events: none;
  }

  .dock__tile:focus-visible {
    outline: none;
  }
  .dock__tile:focus-visible .dock__icon {
    box-shadow:
      0 0 0 2px rgba(255, 255, 255, 0.95),
      0 0 0 4px var(--brand-accent, #e5484d);
  }

  .dock__tile--bouncing {
    animation: dock-bounce 600ms var(--l-ease-in-out, cubic-bezier(0.65, 0, 0.35, 1));
  }

  /* The bounce animates `bottom`, deliberately not `transform`: the
     transform is already carrying the magnification and the push, and an
     animation on it would fight the pointer every frame. */
  @keyframes dock-bounce {
    0%,
    100% {
      bottom: 0;
    }
    35% {
      bottom: 22px;
    }
    70% {
      bottom: 4px;
    }
  }
</style>
