<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Icon from "./Icon.svelte";
  import type { IconName } from "../../../types";

  const { Story } = defineMeta({
    title: "Atoms/Icon",
    component: Icon,
    tags: ["autodocs"],
    args: { name: "user", size: 24 },
    argTypes: {
      size: { control: { type: "range", min: 12, max: 64, step: 1 } },
    },
    parameters: {
      docs: {
        description: {
          component:
            "A small monoline set, sized for glass: 1.6px stroke on a 24 grid, because that " +
            "is what survives at 16px on a translucent surface where a hairline would dissolve " +
            "into the backdrop.\n\nNot a general-purpose icon library — just enough symbols " +
            "to build the demo compositions. Nothing else here depends on these particular " +
            "glyphs; render your own SVG into the same slots and everything keeps working.",
        },
      },
    },
  });

  const ALL: IconName[] = [
    "user", "calendar", "chart", "network", "broadcast", "briefcase",
    "inbox", "mail", "power", "pen", "grid", "search",
    "settings", "bell", "star", "heart", "play", "plus",
  ];
</script>

<Story name="Single" />

<Story name="The whole set" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <ul class="sheet">
      {#each ALL as name (name)}
        <li class="cell">
          <Icon {name} size={26} />
          <span>{name}</span>
        </li>
      {/each}
    </ul>
  {/snippet}
</Story>

<Story
  name="At real sizes"
  parameters={{
    controls: { disable: true },
    docs: {
      description: {
        story:
          "14 / 18 / 22 px are the sizes the glass controls actually use (sm / md / lg). " +
          "Below 14 the stroke starts closing up the counters.",
      },
    },
  }}
>
  {#snippet template()}
    <div class="row">
      {#each [12, 14, 18, 22, 32, 48] as size (size)}
        <figure class="spec">
          <Icon name="calendar" {size} />
          <figcaption>{size}px</figcaption>
        </figure>
      {/each}
    </div>
  {/snippet}
</Story>

<style>
  .sheet {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
    gap: 10px;
    margin: 0;
    padding: 16px;
    list-style: none;
    background: rgba(255, 255, 255, 0.92);
    border-radius: 12px;
    max-width: 620px;
  }

  .cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px 4px;
    border-radius: 8px;
    background: #fff;
    font-size: 10px;
    color: #55565a;
  }

  .row {
    display: flex;
    align-items: flex-end;
    gap: 22px;
    padding: 18px 22px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.92);
  }

  .spec {
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .spec figcaption {
    font-size: 10px;
    color: #55565a;
    font-variant-numeric: tabular-nums;
  }
</style>
