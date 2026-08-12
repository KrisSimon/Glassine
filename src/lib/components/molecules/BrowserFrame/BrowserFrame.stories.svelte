<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import BrowserFrame from "./BrowserFrame.svelte";

  const { Story } = defineMeta({
    title: "Molecules/BrowserFrame",
    component: BrowserFrame,
    tags: ["autodocs"],
    args: { url: "northbound.example", ratio: "16 / 9" },
    argTypes: {
      url: { control: "text" },
      ratio: { control: "text" },
    },
    parameters: {
      layout: "padded",
      docs: {
        description: {
          component:
            "A browser window for presentation only — no behaviour, no navigation. It earns " +
            "its place by answering \"where does this live?\" in slides and docs, which a " +
            "floating panel on a grey canvas never does.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import DemoSite from "../../templates/DemoSite/DemoSite.svelte";
</script>

<Story name="With a page inside">
  {#snippet template(args)}
    <BrowserFrame {...args}>
      <div style="position:absolute;inset:0;overflow:auto">
        <DemoSite footer={false} />
      </div>
    </BrowserFrame>
  {/snippet}
</Story>

<Story name="Empty" args={{ url: "app.northbound.example", ratio: "16 / 9" }}>
  {#snippet template(args)}
    <BrowserFrame {...args}>
      <div
        style="display:grid;place-items:center;height:100%;background:var(--l-canvas);
               color:var(--l-ink-300);font-size:13px"
      >
        Frame content
      </div>
    </BrowserFrame>
  {/snippet}
</Story>
