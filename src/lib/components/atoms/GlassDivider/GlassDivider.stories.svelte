<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import GlassDivider from "./GlassDivider.svelte";

  const { Story } = defineMeta({
    title: "Atoms/GlassDivider",
    component: GlassDivider,
    tags: ["autodocs"],
    args: { orientation: "vertical", length: 20 },
    argTypes: {
      orientation: { control: "inline-radio", options: ["vertical", "horizontal"] },
      length: { control: { type: "range", min: 8, max: 60, step: 2 } },
    },
    parameters: {
      docs: {
        description: {
          component:
            "Not a line but a slit of light, faded out at both ends so the panel does not fall " +
            "apart into two halves. Use it to set one control apart from the rest — though the " +
            "distance around it does far more than the slit itself.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import GlassSurface from "../GlassSurface/GlassSurface.svelte";
</script>

<Story name="In the glass">
  {#snippet template(args)}
    <GlassSurface shape="pill">
      <span style="display:flex;align-items:center;gap:12px;padding:10px 16px;font-size:12px">
        left
        <GlassDivider {...args} />
        right
      </span>
    </GlassSurface>
  {/snippet}
</Story>

<Story
  name="Both orientations"
  parameters={{ controls: { disable: true } }}
>
  {#snippet template()}
    <div style="display:flex;gap:28px;align-items:center">
      <GlassSurface shape="pill">
        <span style="display:flex;align-items:center;gap:12px;padding:10px 16px;font-size:12px">
          left <GlassDivider orientation="vertical" length={20} /> right
        </span>
      </GlassSurface>
      <GlassSurface shape="rounded">
        <span style="display:flex;flex-direction:column;gap:10px;padding:14px 18px;font-size:12px">
          above <GlassDivider orientation="horizontal" length={80} /> below
        </span>
      </GlassSurface>
    </div>
  {/snippet}
</Story>
