<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import LauncherButton from "./LauncherButton.svelte";
  import { DEMO_ITEMS } from "../../../data/items";

  const { Story } = defineMeta({
    title: "Molecules/LauncherButton",
    component: LauncherButton,
    tags: ["autodocs"],
    args: { item: DEMO_ITEMS[0], size: "md", showTooltip: true },
    argTypes: {
      size: { control: "inline-radio", options: ["sm", "md", "lg"] },
      showTooltip: { control: "boolean" },
      item: { control: "object" },
      onopen: { action: "open" },
    },
    parameters: {
      docs: {
        description: {
          component:
            "One shortcut into somewhere: icon, optional counter, plain-text label. Composed " +
            "from `Tooltip`, `GlassButton`, `Icon` and `CountBadge` — the point being that " +
            "none of those four knows about the others.\n\nPass an `onopen` handler and the " +
            "click is intercepted; leave it out and the `href` does its normal job.",
        },
      },
    },
  });
</script>

<Story name="Default" />

<Story
  name="With a counter"
  args={{ item: { ...DEMO_ITEMS[6], count: 2 } }}
  parameters={{
    docs: {
      description: {
        story: "Entries may carry their own counter — here two open requests.",
      },
    },
  }}
/>

<Story
  name="Without a tooltip"
  args={{ showTooltip: false }}
  parameters={{
    docs: {
      description: {
        story:
          "For dense bars. The `aria-label` stays either way, so the meaning survives even " +
          "when the plain text does not.",
      },
    },
  }}
/>

<Story name="The whole set" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div style="display:flex;gap:10px;padding:8px">
      {#each DEMO_ITEMS as item (item.id)}
        <LauncherButton {item} />
      {/each}
    </div>
  {/snippet}
</Story>
