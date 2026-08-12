<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import FramedOverlay from "./FramedOverlay.svelte";
  import { DEMO_ITEMS, DEMO_ITEMS_SHORT } from "../../../data/items";

  const { Story } = defineMeta({
    title: "Pages/Overlay in a frame",
    component: FramedOverlay,
    tags: ["autodocs"],
    args: {
      signedIn: true,
      items: DEMO_ITEMS_SHORT,
      messageCount: 3,
      size: "md",
      placement: "top-right",
      url: "northbound.example",
      siteName: "Northbound",
      caption: true,
    },
    argTypes: {
      signedIn: { control: "boolean" },
      caption: { control: "boolean" },
      url: { control: "text" },
      siteName: { control: "text" },
      ratio: { control: "text" },
      messageCount: { control: { type: "range", min: 0, max: 30, step: 1 } },
      size: { control: "inline-radio", options: ["sm", "md", "lg"] },
      placement: {
        control: "select",
        options: ["top-right", "top-left", "top-center", "bottom-right", "bottom-center"],
      },
    },
    parameters: {
      layout: "padded",
      docs: {
        description: {
          component:
            "The layer shown in context: a browser window, a page inside it, the panel on top. " +
            "Useful in slides and in docs, because it answers \"where does this thing actually " +
            "live?\" in one image.\n\n" +
            "**Scroll inside the frame.** The frame is its own scroll container, so the layer " +
            "uses `strategy=\"sticky\"`: a `fixed` layer would escape the frame and pin " +
            "itself to the browser window instead — the one case where `fixed` is the wrong " +
            "answer.",
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
        story: "The full set — a width test in a realistic viewport.",
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
          "Sticky also works from the bottom edge: the strip pins to the bottom of the frame " +
          "and the panel hangs upwards out of it.",
      },
    },
  }}
/>

<Story
  name="Without the layer"
  args={{ signedIn: false, caption: false }}
  parameters={{
    docs: {
      description: {
        story:
          "Condition not met and the layer disappears without a trace. This is the control " +
          "shot for \"what changes for everyone else?\" — nothing.",
      },
    },
  }}
/>
