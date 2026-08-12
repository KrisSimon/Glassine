<!--
  TEMPLATE · WebsiteScaffold
  Two layers, cleanly separated:

    content — the page itself. Untouched; it knows nothing about the layer
              above it.
    layer   — the glass layer, mounted as a single element in the page
              template.

  That separation is the whole integration promise: drop `signedIn` (or
  whatever condition applies) and the layer is simply not rendered — the
  page below looks exactly as it did before.

  With `strategy="sticky"` and a top placement the layer is rendered *before*
  the content: a sticky strip has to sit at the start of the scroll
  container to pin itself to its top edge.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import GlassLayer from "../GlassLayer/GlassLayer.svelte";
  import type { LayerPlacement } from "../../../types";

  interface Props {
    /** Render the layer at all? */
    signedIn?: boolean;
    placement?: LayerPlacement;
    strategy?: "fixed" | "sticky" | "absolute";
    inset?: number;
    content?: Snippet;
    layer?: Snippet;
  }

  let {
    signedIn = true,
    placement = "top-right",
    strategy = "fixed",
    inset = 20,
    content,
    layer,
  }: Props = $props();

  const layerFirst = $derived(strategy === "sticky" && placement.startsWith("top"));
</script>

<div class="scaffold">
  {#snippet glass()}
    <GlassLayer {placement} {strategy} {inset}>
      {@render layer?.()}
    </GlassLayer>
  {/snippet}

  {#if signedIn && layerFirst}
    {@render glass()}
  {/if}

  <div class="scaffold__content">
    {@render content?.()}
  </div>

  {#if signedIn && !layerFirst}
    {@render glass()}
  {/if}
</div>

<style>
  .scaffold {
    position: relative;
    isolation: isolate;
    min-height: 100%;
  }

  .scaffold__content {
    position: relative;
    z-index: var(--z-content, 1);
  }
</style>
