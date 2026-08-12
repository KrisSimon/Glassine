<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import GlassLayer from "./GlassLayer.svelte";
  import GlassBar from "../../organisms/GlassBar/GlassBar.svelte";
  import { DEMO_ITEMS_SHORT } from "../../../data/items";

  const { Story } = defineMeta({
    title: "Templates/GlassLayer",
    component: GlassLayer,
    tags: ["autodocs"],
    args: {
      placement: "top-right",
      strategy: "absolute",
      inset: 20,
      responsive: true,
    },
    argTypes: {
      placement: {
        control: "select",
        options: ["top-right", "top-left", "top-center", "bottom-right", "bottom-center"],
      },
      strategy: { control: "inline-radio", options: ["fixed", "sticky", "absolute"] },
      inset: { control: { type: "range", min: 0, max: 64, step: 2 } },
      responsive: { control: "boolean" },
    },
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "The layer itself — not its content. It only decides *where* the panel sits and " +
            "that it stays there; what goes inside is brought by the organisms. The layer " +
            "intercepts no pointer events, only its children do, so the page underneath stays " +
            "fully usable.\n\n" +
            "### Choosing a strategy\n\n" +
            "| `strategy` | Pinned to | Use when |\n| --- | --- | --- |\n" +
            "| `fixed` | the viewport | the page itself scrolls. The default and the usual case. |\n" +
            "| `sticky` | the nearest scrolling ancestor | the overlay lives inside a scroll container — a modal, a preview pane, an embedded frame. `fixed` would escape it and pin to the window. |\n" +
            "| `absolute` | the parent element | nothing scrolls; static shots and mock-ups. |\n\n" +
            "`sticky` has one requirement the other two do not: the layer has to be the *first* " +
            "child of the scroll container for a top placement, and the last for a bottom one. " +
            "It stays in flow as a zero-height strip out of which the panel overhangs. " +
            "`WebsiteScaffold` arranges that for you.\n\n" +
            "### On narrow viewports\n\n" +
            "Below 640px `responsive` moves the panel to bottom centre, where the thumb is. " +
            "A sticky layer cannot leave its strip, so it only re-centres horizontally.\n\n" +
            "### Placement never uses a transform\n\n" +
            "Centred placements stretch the layer edge to edge and let flex do the centring, " +
            "rather than `translateX(-50%)`. A transform here would sit *above* the glass, and " +
            "in echo refraction any transform above the backdrop copy re-anchors it from the " +
            "viewport to the transformed element — the panel would then show a slice of " +
            "backdrop from the wrong place. See `GlassSurface`.\n\n" +
            "### Why the entrance animation removes itself\n\n" +
            "Worth knowing if you build your own layer: the entrance animation is cleared once " +
            "it has finished, and that is not tidiness. An element carrying an animation — or a " +
            "`filter`, or `opacity < 1` — becomes a *backdrop root*, and everything behind it " +
            "stops counting as the backdrop of its children. The panel's `backdrop-filter` " +
            "would then filter empty space, silently. The animation fades `opacity` only, and " +
            "an 800ms timer clears it even if `animationend` never fires — a background tab, " +
            "or reduced motion suppressing the animation entirely.\n\n" +
            "### Using it in your own project\n\n" +
            "```svelte\n" +
            "<GlassLayer placement=\"top-right\" strategy=\"fixed\">\n" +
            "  <GlassBar {items} />\n" +
            "</GlassLayer>\n" +
            "```\n\n" +
            "Stacking order comes from `--z-glass-layer` (default `1000`); set it on `:root` to " +
            "slot the overlay into your own z-index scale.",
        },
      },
    },
  });
</script>

<Story name="Placement">
  {#snippet template(args)}
    <div class="stage">
      <GlassLayer {...args}>
        <GlassBar items={DEMO_ITEMS_SHORT} messageCount={3} />
      </GlassLayer>
      <p class="stage__hint">The page below — untouched.</p>
    </div>
  {/snippet}
</Story>

<Story
  name="Sticky in a scroll container"
  args={{ strategy: "sticky", placement: "top-right" }}
  parameters={{
    docs: {
      description: {
        story:
          "The box below scrolls on its own. Scroll inside it: the panel stays pinned to the " +
          "top of the *container*, not to the window. This is the case `fixed` cannot serve — " +
          "a fixed layer would break out of the box and stick to the viewport instead.\n\n" +
          "A sticky top layer has to be the first child of the scroll container, which is what " +
          "`WebsiteScaffold` arranges for you.",
      },
    },
  }}
>
  {#snippet template(args)}
    <div class="scroller">
      <GlassLayer {...args}>
        <GlassBar items={DEMO_ITEMS_SHORT} messageCount={3} />
      </GlassLayer>
      {#each ["photo-01", "photo-03", "photo-05", "photo-02", "photo-04"] as image (image)}
        <div class="scroller__band" style="background-image:url('/backdrops/{image}.svg')"></div>
      {/each}
    </div>
  {/snippet}
</Story>

<style>
  .stage {
    position: relative;
    min-height: 420px;
    background: url("/backdrops/photo-01.svg") center / cover no-repeat;
  }

  .stage__hint {
    position: absolute;
    left: 24px;
    bottom: 20px;
    margin: 0;
    padding: 6px 12px;
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.55);
    color: #fff;
    font-size: 12px;
  }

  .scroller {
    height: 460px;
    overflow-y: auto;
    border-radius: 12px;
  }

  .scroller__band {
    height: 260px;
    background-size: cover;
    background-position: center;
  }
</style>
