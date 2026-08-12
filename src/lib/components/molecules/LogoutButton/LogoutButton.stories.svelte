<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import LogoutButton from "./LogoutButton.svelte";

  const { Story } = defineMeta({
    title: "Molecules/LogoutButton",
    component: LogoutButton,
    tags: ["autodocs"],
    args: { size: "md", label: "Sign out" },
    argTypes: {
      size: { control: "inline-radio", options: ["sm", "md", "lg"] },
      label: { control: "text" },
      onlogout: { action: "logout" },
    },
    parameters: {
      docs: {
        description: {
          component:
            "Quiet at rest, accented on hover. Its protection against mis-clicks comes from " +
            "the distance around it — the `GlassDivider` and the gaps either side — rather " +
            "than from a warning colour that would shout on every page load.",
        },
      },
    },
  });
</script>

<Story name="Default" />

<Story name="Sizes" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div style="display:flex;align-items:center;gap:18px">
      {#each ["sm", "md", "lg"] as size (size)}
        <LogoutButton size={size as never} />
      {/each}
    </div>
  {/snippet}
</Story>
