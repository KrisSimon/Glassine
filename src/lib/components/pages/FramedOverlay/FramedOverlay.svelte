<!--
  PAGE · FramedOverlay
  The glass layer shown in context: a browser window, a page inside it, the
  panel floating on top. Useful for slides and for the docs, because it
  answers the "where does this thing actually live?" question in one image.

  The frame scrolls internally, so the layer uses `strategy="sticky"`: a
  `fixed` layer would escape the frame and pin itself to the window.
-->
<script lang="ts">
  import BrowserFrame from "../../molecules/BrowserFrame/BrowserFrame.svelte";
  import WebsiteScaffold from "../../templates/WebsiteScaffold/WebsiteScaffold.svelte";
  import DemoSite from "../../templates/DemoSite/DemoSite.svelte";
  import GlassBar from "../../organisms/GlassBar/GlassBar.svelte";
  import { DEMO_ITEMS_SHORT } from "../../../data/items";
  import type { GlassSize, LauncherItem, LayerPlacement } from "../../../types";

  interface Props {
    signedIn?: boolean;
    items?: LauncherItem[];
    messageCount?: number;
    size?: GlassSize;
    placement?: LayerPlacement;
    url?: string;
    siteName?: string;
    /** Aspect ratio of the frame's viewport. */
    ratio?: string;
    caption?: boolean;
  }

  let {
    signedIn = true,
    items = DEMO_ITEMS_SHORT,
    messageCount = 3,
    size = "md",
    placement = "top-right",
    url = "northbound.example",
    siteName = "Northbound",
    ratio = "1440 / 810",
    caption = true,
  }: Props = $props();
</script>

<figure class="shot">
  <BrowserFrame {url} {ratio}>
    <div class="shot__scroll">
      <WebsiteScaffold {signedIn} {placement} strategy="sticky" inset={18}>
        {#snippet content()}
          <DemoSite {siteName} />
        {/snippet}

        {#snippet layer()}
          <GlassBar {items} {messageCount} {size} />
        {/snippet}
      </WebsiteScaffold>
    </div>
  </BrowserFrame>

  {#if caption}
    <figcaption class="shot__caption">
      The page below is untouched; the glass layer sits on top of it. Scroll
      inside the frame — the panel stays where it is while the backdrop
      changes underneath it.
    </figcaption>
  {/if}
</figure>

<style>
  .shot {
    margin: 0;
  }

  /* The frame is the scroll container — which is exactly why the layer
     inside it is sticky rather than fixed. */
  .shot__scroll {
    position: absolute;
    inset: 0;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .shot__caption {
    margin-top: 8px;
    max-width: 68ch;
    font-size: 12px;
    line-height: 1.6;
    color: var(--brand-ink-muted, #55565a);
  }
</style>
