<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import CountBadge from "./CountBadge.svelte";

  const { Story } = defineMeta({
    title: "Atoms/CountBadge",
    component: CountBadge,
    tags: ["autodocs"],
    args: { count: 3, max: 99, label: "new messages" },
    argTypes: {
      count: { control: { type: "range", min: 0, max: 150, step: 1 } },
      max: { control: { type: "range", min: 9, max: 999, step: 10 } },
    },
    parameters: {
      docs: {
        description: {
          component:
            "A counter pinned to the corner of a control. The accent is the only colour on the " +
            "entire glass layer, which is exactly why it reads as a signal rather than as " +
            "decoration.\n\nAt `count = 0` the component renders nothing at all — an empty " +
            "badge is worse than no badge. It positions itself absolutely, so its parent needs " +
            "`position: relative`; `GlassButton` already provides that.",
        },
      },
    },
  });
</script>

<Story name="Default">
  {#snippet template(args)}
    <span class="host">
      <CountBadge {...args} />
    </span>
  {/snippet}
</Story>

<Story
  name="Steps"
  parameters={{
    controls: { disable: true },
    docs: {
      description: {
        story: "0 renders nothing; past `max` the number is abbreviated to `99+`.",
      },
    },
  }}
>
  {#snippet template()}
    <div style="display:flex;gap:20px">
      {#each [0, 1, 9, 42, 128] as count (count)}
        <span class="host">
          <CountBadge {count} />
        </span>
      {/each}
    </div>
  {/snippet}
</Story>

<style>
  .host {
    position: relative;
    display: inline-flex;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: var(--control-bg);
    border: var(--control-border);
    box-shadow: var(--control-shadow);
  }
</style>
