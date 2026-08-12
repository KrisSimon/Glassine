<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import WebsiteScaffold from "./WebsiteScaffold.svelte";
  import GlassBar from "../../organisms/GlassBar/GlassBar.svelte";
  import DemoSite from "../DemoSite/DemoSite.svelte";
  import { DEMO_ITEMS_SHORT } from "../../../data/items";

  const { Story } = defineMeta({
    title: "Templates/WebsiteScaffold",
    component: WebsiteScaffold,
    tags: ["autodocs"],
    args: { signedIn: true, placement: "top-right", strategy: "fixed", inset: 20 },
    argTypes: {
      signedIn: { control: "boolean" },
      strategy: { control: "inline-radio", options: ["fixed", "sticky", "absolute"] },
      placement: {
        control: "select",
        options: ["top-right", "top-left", "top-center", "bottom-right", "bottom-center"],
      },
    },
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Two layers, cleanly separated: `content` is the page and knows nothing about what " +
            "sits above it; `layer` is a single element in the page template.\n\n" +
            "`signedIn = false` is the whole integration promise — no element in the DOM, and " +
            "the page is exactly what it was before.\n\n" +
            "With `strategy=\"sticky\"` and a top placement the scaffold renders the layer " +
            "*before* the content: a sticky strip has to sit at the start of the scroll " +
            "container to pin itself to its top edge.",
        },
      },
    },
  });
</script>

<Story name="With the layer">
  {#snippet template(args)}
    <WebsiteScaffold {...args}>
      {#snippet content()}
        <DemoSite />
      {/snippet}
      {#snippet layer()}
        <GlassBar items={DEMO_ITEMS_SHORT} messageCount={3} />
      {/snippet}
    </WebsiteScaffold>
  {/snippet}
</Story>

<Story
  name="Without the layer"
  args={{ signedIn: false }}
  parameters={{
    docs: {
      description: {
        story: "Condition not met, nothing rendered — the page is byte-for-byte the old one.",
      },
    },
  }}
>
  {#snippet template(args)}
    <WebsiteScaffold {...args}>
      {#snippet content()}
        <DemoSite />
      {/snippet}
      {#snippet layer()}
        <GlassBar items={DEMO_ITEMS_SHORT} messageCount={3} />
      {/snippet}
    </WebsiteScaffold>
  {/snippet}
</Story>
