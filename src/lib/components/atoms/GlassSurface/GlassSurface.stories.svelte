<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import GlassSurface from "./GlassSurface.svelte";
  import {
    BACKDROP_LABELS,
    BACKDROP_NAMES,
    type BackdropName,
  } from "../../../stories/backdrops";

  const { Story } = defineMeta({
    title: "Atoms/GlassSurface",
    component: GlassSurface,
    tags: ["autodocs"],
    argTypes: {
      shape: {
        control: "inline-radio",
        options: ["pill", "circle", "rounded", "square"],
        description: "Corner radius preset.",
      },
      radius: { control: "text", description: "Explicit radius; overrides `shape`." },
      elevation: { control: "inline-radio", options: ["flat", "raised", "floating"] },
      blur: { control: { type: "range", min: 0, max: 40, step: 1 } },
      saturate: { control: { type: "range", min: 100, max: 300, step: 10 } },
      refraction: { control: "inline-radio", options: ["auto", true, false] },
      magnify: { control: { type: "range", min: 1, max: 2, step: 0.02 } },
      rim: { control: { type: "range", min: 2, max: 40, step: 1 } },
      rimBend: { control: { type: "range", min: 0, max: 60, step: 1 } },
      chroma: { control: { type: "range", min: 0, max: 0.2, step: 0.005 } },
      interactive: { control: "boolean" },
      specular: { control: "boolean" },
      element: { control: false },
      children: { control: false },
    },
    parameters: {
      docs: {
        description: {
          component:
            "The one place where liquid glass is defined: refraction (displacement + " +
            "`backdrop-filter`), body (a shallow gradient) and light (specular edge + bloom). " +
            "Everything else in this library is the same surface in a different shape.\n\n" +
            "**Switch the backdrop in the toolbar above.** Glass over nothing is just milk, and " +
            "a displacement over a calm surface is invisible no matter how hard you dial it in — " +
            "so the stories default to the test chart rather than to something pretty.\n\n" +
            "### The controls that matter\n\n" +
            "| Prop | What it does |\n| --- | --- |\n" +
            "| `magnify` | The lens. Displacement grows linearly with distance from the centre. |\n" +
            "| `rim` / `rimBend` | The rim zone in px, and how hard contours tip inside it. |\n" +
            "| `chroma` | Colour fringe. Thick glass splits colours; `0` turns it off. |\n" +
            "| `blur` / `saturate` | Scattering. Saturation is the important half — it pulls colour up out of the backdrop. |\n" +
            "| `refraction` | `\"auto\"` · `true` · `false`. `false` is plain frosted glass. |\n\n" +
            "### Where the refraction comes from\n\n" +
            "The displacement hangs off an inner layer as an ordinary `filter`. In Chrome that " +
            "layer picks up the real backdrop through `backdrop-filter`. In Safari (Storybook " +
            "renders inside an iframe) and in Firefox it filters a pixel-aligned *copy* of the " +
            "backdrop instead, which the stage supplies through `--glass-echo-*` (echo mode). " +
            "Where neither works, `refraction: \"auto\"` falls back to frosted glass.\n\n" +
            "### Using it in your own project\n\n" +
            "The component carries every value it needs as a `var(--x, fallback)`, so it renders " +
            "correctly with no stylesheet imported at all. Declare any `--glass-*` property on " +
            "`:root` — or on any ancestor — to retheme it.",
        },
      },
    },
  });

  const backdropArgType = {
    control: "select" as const,
    options: BACKDROP_NAMES,
    labels: BACKDROP_LABELS,
    description: "Backdrop rendered behind the panel by this story.",
  };
</script>

<script lang="ts">
  // `BACKDROP_NAMES` and `backdropArgType` already exist in module scope.
  import Icon from "../Icon/Icon.svelte";
  import BackdropStage from "../../../stories/BackdropStage.svelte";
</script>

<Story
  name="Playground"
  args={{
    shape: "rounded",
    elevation: "floating",
    magnify: 1.4,
    rim: 12,
    rimBend: 12,
    chroma: 0.015,
    specular: true,
    refraction: "auto",
    backdrop: "probe",
  }}
  argTypes={{ backdrop: backdropArgType }}
  parameters={{
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Everything adjustable at once, backdrop included — pick one from the `backdrop` " +
          "control rather than the toolbar. Start on **Stripes** and pull `magnify` up: the " +
          "lines bow outward from the centre. Then switch to **Gradient** and do the same. " +
          "Nothing happens, and that is the point — refraction needs edges.",
      },
    },
  }}
>
  {#snippet template({ backdrop, ...args })}
    <BackdropStage backdrop={backdrop as BackdropName} height="480px">
      <GlassSurface {...args} style="width:min(560px, 80vw);height:300px">
        <span class="label">Drag the controls</span>
      </GlassSurface>
    </BackdropStage>
  {/snippet}
</Story>

<Story name="Panel" args={{ shape: "rounded", elevation: "floating" }}>
  {#snippet template(args)}
    <GlassSurface {...args} style="width:420px;height:260px">
      <span class="label">A panel of glass</span>
    </GlassSurface>
  {/snippet}
</Story>

<Story
  name="Pill"
  args={{ shape: "pill", elevation: "floating" }}
  parameters={{
    docs: {
      description: {
        story:
          "The bar case. Note how little room a displacement has here: across 44 pixels of " +
          "height, light simply has less distance to travel, so `lens.ts` encodes the vertical " +
          "axis flatter than the horizontal one.",
      },
    },
  }}
>
  {#snippet template(args)}
    <GlassSurface {...args}>
      <span class="label label--inline">Closer to the user</span>
    </GlassSurface>
  {/snippet}
</Story>

<Story
  name="Ball"
  args={{ shape: "circle", elevation: "raised", blur: 12, saturate: 180 }}
>
  {#snippet template(args)}
    <GlassSurface {...args} style="width:56px;height:56px">
      <Icon name="pen" size={22} />
    </GlassSurface>
  {/snippet}
</Story>

<Story
  name="Lens"
  args={{ shape: "circle", magnify: 1.5, rim: 22, rimBend: 26 }}
  parameters={{
    docs: {
      description: {
        story:
          "The same maths, round: a ball of glass. This is where it is clearest that the " +
          "displacement grows towards the rim — straight lines behind it give it away " +
          "immediately.",
      },
    },
  }}
>
  {#snippet template(args)}
    <GlassSurface {...args} style="width:220px;height:220px" />
  {/snippet}
</Story>

<Story
  name="Custom radius"
  args={{ radius: "36px", elevation: "floating" }}
  parameters={{
    docs: {
      description: {
        story:
          "`radius` takes any CSS length and overrides `shape` — for when neither pill nor " +
          "card nor circle is what you meant.",
      },
    },
  }}
>
  {#snippet template(args)}
    <GlassSurface {...args} style="width:380px;height:220px">
      <span class="label">radius = 36px</span>
    </GlassSurface>
  {/snippet}
</Story>

<Story
  name="Frosted vs. solid"
  parameters={{
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Left frosted (`refraction={false}`), right solid glass. The difference is not " +
          "sharpness but geometry: on the right the backdrop is somewhere else than it is " +
          "beside the panel.",
      },
    },
  }}
>
  {#snippet template()}
    <div class="row">
      <GlassSurface shape="rounded" refraction={false} style="width:300px;height:200px">
        <span class="label label--quiet">Frosted</span>
      </GlassSurface>
      <GlassSurface shape="rounded" style="width:300px;height:200px">
        <span class="label label--quiet">Solid</span>
      </GlassSurface>
    </div>
  {/snippet}
</Story>

<Story
  name="Magnification"
  parameters={{
    controls: { disable: true },
    docs: {
      description: {
        story:
          "`magnify` from 1.0 to 1.8. At 1.0 there is no lens at all and only the rim bends; " +
          "by 1.8 the effect is unmissable and body copy underneath has stopped being readable. " +
          "Somewhere between 1.2 and 1.5 is usually the answer.",
      },
    },
  }}
>
  {#snippet template()}
    <div class="row">
      {#each [1, 1.2, 1.4, 1.8] as magnify (magnify)}
        <figure class="spec">
          <GlassSurface shape="rounded" {magnify} style="width:190px;height:150px" />
          <figcaption>magnify {magnify}</figcaption>
        </figure>
      {/each}
    </div>
  {/snippet}
</Story>

<Story
  name="Rim and bend"
  parameters={{
    controls: { disable: true },
    docs: {
      description: {
        story:
          "`rim` is how wide the edge zone is, `rimBend` how hard contours tip inside it. " +
          "Together they are what makes the panel read as *thick* rather than merely distorted. " +
          "Both point inwards, and that is a necessity, not a preference: `backdrop-filter` " +
          "only knows pixels inside the element, so a map reaching outwards gets an empty " +
          "margin back.",
      },
    },
  }}
>
  {#snippet template()}
    <div class="row">
      {#each [{ rim: 4, rimBend: 0 }, { rim: 12, rimBend: 12 }, { rim: 24, rimBend: 28 }, { rim: 40, rimBend: 50 }] as spec (spec.rim)}
        <figure class="spec">
          <GlassSurface
            shape="rounded"
            rim={spec.rim}
            rimBend={spec.rimBend}
            style="width:190px;height:150px"
          />
          <figcaption>rim {spec.rim} · bend {spec.rimBend}</figcaption>
        </figure>
      {/each}
    </div>
  {/snippet}
</Story>

<Story
  name="Chroma"
  parameters={{
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Thick glass splits colours at the rim. The same displacement is applied three times " +
          "at marginally different strengths and recombined channel by channel. Only visible " +
          "over a coloured backdrop — try **Stripes** or **Test chart**.",
      },
    },
  }}
>
  {#snippet template()}
    <div class="row">
      {#each [0, 0.015, 0.06, 0.15] as chroma (chroma)}
        <figure class="spec">
          <GlassSurface shape="rounded" {chroma} magnify={1.6} style="width:190px;height:150px" />
          <figcaption>chroma {chroma}</figcaption>
        </figure>
      {/each}
    </div>
  {/snippet}
</Story>

<Story
  name="Without specular light"
  args={{ shape: "rounded", specular: false, refraction: false }}
  parameters={{
    docs: {
      description: {
        story:
          "The control experiment. Without the specular edge and the bloom, a milky rectangle " +
          "is all that is left. The illusion lives in the light, not in the blur.",
      },
    },
  }}
>
  {#snippet template(args)}
    <GlassSurface {...args} style="width:300px;height:200px">
      <span class="label label--quiet">Blur only</span>
    </GlassSurface>
  {/snippet}
</Story>

<Story name="Elevation" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div class="row">
      {#each ["flat", "raised", "floating"] as elevation (elevation)}
        <GlassSurface shape="rounded" elevation={elevation as never}>
          <span class="label label--inline">{elevation}</span>
        </GlassSurface>
      {/each}
    </div>
  {/snippet}
</Story>

<Story
  name="Interactive"
  args={{ shape: "pill", interactive: true, element: "button" }}
  parameters={{
    docs: {
      description: {
        story:
          "`interactive` adds the lift and the deeper shadow on hover. Combine it with " +
          "`element=\"button\"` or `element=\"a\"` — the surface renders whatever tag you ask " +
          "for and forwards every remaining attribute to it.",
      },
    },
  }}
>
  {#snippet template(args)}
    <GlassSurface {...args}>
      <span class="label label--inline">Hover me</span>
    </GlassSurface>
  {/snippet}
</Story>

<Story
  name="Across every backdrop"
  parameters={{
    layout: "fullscreen",
    controls: { disable: true },
    docs: {
      description: {
        story:
          "The same panel over the whole catalogue. Scroll through it: the panel has to hold " +
          "on all of them, and the two that decide it are **White** (does it disappear?) and " +
          "**Running text** (does it turn into smear?).",
      },
    },
  }}
>
  {#snippet template()}
    <div class="proof">
      {#each BACKDROP_NAMES as backdrop (backdrop)}
        <BackdropStage {backdrop} height="300px">
          <GlassSurface shape="rounded" style="width:min(460px, 70vw);height:170px">
            <span class="label label--quiet">{backdrop}</span>
          </GlassSurface>
        </BackdropStage>
      {/each}
    </div>
  {/snippet}
</Story>

<style>
  .label {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  .label--inline {
    padding: 10px 20px;
  }

  .label--quiet {
    font-size: 12px;
    opacity: 0.72;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    align-items: center;
    justify-content: center;
  }

  .spec {
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .spec figcaption {
    font-size: 11px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: rgba(255, 255, 255, 0.92);
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.65);
  }

  .proof {
    display: flex;
    flex-direction: column;
  }
</style>
