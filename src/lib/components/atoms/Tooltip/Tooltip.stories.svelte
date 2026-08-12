<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Tooltip from "./Tooltip.svelte";

  const { Story } = defineMeta({
    title: "Atoms/Tooltip",
    component: Tooltip,
    tags: ["autodocs"],
    args: { label: "Profile", placement: "bottom" },
    argTypes: {
      placement: { control: "inline-radio", options: ["top", "bottom"] },
    },
    parameters: {
      docs: {
        description: {
          component:
            "The plain-text label for an icon, purely declarative through `:hover` / " +
            "`:focus-within` — so it works while JavaScript is still loading.\n\nHidden on " +
            "devices without a pointer: there the `aria-label` carries the meaning, and a " +
            "tooltip left hanging around would only be in the way.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import GlassButton from "../GlassButton/GlassButton.svelte";
  import Icon from "../Icon/Icon.svelte";
</script>

<Story name="On a control">
  {#snippet template(args)}
    <Tooltip {...args}>
      <GlassButton label={args.label}>
        <Icon name="user" size={18} />
      </GlassButton>
    </Tooltip>
  {/snippet}
</Story>

<Story
  name="Placement"
  parameters={{ controls: { disable: true } }}
>
  {#snippet template()}
    <div style="display:flex;gap:40px;padding:40px 0">
      <Tooltip label="Above the control" placement="top">
        <GlassButton label="Above the control">
          <Icon name="bell" size={18} />
        </GlassButton>
      </Tooltip>
      <Tooltip label="Below the control" placement="bottom">
        <GlassButton label="Below the control">
          <Icon name="star" size={18} />
        </GlassButton>
      </Tooltip>
    </div>
  {/snippet}
</Story>
