<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Dock from "./Dock.svelte";
  import { DEMO_DOCK } from "../../../data/items";

  const { Story } = defineMeta({
    title: "Organisms/Dock",
    component: Dock,
    tags: ["autodocs"],
    args: {
      items: DEMO_DOCK,
      size: 52,
      gap: 8,
      magnification: 1.8,
      spread: 2.2,
      easing: 0.3,
      showLabels: true,
      refraction: "auto",
    },
    argTypes: {
      size: { control: { type: "range", min: 32, max: 96, step: 2 } },
      gap: { control: { type: "range", min: 0, max: 24, step: 1 } },
      magnification: { control: { type: "range", min: 1, max: 3, step: 0.05 } },
      spread: { control: { type: "range", min: 0.6, max: 5, step: 0.1 } },
      easing: { control: { type: "range", min: 0.08, max: 1, step: 0.02 } },
      showLabels: { control: "boolean" },
      refraction: { control: "inline-radio", options: ["auto", true, false] },
      items: { control: "object" },
      onactivate: { action: "activate" },
    },
    parameters: {
      docs: {
        description: {
          component:
            "A macOS-style dock — the clearest demonstration of what `GlassSurface` is for. " +
            "Move the pointer across it: tiles magnify, push their neighbours aside, and the " +
            "plate widens to make room for them.\\n\\n" +
            "### Three decisions carry it\\n\\n" +
            "**The tiles live outside the glass.** `GlassSurface` clips its content — it must, " +
            "because the refraction is drawn inside it — so a magnified tile placed inside " +
            "would be sliced off at the top edge. The plate is a *sibling* of the row, " +
            "absolutely positioned behind it, and the row keeps headroom above itself.\\n\\n" +
            "**The row\'s layout never changes, but the plate still grows.** Growing the slot " +
            "widths and letting flexbox absorb it feeds back on itself: the row widens, a " +
            "centred dock\'s left edge shifts, the pointer offset measured against that edge " +
            "changes, and the tiles shiver. So the slots stay fixed, magnification is a " +
            "`transform`, and the push is computed. The plate is then the *union of where the " +
            "tiles ended up* — which grows outward past the row exactly as the real dock " +
            "does, with no feedback path.\\n\\n" +
            "**One value drives one frame.** The pointer is smoothed in JavaScript with `easing`, " +
            "and scales, offsets and plate geometry all derive from it. CSS transitions were " +
            "the first attempt and the wrong tool: every pointer event retargets a transition " +
            "that is still running, and the plate — whose width is a layout property — cannot " +
            "be transitioned in step with the tiles, whose transform is not. The two drift " +
            "apart and the dock tears.\\n\\n" +
            "One thing had to be fixed in `GlassSurface` before any of this was possible: a " +
            "plate whose width changes every frame used to rebuild its entire SVG filter every " +
            "frame. The committed size now settles first (~120ms), and the stale filter keeps " +
            "drawing correctly in the meantime because its maps stretch to the element.\\n\\n" +
            "### Behaviour\\n\\n" +
            "- A cosine falloff, so the outermost affected tile eases to rest instead of " +
            "snapping\\n" +
            "- Running-app dots that travel with their tile without scaling with it\\n" +
            "- Unread badges, and a separator before the trailing group\\n" +
            "- Click to bounce (the bounce animates `bottom`, not `transform` — the transform " +
            "is already carrying the magnification)\\n" +
            "- **Keyboard:** a toolbar. One tab stop in, arrows within, Home/End to the ends — " +
            "and focus magnifies too, so keyboard users get the same affordance\\n" +
            "- Magnification switches itself off on `(hover: none)`, where there is no pointer " +
            "to magnify against\\n\\n" +
            "Switch the **backdrop** in the toolbar: a dock over a photograph is the case this " +
            "surface was built for.",
        },
      },
    },
  });

</script>

<script lang="ts">
  import DemoSite from "../../templates/DemoSite/DemoSite.svelte";
  import WebsiteScaffold from "../../templates/WebsiteScaffold/WebsiteScaffold.svelte";
</script>

<Story name="Default" />

<Story
  name="On a desktop"
  parameters={{
    layout: "fullscreen",
    controls: { disable: true },
    docs: {
      description: {
        story:
          "The real arrangement: parked at the bottom of the screen over a photograph, which " +
          "is where a dock earns its glass. Note how the saturation pulls colour out of the " +
          "wallpaper into the plate — that, more than the blur, is what stops it looking " +
          "pasted on.",
      },
    },
  }}
>
  {#snippet template()}
    <div class="desktop">
      <div class="desktop__dock">
        <Dock items={DEMO_DOCK} />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Over a scrolling page"
  parameters={{
    layout: "fullscreen",
    controls: { disable: true },
    docs: {
      description: {
        story:
          "The dock parked at bottom centre with `GlassLayer`, over a page that scrolls. " +
          "Scroll it: the dock stays put while hero, colour, body copy and dark footer pass " +
          "underneath — every one of them a different problem for the same plate.",
      },
    },
  }}
>
  {#snippet template()}
    <WebsiteScaffold placement="bottom-center" strategy="fixed" inset={16}>
      {#snippet content()}
        <DemoSite />
      {/snippet}
      {#snippet layer()}
        <Dock items={DEMO_DOCK} size={48} />
      {/snippet}
    </WebsiteScaffold>
  {/snippet}
</Story>

<Story
  name="Without magnification"
  args={{ magnification: 1 }}
  parameters={{
    docs: {
      description: {
        story:
          "The control experiment. Still a dock, and arguably a calmer one — but the sense of " +
          "the tiles being physical objects on a shelf goes with it.",
      },
    },
  }}
/>

<Story
  name="Small and quiet"
  args={{ size: 38, gap: 6, magnification: 1.45, spread: 1.6, showLabels: false }}
  parameters={{
    docs: {
      description: {
        story:
          "Toned down for an application chrome rather than an operating system: smaller " +
          "tiles, a gentler peak and a narrower spread, so it reads as a toolbar that happens " +
          "to respond rather than as a piece of theatre.",
      },
    },
  }}
/>

<Story
  name="Heavier easing"
  args={{ easing: 0.14 }}
  parameters={{
    docs: {
      description: {
        story:
          "`easing` is how much of the remaining distance the dock covers each frame. Lower " +
          "values give the tiles weight; much below this they stop feeling attached to the " +
          "pointer at all. `1` removes the smoothing entirely and tracks the pointer exactly, " +
          "which is crisp but slightly brittle over a busy backdrop.",
      },
    },
  }}
/>

<Story
  name="Large"
  args={{ size: 72, magnification: 2.1, spread: 2.6 }}
  parameters={{
    docs: {
      description: {
        story: "Everything scales off `size` — tile radius, icon, plate radius and headroom.",
      },
    },
  }}
/>

<Story
  name="Frosted plate"
  args={{ refraction: false }}
  parameters={{
    docs: {
      description: {
        story:
          "The plate without the displacement. Over a busy wallpaper this is often the better " +
          "call: the tiles are already the loud element, and a refracting plate underneath " +
          "competes with them.",
      },
    },
  }}
/>

<style>
  .desktop {
    position: relative;
    min-height: 560px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    background: url("/backdrops/photo-01.svg") center / cover no-repeat;
  }

  .desktop__dock {
    padding-bottom: 18px;
  }
</style>
