<!--
  Dev view (`npm run dev`): the layer in operation over a neutral demo page —
  colour fields, images, text. Storybook shows the parts; here you can
  scroll, tab and click.

  Deliberately without controls in the picture: what the layer does over
  someone else's page should be judgeable without foreign chrome in the
  frame. Variants belong in props and in Storybook, not in a toggle bar
  painted over the demo.
-->
<script lang="ts">
  import { DEMO_ITEMS_SHORT, DemoSiteOverlay } from "$lib";
</script>

<main class="stage">
  <DemoSiteOverlay
    items={DEMO_ITEMS_SHORT}
    messageCount={3}
    strategy="fixed"
    placement="top-right"
  />
</main>

<style>
  .stage {
    min-height: 100vh;
  }
</style>
