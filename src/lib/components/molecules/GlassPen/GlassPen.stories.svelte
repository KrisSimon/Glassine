<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import GlassPen from "./GlassPen.svelte";

  const { Story } = defineMeta({
    title: "Molecules/GlassPen",
    component: GlassPen,
    tags: ["autodocs"],
    args: { size: "md", visible: true, label: "Edit company name" },
    argTypes: {
      size: { control: "inline-radio", options: ["sm", "md", "lg"] },
      visible: { control: "boolean" },
      onedit: { action: "edit" },
    },
    parameters: {
      docs: {
        description: {
          component:
            "The same glass surface as the bar, only small — which is the whole argument for " +
            "having one `GlassSurface` rather than three separate effects.\n\n" +
            "`visible = false` is the normal state: it appears on hover, and stays put on " +
            "touch devices, where there is no hover to reveal it.",
        },
      },
    },
  });
</script>

<Story name="Visible" />

<Story
  name="In running text"
  args={{ visible: false }}
  parameters={{
    layout: "padded",
    docs: {
      description: {
        story: "Move over the line — the pen arrives without anything jumping.",
      },
    },
  }}
>
  {#snippet template(args)}
    <div class="line">
      <span>Northbound Studio</span>
      <GlassPen {...args} />
    </div>
  {/snippet}
</Story>

<Story name="Sizes" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div style="display:flex;align-items:center;gap:20px">
      {#each ["sm", "md", "lg"] as size (size)}
        <GlassPen size={size as never} visible label="Edit" />
      {/each}
    </div>
  {/snippet}
</Story>

<style>
  .line {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 18px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.94);
    font-size: 22px;
    font-weight: 700;
    color: var(--brand-ink);
  }

  .line:hover :global(.pen) {
    opacity: 1;
  }

  .line:hover :global(.pen__pop) {
    transform: scale(1);
  }
</style>
