<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import GlassButton from "./GlassButton.svelte";

  const { Story } = defineMeta({
    title: "Atoms/GlassButton",
    component: GlassButton,
    tags: ["autodocs"],
    args: { label: "Profile", size: "md", tone: "neutral" },
    argTypes: {
      size: { control: "inline-radio", options: ["sm", "md", "lg"] },
      tone: { control: "inline-radio", options: ["neutral", "accent"] },
      disabled: { control: "boolean" },
      onclick: { action: "click" },
    },
    parameters: {
      docs: {
        description: {
          component:
            "The round control that sits *on* the glass — opaque enough to stay legible over " +
            "any backdrop, which the panel underneath deliberately is not.\n\nRenders as an " +
            "`<a>` as soon as an `href` is present: a shortcut into somewhere is a link, not a " +
            "button, and middle-click, copy-target and the status bar should all keep working. " +
            "`label` is required because the control carries nothing but an icon.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import Icon from "../Icon/Icon.svelte";
</script>

<Story name="Default">
  {#snippet template(args)}
    <GlassButton {...args}>
      <Icon name="user" size={18} />
    </GlassButton>
  {/snippet}
</Story>

<Story
  name="As a link"
  args={{ href: "#profile", label: "Profile" }}
  parameters={{
    docs: {
      description: {
        story: "With `href` the component renders an anchor and browser link behaviour returns.",
      },
    },
  }}
>
  {#snippet template(args)}
    <GlassButton {...args}>
      <Icon name="user" size={18} />
    </GlassButton>
  {/snippet}
</Story>

<Story name="Sizes" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div class="row">
      {#each [{ size: "sm", icon: 14 }, { size: "md", icon: 18 }, { size: "lg", icon: 22 }] as spec (spec.size)}
        <GlassButton label={spec.size} size={spec.size as never}>
          <Icon name="calendar" size={spec.icon} />
        </GlassButton>
      {/each}
    </div>
  {/snippet}
</Story>

<Story
  name="Accent tone"
  args={{ tone: "accent", label: "Sign out" }}
  parameters={{
    docs: {
      description: {
        story:
          "Quiet at rest, accented on hover. Reserve it for destructive actions — and note " +
          "that the real protection against mis-clicks is the distance around the control, not " +
          "its colour.",
      },
    },
  }}
>
  {#snippet template(args)}
    <GlassButton {...args}>
      <Icon name="power" size={17} />
    </GlassButton>
  {/snippet}
</Story>

<Story name="Disabled" args={{ disabled: true }}>
  {#snippet template(args)}
    <GlassButton {...args}>
      <Icon name="briefcase" size={18} />
    </GlassButton>
  {/snippet}
</Story>

<style>
  .row {
    display: flex;
    align-items: center;
    gap: 16px;
  }
</style>
