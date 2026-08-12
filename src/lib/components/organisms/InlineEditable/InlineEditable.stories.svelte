<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import InlineEditable from "./InlineEditable.svelte";

  const { Story } = defineMeta({
    title: "Organisms/InlineEditable",
    component: InlineEditable,
    tags: ["autodocs"],
    args: { value: "Northbound Studio", label: "Company name", multiline: false },
    argTypes: {
      multiline: { control: "boolean" },
      onsave: { action: "save" },
    },
    parameters: {
      layout: "padded",
      docs: {
        description: {
          component:
            "Editing without an edit button: hovering reveals the glass pen, a click turns the " +
            "text into an input in place. Enter commits · Esc discards · clicking away commits " +
            "as well. No save dialog — just a short confirmation on the element itself.\n\n" +
            "Nothing jumps, because the input and the text share font size, line height and " +
            "position. That is most of the work; the rest is a `contenteditable`-free state " +
            "machine with four states.",
        },
      },
    },
  });
</script>

<Story name="Single line">
  {#snippet template(args)}
    <div class="card">
      <h2 class="card__title"><InlineEditable {...args} /></h2>
    </div>
  {/snippet}
</Story>

<Story
  name="Multiline"
  args={{
    multiline: true,
    label: "Description",
    value:
      "An independent practice for identity, interface and interaction design — working with organisations from twelve people to twelve thousand.",
  }}
  parameters={{
    docs: {
      description: {
        story: "Multiline commits on ⌘ + Enter, so that Enter still makes a paragraph.",
      },
    },
  }}
>
  {#snippet template(args)}
    <div class="card">
      <p class="card__text"><InlineEditable {...args} /></p>
    </div>
  {/snippet}
</Story>

<Story name="Empty" args={{ value: "", placeholder: "Not filled in yet" }}>
  {#snippet template(args)}
    <div class="card">
      <p class="card__text"><InlineEditable {...args} /></p>
    </div>
  {/snippet}
</Story>

<style>
  .card {
    max-width: 52ch;
    padding: 22px 26px;
    background: #fff;
    border-radius: 12px;
    border: 1px solid var(--l-line, #e4e3e0);
    color: var(--brand-ink);
  }

  .card__title {
    margin: 0;
    font-size: 24px;
    letter-spacing: -0.02em;
  }

  .card__text {
    margin: 0;
    font-size: 15px;
    line-height: 1.6;
    color: var(--brand-ink-muted);
  }
</style>
