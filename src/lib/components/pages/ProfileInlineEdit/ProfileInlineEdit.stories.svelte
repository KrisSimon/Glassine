<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ProfileInlineEdit from "./ProfileInlineEdit.svelte";

  const { Story } = defineMeta({
    title: "Pages/Inline editing",
    component: ProfileInlineEdit,
    tags: ["autodocs"],
    parameters: {
      layout: "centered",
      docs: {
        description: {
          component:
            "The counter-test to the bar: the same glass surface at a different size. If both " +
            "together read as one system, the surface is a rule; if not, it is an effect " +
            "applied in one place.\n\nHover a line to reveal the pen, click to edit in place. " +
            "Enter commits · Esc discards · clicking away commits as well.",
        },
      },
    },
  });
</script>

<Story name="Profile card" />
