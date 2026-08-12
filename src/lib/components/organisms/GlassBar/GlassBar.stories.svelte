<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import GlassBar from "./GlassBar.svelte";
  import { DEMO_ITEMS, DEMO_ITEMS_SHORT } from "../../../data/items";

  const { Story } = defineMeta({
    title: "Organisms/GlassBar",
    component: GlassBar,
    tags: ["autodocs"],
    args: {
      items: DEMO_ITEMS_SHORT,
      messageCount: 3,
      size: "md",
      showMessages: true,
      showLogout: true,
      showTooltips: true,
      maxVisible: 7,
    },
    argTypes: {
      size: { control: "inline-radio", options: ["sm", "md", "lg"] },
      messageCount: { control: { type: "range", min: 0, max: 30, step: 1 } },
      maxVisible: { control: { type: "range", min: 1, max: 7, step: 1 } },
      refraction: { control: "inline-radio", options: ["auto", true, false] },
      showMessages: { control: "boolean" },
      showLogout: { control: "boolean" },
      showTooltips: { control: "boolean" },
      onopenitem: { action: "openitem" },
      onopenmessages: { action: "openmessages" },
      onlogout: { action: "logout" },
    },
    parameters: {
      docs: {
        description: {
          component:
            "A row of controls on a `GlassSurface`. Order is meaning: on the left what you " +
            "need daily; on the right, behind the slit of light, what you want rarely and " +
            "never by accident.\n\n" +
            "**Keyboard:** a toolbar in the WAI-ARIA sense. Tab moves *into* the bar (exactly " +
            "one tab stop), arrow keys move *within* it, Home/End jump to the ends. An extra " +
            "layer must not cost keyboard users one tab stop per control.\n\n" +
            "**Switch the backdrop in the toolbar above** — the panel has to hold over photo, " +
            "white, saturated colour and dark alike.",
        },
      },
    },
  });
</script>

<Story name="Default" />

<Story
  name="Every item"
  args={{ items: DEMO_ITEMS }}
  parameters={{
    docs: {
      description: {
        story: "The full set. Does the panel get too wide for a page header at this length?",
      },
    },
  }}
/>

<Story
  name="Collapsed"
  args={{ items: DEMO_ITEMS, maxVisible: 4 }}
  parameters={{
    docs: {
      description: {
        story:
          "Past `maxVisible` the remainder moves behind one control instead of letting the " +
          "bar grow. The tooltip says how many are waiting there.",
      },
    },
  }}
/>

<Story
  name="No counter"
  args={{ messageCount: 0 }}
  parameters={{
    docs: {
      description: {
        story: "No counter, no accent: with nothing new the bar is entirely neutral.",
      },
    },
  }}
/>

<Story
  name="Two items"
  args={{ items: DEMO_ITEMS_SHORT.slice(0, 2) }}
  parameters={{
    docs: {
      description: {
        story: "Short is the common case. It still has to read as one panel, not as two balls.",
      },
    },
  }}
/>

<Story
  name="Without sign out"
  args={{ showLogout: false }}
  parameters={{
    docs: {
      description: {
        story:
          "For embeddings where the host page owns the session — the bar must not offer a " +
          "second, divergent way out.",
      },
    },
  }}
/>

<Story
  name="Frosted"
  args={{ refraction: false }}
  parameters={{
    docs: {
      description: {
        story:
          "The same bar without the displacement. Worth flipping back and forth over the test " +
          "chart: what does the solid block buy over plain blur, and what does it cost in calm?",
      },
    },
  }}
/>

<Story name="Sizes" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div style="display:grid;gap:18px;justify-items:end">
      <GlassBar items={DEMO_ITEMS_SHORT} messageCount={3} size="sm" />
      <GlassBar items={DEMO_ITEMS_SHORT} messageCount={3} size="md" />
      <GlassBar items={DEMO_ITEMS_SHORT} messageCount={3} size="lg" />
    </div>
  {/snippet}
</Story>
