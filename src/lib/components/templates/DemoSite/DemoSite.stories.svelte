<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import DemoSite from "./DemoSite.svelte";

  const { Story } = defineMeta({
    title: "Templates/DemoSite",
    component: DemoSite,
    tags: ["autodocs"],
    args: { siteName: "Northbound", footer: true },
    argTypes: {
      siteName: { control: "text" },
      footer: { control: "boolean" },
    },
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "A neutral page to put underneath the glass layer: colour fields, images, text — " +
            "real DOM rather than a screenshot, so it scrolls and wraps.\n\n" +
            "Deliberately **not** built with the glass tokens. Judge a panel over your own " +
            "brand and you are judging the brand as much as the glass; here the backdrop has a " +
            "palette of its own.",
        },
      },
    },
  });
</script>

<Story name="Whole page" />

<Story
  name="Without the footer"
  args={{ footer: false }}
  parameters={{
    docs: {
      description: {
        story: "A shorter excerpt for image comparisons — without the dark footer.",
      },
    },
  }}
/>

<Story
  name="Two images only"
  args={{
    images: ["/backdrops/photo-05.svg", "/backdrops/photo-04.svg"],
    footer: false,
  }}
  parameters={{
    docs: {
      description: {
        story:
          "The images are swappable: here a dark hero over a bright, near-achromatic grid — " +
          "the two extreme cases stacked directly on top of each other.",
      },
    },
  }}
/>
