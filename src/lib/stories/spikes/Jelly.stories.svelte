<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import JellySurface from "./JellySurface.svelte";

  const { Story } = defineMeta({
    title: "Spikes/Jelly wobble",
    component: JellySurface,
    tags: ["autodocs"],
    args: {
      amplitude: 0.07,
      frequency: 2.4,
      damping: 3.6,
      squash: true,
      corners: 0,
      originAtPoint: true,
      ripple: true,
      rippleLife: 0.62,
      refraction: "auto",
      echoSafe: true,
    },
    argTypes: {
      amplitude: { control: { type: "range", min: 0, max: 0.3, step: 0.005 } },
      frequency: { control: { type: "range", min: 0.5, max: 8, step: 0.1 } },
      damping: { control: { type: "range", min: 0.5, max: 12, step: 0.1 } },
      corners: { control: { type: "range", min: 0, max: 40, step: 1 } },
      rippleLife: { control: { type: "range", min: 0.15, max: 2, step: 0.02 } },
      squash: { control: "boolean" },
      originAtPoint: { control: "boolean" },
      ripple: { control: "boolean" },
      refraction: { control: "inline-radio", options: ["auto", true, false] },
      echoSafe: { control: "boolean" },
      showMode: { control: "boolean" },
      shape: { control: false },
      element: { control: false },
      children: { control: false },
      radius: { control: false },
    },
    parameters: {
      docs: {
        description: {
          component:
            "**Spike — not wired into any component yet.** Click anything on this page.\\n\\n" +
            "An impact model rather than a transition: the poke lands, the surface deforms " +
            "immediately, then rings around its rest shape and dies away. So the oscillator " +
            "starts at its peak, not at zero.\\n\\n" +
            "```\\ns(t) = e^(−damping · t) · cos(2π · frequency · t)\\n```\\n\\n" +
            "Solved analytically rather than stepped. A stepped spring accumulates error when " +
            "frames are dropped, and a dropped frame is exactly when a wobble is most likely " +
            "to be running. Two slightly detuned modes are summed instead of one: a single " +
            "cosine reads as a mechanical bounce, the beat between two reads as fluid.\\n\\n" +
            "### Suggested settings to try\\n\\n" +
            "| Feel | amplitude | frequency | damping |\\n| --- | --- | --- | --- |\\n" +
            "| Slow and liquid (your brief) | 0.09 | 1.8 | 2.2 |\\n" +
            "| Firm jelly (the default) | 0.07 | 2.4 | 3.6 |\\n" +
            "| Crisp UI acknowledgement | 0.05 | 4.5 | 8 |\\n" +
            "| Comedy blob | 0.22 | 1.4 | 1.4 |\\n\\n" +
            "### Two things it deliberately does not do\\n\\n" +
            "**It never touches the lens.** Animating `magnify` or `rim` would rebuild the SVG " +
            "filter every frame, which is exactly the tearing we just fixed in the dock. The " +
            "refraction still appears to deform, because scaling the element scales the " +
            "filtered result with it — free, and safe by construction.\\n\\n" +
            "**It never animates layout.** Only `transform` and `border-radius`, so no reflow " +
            "and no `ResizeObserver` anywhere is woken up.\\n\\n" +
            "### Safari and Firefox: fixed, and why it was broken\\n\\n" +
            "The first version of this spike jumped in Safari and Firefox while behaving " +
            "perfectly in Chrome. That is not a browser bug — it is the CSS Transforms spec " +
            "meeting the echo refraction.\\n\\n" +
            "In `\"echo\"` mode the panel does not use a real `backdrop-filter`; it filters a " +
            "*copy* of the backdrop, held in place with `background-attachment: fixed`. The " +
            "spec says a transformed element becomes the containing block for **descendant " +
            "fixed background attachments**. So the instant the wobble put a `transform` on " +
            "the glass, that copy re-anchored from the viewport to the panel: it jumped, and " +
            "a `cover` background re-resolved against a 400px box instead of a whole screen. " +
            "Hence both symptoms — the jump and the sudden change of zoom.\\n\\n" +
            "Chrome never showed it because Chrome uses `\"real\"` mode, which has no `fixed` " +
            "dependency at all.\\n\\n" +
            "**The fix:** in echo mode the transform goes on an inner wrapper instead of on " +
            "the glass. The contents still squash, the corners still morph, the ring still " +
            "travels — only the refracted backdrop holds still instead of leaping about. " +
            "`echoSafe` (on by default) is that behaviour; turn it off to see the original " +
            "bug, and turn `showMode` on to see which path a panel took.\\n\\n" +
            "**Worth knowing:** WebKit only uses echo *inside an iframe*. In a real app at " +
            "the top level, Safari takes the `real` path and behaves exactly like Chrome — " +
            "so the reduced version is a Storybook artefact for Safari, not a product one. " +
            "Use Storybook\'s *open canvas in new tab* button and the badge flips to `real`. " +
            "Firefox uses echo everywhere, so for Firefox the fallback is permanent.",
        },
      },
    },
  });

  const MENU = [
    { id: "open", label: "Open", icon: "grid" as const, hint: "⌘O" },
    { id: "duplicate", label: "Duplicate", icon: "plus" as const, hint: "⌘D" },
    { id: "rename", label: "Rename", icon: "pen" as const },
    { id: "share", label: "Share", icon: "broadcast" as const, hint: "⇧⌘S" },
    { id: "archive", label: "Archive", icon: "inbox" as const },
  ];
</script>

<script lang="ts">
  import JellyMenu from "./JellyMenu.svelte";
  import Icon from "../../components/atoms/Icon/Icon.svelte";
</script>

<Story
  name="Poke a panel"
  parameters={{
    docs: {
      description: {
        story:
          "The base case. Click anywhere on it — near a corner, then dead centre — and watch " +
          "where it deforms from. Switch the backdrop to **Stripes** to see what the " +
          "refraction does while the panel is moving.",
      },
    },
  }}
>
  {#snippet template(args)}
    <JellySurface {...args} shape="rounded" radius={14} showMode>
      <span class="pad">Poke me</span>
    </JellySurface>
  {/snippet}
</Story>

<Story
  name="Buttons"
  parameters={{
    docs: {
      description: {
        story:
          "The most common case, and the one where restraint matters most: a control that " +
          "wobbles for a full second is a control you cannot click twice. Try `damping` at 8 " +
          "and `amplitude` at 0.05 — enough to acknowledge the press, gone before you want to " +
          "press again.\\n\\nThese render as real `<button>`s, so Enter and Space work too; " +
          "keyboard activation has no coordinates and deforms from the centre.",
      },
    },
  }}
>
  {#snippet template(args)}
    <div class="row">
      {#each ["Save", "Duplicate", "Share"] as label (label)}
        <JellySurface {...args} shape="pill" element="button">
          <span class="pad pad--tight">{label}</span>
        </JellySurface>
      {/each}
      <JellySurface {...args} shape="circle" element="button" style="width:52px;height:52px">
        <Icon name="plus" size={22} />
      </JellySurface>
    </div>
  {/snippet}
</Story>

<Story
  name="A menu"
  parameters={{
    docs: {
      description: {
        story:
          "Two wobbles at once: picking an item pokes the item hard and the panel softly, " +
          "from the same point. The panel's is slower and shallower — bigger bodies of liquid " +
          "move more slowly, and matching the frequencies makes the two look mechanically " +
          "linked rather than made of the same stuff.\\n\\nThe `sympathy` value (0.35 here) is " +
          "how much of the item's wobble the panel takes on. At 0 the panel sits still and " +
          "the menu reads as a sticker on glass; at 1 the whole thing sloshes.",
      },
    },
  }}
>
  {#snippet template(args)}
    <JellyMenu {...args} items={MENU} sympathy={0.35} />
  {/snippet}
</Story>

<Story
  name="Echo mode · the fix"
  args={{ showMode: true, amplitude: 0.09, frequency: 1.9, damping: 2.4, corners: 16 }}
  parameters={{
    controls: { disable: true },
    docs: {
      description: {
        story:
          "The one to open in Safari or Firefox. Poke both.\\n\\n" +
          "**Left** keeps the transform off the glass in echo mode. **Right** puts it on the " +
          "glass regardless — this is the original bug: the backdrop copy re-anchors from the " +
          "viewport to the panel, so it jumps and its zoom changes abruptly.\\n\\n" +
          "In Chrome both badges read `real` and both panels behave identically, because " +
          "Chrome never takes the echo path. That difference *is* the diagnosis.\\n\\n" +
          "Switch the backdrop to a photo — `cover` sizing makes the re-anchor most obvious, " +
          "since the image suddenly resolves against the panel instead of the screen.",
      },
    },
  }}
>
  {#snippet template(args)}
    <div class="row row--wrap">
      <figure class="spec">
        <JellySurface
          {...args}
          echoSafe={true}
          shape="rounded"
          radius={14}
          style="width:250px;height:170px"
        />
        <figcaption>echoSafe — transform kept off the glass</figcaption>
      </figure>
      <figure class="spec">
        <JellySurface
          {...args}
          echoSafe={false}
          shape="rounded"
          radius={14}
          style="width:250px;height:170px"
        />
        <figcaption>unguarded — the original bug</figcaption>
      </figure>
    </div>
  {/snippet}
</Story>

<Story
  name="Corner morph"
  args={{ corners: 16, amplitude: 0.05, frequency: 1.9, damping: 2.4 }}
  parameters={{
    docs: {
      description: {
        story:
          "The corners oscillate a quarter-period behind the squash, the way the rim of a " +
          "real drop is still moving when the centre has stopped. Opposite corners move " +
          "together, so the silhouette leans instead of merely breathing.\\n\\nThis is the " +
          "most *liquid* of the three effects and the least suited to small controls — it " +
          "needs a corner big enough to see. Useless on a pill or a circle, which have no " +
          "corners to morph.",
      },
    },
  }}
>
  {#snippet template(args)}
    <JellySurface {...args} shape="rounded" radius={14}>
      <span class="pad">Corners lag the squash</span>
    </JellySurface>
  {/snippet}
</Story>

<Story
  name="The three effects, separated"
  parameters={{
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Each one alone, so you can decide which are worth keeping. My reading, for what " +
          "it is worth: **squash** is the whole effect and should be on by default; the " +
          "**ring** is what sells it as liquid rather than rubber and costs nothing; " +
          "**corner morph** is lovely on big panels and noise on anything small.",
      },
    },
  }}
>
  {#snippet template()}
    <div class="row row--wrap">
      {#each [{ t: "Squash only", p: { squash: true, ripple: false, corners: 0 } }, { t: "Ring only", p: { squash: false, ripple: true, corners: 0 } }, { t: "Corners only", p: { squash: false, ripple: false, corners: 18 } }, { t: "All three", p: { squash: true, ripple: true, corners: 14 } }] as demo (demo.t)}
        <figure class="spec">
          <JellySurface
            {...demo.p}
            shape="rounded"
            radius={14}
            amplitude={0.075}
            frequency={2}
            damping={2.6}
            style="width:190px;height:130px"
          />
          <figcaption>{demo.t}</figcaption>
        </figure>
      {/each}
    </div>
  {/snippet}
</Story>

<Story
  name="Slow and liquid"
  args={{ amplitude: 0.09, frequency: 1.8, damping: 2.2, corners: 14 }}
  parameters={{
    docs: {
      description: {
        story:
          "Closest to the brief — a slow, viscous ring that takes about a second and a half " +
          "to settle. Big enough to enjoy on a panel; I would not put this on a button.",
      },
    },
  }}
>
  {#snippet template(args)}
    <JellySurface {...args} shape="rounded" radius={14} style="width:420px;height:260px">
      <span class="pad">Slow and liquid</span>
    </JellySurface>
  {/snippet}
</Story>

<style>
  .pad {
    padding: 28px 34px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  .pad--tight {
    padding: 11px 22px;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .row--wrap {
    flex-wrap: wrap;
    justify-content: center;
    max-width: 900px;
  }

  .spec {
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .spec figcaption {
    font-size: 11px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.92);
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.65);
  }
</style>
