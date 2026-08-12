<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import BackdropStage from "./BackdropStage.svelte";
  import {
    BACKDROPS,
    BACKDROP_LABELS,
    BACKDROP_NAMES,
    type BackdropName,
  } from "./backdrops";

  const { Story } = defineMeta({
    title: "Backdrops",
    component: BackdropStage,
    tags: ["autodocs"],
    args: { backdrop: "probe", height: "420px", caption: true },
    argTypes: {
      backdrop: {
        control: "select",
        options: BACKDROP_NAMES,
        labels: BACKDROP_LABELS,
      },
      height: { control: "text" },
      caption: { control: "boolean" },
    },
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "The backdrops themselves, without any glass on top — because half of judging a " +
            "glass panel is knowing what is underneath it.\\n\\n" +
            "One catalogue drives all of this: the **Backdrop** toolbar, the `backdrop` control " +
            "on the playground stories, and the pixel-aligned copy that `GlassSurface` filters " +
            "in echo mode. It lives in `src/lib/stories/backdrops.ts`.\\n\\n" +
            "### Why every backdrop is a CSS background\\n\\n" +
            "Not a stylistic choice. Where an engine refuses to filter a real backdrop — WebKit " +
            "inside an iframe, which is to say Storybook, and Gecko anywhere — `GlassSurface` " +
            "filters a *copy* instead, and it can only copy something expressible as a " +
            "`background`. A backdrop built out of DOM would silently fall back to frosted " +
            "glass in those engines, and you would spend an afternoon wondering why.\\n\\n" +
            "That is also why the text and layout backdrops are SVG files rather than markup: " +
            "they need to be images to be copyable, and they need to be at original scale so " +
            "12px labels stay 12px.\\n\\n" +
            "### Adding your own\\n\\n" +
            "Add an entry to `BACKDROPS` with a `title`, a `group`, a `note` and any of " +
            "`color` / `image` / `size` / `repeat` / `position`. It appears in the toolbar, in " +
            "every `backdrop` control and in the gallery below, with no other change.",
        },
      },
    },
  });

  const GROUPS = ["Structure", "Text & layout", "Images", "Flat"] as const;

  function inGroup(group: string): BackdropName[] {
    return BACKDROP_NAMES.filter((name) => BACKDROPS[name].group === group);
  }
</script>

<Story name="One backdrop">
  {#snippet template(args)}
    <BackdropStage {...args} />
  {/snippet}
</Story>

<Story
  name="Gallery"
  parameters={{
    controls: { disable: true },
    docs: {
      description: {
        story: "All of them, grouped. Every tile says what it is there to test.",
      },
    },
  }}
>
  {#snippet template()}
    <div class="gallery">
      {#each GROUPS as group (group)}
        <section>
          <h2 class="gallery__title">{group}</h2>
          {#each inGroup(group) as backdrop (backdrop)}
            <BackdropStage {backdrop} height="220px" />
          {/each}
        </section>
      {/each}
    </div>
  {/snippet}
</Story>

<style>
  .gallery {
    display: flex;
    flex-direction: column;
  }

  .gallery__title {
    margin: 0;
    padding: 14px 18px;
    background: #16161a;
    color: #fff;
    font-family: var(--l-font-sans, "Helvetica Neue", Helvetica, Arial, sans-serif);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
</style>
