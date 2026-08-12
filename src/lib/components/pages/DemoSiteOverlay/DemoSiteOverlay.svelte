<!--
  PAGE · DemoSiteOverlay
  The glass layer over a neutral demo page: colour fields, images, text.
  Real, living DOM that scrolls and wraps rather than a screenshot.

  This is the honest test bench. Judge a panel over your own brand and you
  are judging the brand as much as the glass.

  Note the strategy: `fixed` (or `sticky`) is what makes the panel stay put
  while the page scrolls underneath it. With `absolute` the panel scrolls
  away with the content, which is only what you want for a static shot.
-->
<script lang="ts">
  import WebsiteScaffold from "../../templates/WebsiteScaffold/WebsiteScaffold.svelte";
  import DemoSite from "../../templates/DemoSite/DemoSite.svelte";
  import GlassBar from "../../organisms/GlassBar/GlassBar.svelte";
  import { DEMO_ITEMS_SHORT } from "../../../data/items";
  import type { GlassSize, LauncherItem, LayerPlacement } from "../../../types";

  interface Props {
    /** Render the layer at all? */
    signedIn?: boolean;
    items?: LauncherItem[];
    messageCount?: number;
    size?: GlassSize;
    placement?: LayerPlacement;
    /** `fixed` pins to the viewport, `sticky` to the scroll container. */
    strategy?: "fixed" | "sticky" | "absolute";
    /** Refraction like a solid block of glass — `false` gives frosted glass. */
    refraction?: boolean | "auto";
    /** Magnification of the backdrop under the panel (1 = none). */
    magnify?: number;
    siteName?: string;
  }

  let {
    signedIn = true,
    items = DEMO_ITEMS_SHORT,
    messageCount = 3,
    size = "md",
    placement = "top-right",
    strategy = "fixed",
    refraction = "auto",
    magnify,
    siteName = "Northbound",
  }: Props = $props();
</script>

<WebsiteScaffold {signedIn} {placement} {strategy} inset={20}>
  {#snippet content()}
    <DemoSite {siteName} />
  {/snippet}

  {#snippet layer()}
    <GlassBar {items} {messageCount} {size} {refraction} {magnify} />
  {/snippet}
</WebsiteScaffold>
