<!--
  TEMPLATE · GlassLayer
  The layer itself — not its content. It only decides where the layer sits
  and that it stays there: spatially in front, visible while scrolling,
  within reach everywhere. What goes inside is brought by the organisms.

  Three positioning strategies:

    fixed   — pinned to the viewport. The default, and what you want on a
              real page: the panel stays put while the page scrolls under it.
    sticky  — pinned inside the nearest scrolling ancestor. Use this when
              the overlay lives in a scroll container rather than on the
              page itself (a modal, a preview pane, an embedded frame).
              `fixed` would escape that container and stick to the window.
    absolute — parked on the parent element. For static shots and mock-ups
              where nothing scrolls at all.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { LayerPlacement } from "../../../types";

  interface Props {
    /** Which corner or edge the panel parks on. Centred placements stretch
     *  the layer and centre with flex — never with a transform. */
    placement?: LayerPlacement;
    /** What the layer is pinned to: the viewport (`fixed`), the nearest
     *  scrolling ancestor (`sticky`), or the parent element (`absolute`). */
    strategy?: "fixed" | "sticky" | "absolute";
    /** Distance from the edge in px. Safe-area insets are added on top. */
    inset?: number;
    /** On narrow viewports move to bottom centre — where the thumb is. */
    responsive?: boolean;
    /** What the layer carries. Usually one organism — a `GlassBar`, a `Dock`. */
    children?: Snippet;
  }

  let {
    placement = "top-right",
    strategy = "fixed",
    inset = 20,
    responsive = true,
    children,
  }: Props = $props();

  /**
   * The entrance animation is cleaned up once it has finished — and that is
   * not tidiness, it is the condition for the glass seeing anything at all:
   *
   * An element carrying an animation (or a `filter`, or `opacity` < 1)
   * becomes a "backdrop root" for the browser. Everything *behind* that
   * element then no longer counts as the backdrop of its children — the
   * panel's `backdrop-filter` would filter empty space. With
   * `animation-fill-mode: both` that state would persist forever.
   */
  let entered = $state(false);

  $effect(() => {
    // Safety net: if `animationend` never fires (background tab, animation
    // suppressed), the timer cleans up anyway.
    const timer = setTimeout(() => (entered = true), 800);
    return () => clearTimeout(timer);
  });
</script>

<div
  class="layer layer--{strategy} layer--{placement}"
  class:layer--responsive={responsive}
  class:layer--entered={entered}
  style:--layer-inset="{inset}px"
  onanimationend={() => (entered = true)}
>
  <div class="layer__slot">
    {@render children?.()}
  </div>
</div>

<style>
  .layer {
    z-index: var(--z-glass-layer, 1000);
    display: flex;
    pointer-events: none; /* the layer intercepts nothing … */
    animation: layer-in var(--l-dur-slow, 420ms)
      var(--l-ease-out, cubic-bezier(0.16, 1, 0.3, 1)) both;
  }

  /* From here on the layer is transparent to the backdrop again. */
  .layer--entered {
    animation: none;
  }

  .layer__slot {
    display: flex;
    /* Stays shrink-wrapped unless a centring rule stretches it. */
    justify-content: inherit;
  }

  .layer__slot > :global(*) {
    pointer-events: auto; /* … only its controls do. */
  }

  .layer--fixed {
    position: fixed;
  }
  .layer--absolute {
    position: absolute;
  }

  /* Safe area: respect the notch and the home indicator. */
  .layer--fixed.layer--top-right,
  .layer--absolute.layer--top-right {
    top: calc(var(--layer-inset) + env(safe-area-inset-top, 0px));
    right: calc(var(--layer-inset) + env(safe-area-inset-right, 0px));
  }
  .layer--fixed.layer--top-left,
  .layer--absolute.layer--top-left {
    top: calc(var(--layer-inset) + env(safe-area-inset-top, 0px));
    left: calc(var(--layer-inset) + env(safe-area-inset-left, 0px));
  }
  /* Centred by stretching the layer and letting flex do it, NOT by
     `translateX(-50%)`. A transform here would sit *above* the glass, and
     in echo refraction any transform above the backdrop copy re-anchors it
     from the viewport to the transformed element — the panel then shows a
     slice of backdrop from the wrong place. See GlassSurface. */
  .layer--fixed.layer--top-center,
  .layer--absolute.layer--top-center {
    top: calc(var(--layer-inset) + env(safe-area-inset-top, 0px));
    left: 0;
    right: 0;
    justify-content: center;
  }
  .layer--fixed.layer--bottom-right,
  .layer--absolute.layer--bottom-right {
    bottom: calc(var(--layer-inset) + env(safe-area-inset-bottom, 0px));
    right: calc(var(--layer-inset) + env(safe-area-inset-right, 0px));
  }
  .layer--fixed.layer--bottom-center,
  .layer--absolute.layer--bottom-center {
    bottom: calc(var(--layer-inset) + env(safe-area-inset-bottom, 0px));
    left: 0;
    right: 0;
    justify-content: center;
  }

  /* Sticky has to stay in flow, so the layer takes no height of its own: a
     zero-height strip pinned to the top (or bottom) of the scroll
     container, out of which the panel overhangs. Because the strip is
     `position: sticky` it is also a containing block, so the slot inside it
     can be placed with the same offsets the other strategies use. */
  .layer--sticky {
    position: sticky;
    height: 0;
    overflow: visible;
  }

  .layer--sticky.layer--top-left,
  .layer--sticky.layer--top-center,
  .layer--sticky.layer--top-right {
    top: 0;
  }

  /* Bottom placement sticks the strip to the bottom edge; the panel then
     hangs upwards out of it. Requires the layer to be the last child of the
     scroll container, which is where `WebsiteScaffold` puts it. */
  .layer--sticky.layer--bottom-center,
  .layer--sticky.layer--bottom-right {
    bottom: 0;
  }

  .layer--sticky .layer__slot {
    position: absolute;
  }

  .layer--sticky.layer--top-left .layer__slot {
    top: calc(var(--layer-inset) + env(safe-area-inset-top, 0px));
    left: calc(var(--layer-inset) + env(safe-area-inset-left, 0px));
  }
  .layer--sticky.layer--top-right .layer__slot {
    top: calc(var(--layer-inset) + env(safe-area-inset-top, 0px));
    right: calc(var(--layer-inset) + env(safe-area-inset-right, 0px));
  }
  .layer--sticky.layer--top-center .layer__slot {
    top: calc(var(--layer-inset) + env(safe-area-inset-top, 0px));
    left: 0;
    right: 0;
    justify-content: center;
  }
  .layer--sticky.layer--bottom-right .layer__slot {
    bottom: calc(var(--layer-inset) + env(safe-area-inset-bottom, 0px));
    right: calc(var(--layer-inset) + env(safe-area-inset-right, 0px));
  }
  .layer--sticky.layer--bottom-center .layer__slot {
    bottom: calc(var(--layer-inset) + env(safe-area-inset-bottom, 0px));
    left: 0;
    right: 0;
    justify-content: center;
  }

  /* Narrow viewports: the panel moves to where the thumb is. */
  @media (max-width: 640px) {
    .layer--responsive:not(.layer--sticky) {
      top: auto;
      left: 0;
      right: 0;
      justify-content: center;
      bottom: calc(var(--layer-inset) + env(safe-area-inset-bottom, 0px));
    }
    /* Sticky cannot move to the bottom edge without leaving its strip, so
       it only re-centres horizontally. */
    .layer--sticky.layer--responsive .layer__slot {
      left: 0;
      right: 0;
      justify-content: center;
    }
  }

  /* Opacity only, explicitly no `filter`.
     A `filter` — even `blur(0)` — turns this element into a "backdrop
     root": everything behind the layer then stops counting as the backdrop,
     and the panel's `backdrop-filter` filters empty space. With
     `animation-fill-mode: both` that final state would stay for good, and
     the glass would be permanently blind. */
  @keyframes layer-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
