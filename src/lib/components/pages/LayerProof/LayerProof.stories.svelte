<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import LayerProof from "./LayerProof.svelte";
  import { DEMO_ITEMS, DEMO_ITEMS_SHORT } from "../../../data/items";

  const { Story } = defineMeta({
    title: "Pages/Backdrop stress test",
    component: LayerProof,
    tags: ["autodocs"],
    args: {
      signedIn: true,
      items: DEMO_ITEMS_SHORT,
      messageCount: 3,
      size: "md",
      placement: "top-right",
      strategy: "fixed",
    },
    argTypes: {
      signedIn: { control: "boolean" },
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
            "Scroll through seven backdrops while the panel stays put:\n\n" +
            "- **Photograph** — the normal case, plenty of detail\n" +
            "- **White** — the hardest case; the panel must not vanish\n" +
            "- **Saturated colour** — does the filter over-saturate it?\n" +
            "- **Dark** — the shadow disappears, the specular edge takes over\n" +
            "- **Fine grid** — does the blur produce moiré?\n" +
            "- **Stripes** — where the displacement is easiest to read\n" +
            "- **Body copy** — at what size does magnification turn into smear?\n\n" +
            "This is the story to open first when tuning `magnify`, `rim` and `blur` for a " +
            "real product: a value that looks right over one backdrop rarely survives all seven.",
        },
      },
    },
  });
</script>

<Story name="Seven backdrops" />

<Story
  name="Frosted, for comparison"
  args={{ refraction: false }}
  parameters={{
    docs: {
      description: {
        story:
          "The same seven backdrops without the displacement. Frosted glass is the safer " +
          "choice over body copy and the duller one over edges — this is where you decide " +
          "which trade you want.",
      },
    },
  }}
/>

<Story
  name="Every item, bottom centre"
  args={{ items: DEMO_ITEMS, placement: "bottom-center" }}
  parameters={{
    docs: {
      description: {
        story: "Widest bar, second placement, all seven backdrops. The worst case in one story.",
      },
    },
  }}
/>
