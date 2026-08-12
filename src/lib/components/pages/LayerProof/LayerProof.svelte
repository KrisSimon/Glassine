<!--
  PAGE · LayerProof
  The stress test: does the panel hold over *every* backdrop? The page
  scrolls through seven of them — photo, white, saturated colour, dark,
  fine grid, stripes and body copy — while the panel stays put.

  What to look for: legibility of the icons, contrast of the counter,
  whether the panel disappears on a light ground and turns too hard on a
  dark one.
-->
<script lang="ts">
  import WebsiteScaffold from "../../templates/WebsiteScaffold/WebsiteScaffold.svelte";
  import GlassBar from "../../organisms/GlassBar/GlassBar.svelte";
  import { DEMO_ITEMS_SHORT } from "../../../data/items";
  import type { GlassSize, LauncherItem, LayerPlacement } from "../../../types";

  interface Props {
    signedIn?: boolean;
    items?: LauncherItem[];
    messageCount?: number;
    size?: GlassSize;
    placement?: LayerPlacement;
    strategy?: "fixed" | "sticky" | "absolute";
    /** Refraction like a solid block of glass — `false` gives frosted glass. */
    refraction?: boolean | "auto";
    magnify?: number;
  }

  let {
    signedIn = true,
    items = DEMO_ITEMS_SHORT,
    messageCount = 3,
    size = "md",
    placement = "top-right",
    strategy = "fixed",
    refraction = "auto",
    magnify,
  }: Props = $props();

  const bands = [
    {
      key: "photo",
      title: "Photograph",
      note: "The normal case: a hero image with plenty of detail and a light source.",
    },
    {
      key: "light",
      title: "White",
      note: "The hardest case. Glass on white must not vanish — only the edge carries it.",
    },
    {
      key: "brand",
      title: "Saturated colour",
      note: "A brand surface: if the filter over-saturates the colour, the panel reads pink.",
    },
    {
      key: "dark",
      title: "Dark",
      note: "Footers and video: the shadow disappears, the specular edge takes over.",
    },
    {
      key: "grid",
      title: "Fine grid",
      note: "Tables and lists: does the blur produce moiré?",
    },
    {
      key: "stripes",
      title: "Stripes",
      note: "Straight lines in four frequencies — where the displacement is easiest to read.",
    },
    {
      key: "text",
      title: "Body copy",
      note: "The panel over running text: at what size does magnification turn into smear?",
    },
  ];
</script>

<WebsiteScaffold {signedIn} {placement} {strategy} inset={20}>
  {#snippet content()}
    <div class="proof">
      {#each bands as band (band.key)}
        <section class="band band--{band.key}">
          <div class="band__text">
            <p class="band__eyebrow">Backdrop</p>
            <h2 class="band__title">{band.title}</h2>
            <p class="band__note">{band.note}</p>
          </div>
        </section>
      {/each}
    </div>
  {/snippet}

  {#snippet layer()}
    <GlassBar {items} {messageCount} {size} {refraction} {magnify} />
  {/snippet}
</WebsiteScaffold>

<style>
  .proof {
    display: block;
  }

  .band {
    display: flex;
    align-items: center;
    min-height: 62vh;
    padding: var(--l-space-8, 32px) clamp(20px, 6vw, 80px);
  }

  .band__text {
    max-width: 44ch;
    /* A readable plate under the copy, so the band stays judgeable even
       where the backdrop is at its busiest. */
    padding: 16px 20px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.06);
  }

  .band__eyebrow {
    margin: 0 0 6px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    opacity: 0.6;
  }

  .band__title {
    margin: 0 0 8px;
    font-size: clamp(28px, 4vw, 46px);
    letter-spacing: -0.02em;
    line-height: 1.05;
  }

  .band__note {
    margin: 0;
    font-size: 15px;
    line-height: 1.6;
    opacity: 0.78;
  }

  .band--photo {
    color: #fff;
    background:
      linear-gradient(105deg, rgba(10, 10, 20, 0.62), rgba(10, 10, 20, 0.05)),
      url("/backdrops/photo-01.svg") center / cover no-repeat;
  }

  .band--light {
    color: var(--brand-ink, #1b1c1e);
    background: #fff;
  }

  .band--brand {
    color: #fff;
    background: linear-gradient(135deg, #e2001a, #8f0012);
  }

  .band--dark {
    color: #f2f1ef;
    background: #16161a;
  }

  .band--grid {
    color: var(--brand-ink, #1b1c1e);
    background:
      repeating-linear-gradient(
        90deg,
        rgba(0, 0, 0, 0.07) 0 1px,
        transparent 1px 7px
      ),
      repeating-linear-gradient(
        0deg,
        rgba(0, 0, 0, 0.07) 0 1px,
        transparent 1px 7px
      ),
      #fbfaf8;
  }

  .band--stripes {
    color: #fff;
    background:
      linear-gradient(105deg, rgba(10, 10, 20, 0.55), rgba(10, 10, 20, 0.1)),
      url("/backdrops/stripes.svg") top left / auto repeat;
  }

  .band--text {
    color: var(--brand-ink, #1b1c1e);
    background: url("/backdrops/text.svg") top left / auto repeat;
  }
</style>
