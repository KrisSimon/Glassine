<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import DemoSiteOverlay from "./DemoSiteOverlay.svelte";
  import { DEMO_ITEMS, DEMO_ITEMS_SHORT } from "../../../data/items";

  const { Story } = defineMeta({
    title: "Pages/Overlay on a page",
    component: DemoSiteOverlay,
    tags: ["autodocs"],
    args: {
      signedIn: true,
      items: DEMO_ITEMS_SHORT,
      messageCount: 3,
      size: "md",
      placement: "top-right",
      strategy: "fixed",
      siteName: "Northbound",
    },
    argTypes: {
      signedIn: { control: "boolean" },
      siteName: { control: "text" },
      messageCount: { control: { type: "range", min: 0, max: 30, step: 1 } },
      size: { control: "inline-radio", options: ["sm", "md", "lg"] },
      placement: {
        control: "select",
        options: ["top-right", "top-left", "top-center", "bottom-right", "bottom-center"],
      },
      strategy: { control: "inline-radio", options: ["fixed", "sticky", "absolute"] },
      refraction: { control: "inline-radio", options: ["auto", true, false] },
      magnify: { control: { type: "range", min: 1, max: 2, step: 0.02 } },
    },
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "The layer over a page it knows nothing about: colour fields, images, text.\n\n" +
            "**Scroll it.** The panel stays where it is while hero, swatches, body copy, grid " +
            "and dark footer pass underneath it in turn — that is the whole point of the " +
            "component, and the only way to judge whether it holds. `strategy=\"fixed\"` is " +
            "what pins it; switch to `absolute` and it scrolls away with the content.",
        },
      },
    },
  });
</script>

<Story name="Default" />

<Story
  name="Every item"
  args={{ items: DEMO_ITEMS }}
  parameters={{
    docs: {
      description: {
        story: "The full set — a width test over someone else's material.",
      },
    },
  }}
/>

<Story
  name="Bottom centre"
  args={{ placement: "bottom-center" }}
  parameters={{
    docs: {
      description: {
        story:
          "The other placement worth considering. Here the panel sits over the dark footer " +
          "rather than the hero — a different backdrop, and a harder one for the shadow.",
      },
    },
  }}
/>

<Story
  name="Sticky instead of fixed"
  args={{ strategy: "sticky" }}
  parameters={{
    docs: {
      description: {
        story:
          "Pinned to the scroll container rather than the window. Indistinguishable here, " +
          "because the page *is* the scroll container — but it is what you need as soon as " +
          "the overlay lives inside a modal, a pane or an embedded frame.",
      },
    },
  }}
/>

<Story
  name="Frosted, for comparison"
  args={{ refraction: false }}
  parameters={{
    docs: {
      description: {
        story:
          "Same page, same bar, no displacement. Scroll through it beside the default view: " +
          "what does the solid block gain over plain blur, and what does it cost in calm?",
      },
    },
  }}
/>

<Story
  name="Without the layer"
  args={{ signedIn: false }}
  parameters={{
    docs: {
      description: {
        story: "The control shot: the page, unchanged.",
      },
    },
  }}
/>
