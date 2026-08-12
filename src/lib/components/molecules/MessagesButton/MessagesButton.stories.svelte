<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import MessagesButton from "./MessagesButton.svelte";

  const { Story } = defineMeta({
    title: "Molecules/MessagesButton",
    component: MessagesButton,
    tags: ["autodocs"],
    args: { count: 3, size: "md", label: "Messages" },
    argTypes: {
      count: { control: { type: "range", min: 0, max: 120, step: 1 } },
      size: { control: "inline-radio", options: ["sm", "md", "lg"] },
      label: { control: "text" },
      onopen: { action: "open" },
    },
    parameters: {
      docs: {
        description: {
          component:
            "Messages with a counter. Worth its own icon rather than a dot somewhere on the " +
            "bar: \"3 new\" is usually the reason someone switches context at all, so it " +
            "should be readable at a glance.\n\nThe accessible name carries the count too, so " +
            "the badge is not the only place the information exists.",
        },
      },
    },
  });
</script>

<Story name="Three new" />

<Story name="Empty" args={{ count: 0 }} />

<Story name="Abbreviated" args={{ count: 128 }} />
