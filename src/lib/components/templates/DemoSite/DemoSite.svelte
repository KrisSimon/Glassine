<!--
  TEMPLATE · DemoSite
  A neutral page to put underneath the glass layer: colour fields, images,
  text — nothing more. Not a screenshot but real DOM that scrolls, wraps and
  shows type at real sizes.

  Deliberately *not* built with the glass tokens. The layer has to prove
  itself over someone else's design material; if the page shared its palette
  with the glass, the test would be flattering itself. Hence a local palette
  of its own.

  What each section tests:
    hero      — a large image with a light source, the normal case
    swatches  — saturated fields that `saturate()` pulls at
    body copy — fine type under the blur, legibility right beside it
    image row — hard edges, stripes, moiré
    signal    — one single loud surface
    grid      — a fine ruled grid
    footer    — darkness: the shadow disappears, the edge has to carry
-->
<script lang="ts">
  interface Props {
    /** Name of the fictional site — appears in the header and footer. */
    siteName?: string;
    /** Images for the hero and the grid (hero first). */
    images?: string[];
    /** Render the footer (turn off for short excerpts). */
    footer?: boolean;
  }

  let {
    siteName = "Northbound",
    images = [
      "/backdrops/photo-01.svg",
      "/backdrops/photo-02.svg",
      "/backdrops/photo-03.svg",
      "/backdrops/photo-04.svg",
      "/backdrops/photo-05.svg",
    ],
    footer = true,
  }: Props = $props();

  const hero = $derived(images[0]);
  const tiles = $derived(images.slice(1));

  const nav = ["Latest", "Topics", "Events", "About", "Contact"];

  const swatches = [
    { name: "Signal", value: "#e2001a" },
    { name: "Deep", value: "#12324f" },
    { name: "Meadow", value: "#3f7d4a" },
    { name: "Sand", value: "#d8c9a8" },
    { name: "Night", value: "#141419" },
  ];

  const captions = [
    "Warm and saturated",
    "Hard stripes",
    "Near-achromatic, very bright",
    "Dark with points of light",
  ];
</script>

<div class="site">
  <header class="site__head">
    <span class="site__brand">{siteName}</span>
    <nav class="site__nav" aria-label="Example navigation">
      {#each nav as item (item)}
        <span class="site__navitem">{item}</span>
      {/each}
    </nav>
  </header>

  <!-- Hero — image, colour and text at once -->
  <section class="stage" id="hero">
    <img class="stage__img" src={hero} alt="" />
    <div class="stage__text">
      <p class="eyebrow">Demo page</p>
      <h1 class="stage__title">
        A backdrop that cares nothing about the layer above it
      </h1>
      <p class="stage__lead">
        Colour fields, images and text at the sizes they occur at on real
        pages. What shows through here is what decides the panel.
      </p>
    </div>
  </section>

  <!-- Swatches -->
  <section class="band band--pale" id="swatches">
    <h2 class="band__title">Colour fields</h2>
    <ul class="swatches">
      {#each swatches as swatch (swatch.name)}
        <li class="swatch">
          <span class="swatch__chip" style:background={swatch.value}></span>
          <span class="swatch__name">{swatch.name}</span>
          <span class="swatch__value">{swatch.value}</span>
        </li>
      {/each}
    </ul>
  </section>

  <!-- Body copy -->
  <section class="band band--paper" id="text">
    <h2 class="band__title">Body copy</h2>
    <div class="columns">
      <p>
        This paragraph is here because glass over text behaves differently
        from glass over pictures. Fine letterforms turn into grey soup under
        a heavy blur, and that is exactly what you want to see before
        settling on a value. The unobscured setting sits right beside it for
        comparison.
      </p>
      <p>
        The second paragraph keeps the column at a length an eye actually
        reads. Leading and size are deliberately ordinary: no special cases,
        just what most pages are made of — news, dates, descriptions, small
        print.
      </p>
      <p>
        And a third, so that enough lines sit under the panel up at the top.
        Scroll the page and you push image, colour and text under the glass
        in turn — the panel stays, the backdrop changes.
      </p>
    </div>
  </section>

  <!-- Image row -->
  <section class="band band--paper band--tight" id="images">
    <h2 class="band__title">Images</h2>
    <div class="grid">
      {#each tiles as tile, i (tile)}
        <figure class="tile">
          <img class="tile__img" src={tile} alt="" />
          <figcaption class="tile__caption">{captions[i] ?? "Image"}</figcaption>
        </figure>
      {/each}
    </div>
  </section>

  <!-- Signal band -->
  <section class="band band--signal" id="signal">
    <h2 class="signal__title">One loud surface</h2>
    <p class="signal__text">
      Saturated red under translucent glass. If the filter pulls the surface
      towards pink, this is where you see it.
    </p>
  </section>

  <!-- Fine grid -->
  <section class="band band--grid" id="grid">
    <h2 class="band__title">Fine grid</h2>
    <p class="band__note">
      Tables, lists, cards — the structures where a blur produces moiré.
    </p>
  </section>

  {#if footer}
    <footer class="foot">
      <span class="foot__brand">{siteName}</span>
      <div class="foot__cols">
        {#each nav as item (item)}
          <span class="foot__item">{item}</span>
        {/each}
      </div>
      <p class="foot__legal">
        Placeholder content. Not related to any real organisation.
      </p>
    </footer>
  {/if}
</div>

<style>
  /* Local palette — deliberately separate from the glass tokens. */
  .site {
    --site-ink: #1a1a1c;
    --site-ink-soft: #5b5b60;
    --site-paper: #fbfaf8;
    --site-pale: #eeece7;
    --site-line: #dfdcd6;
    --site-signal: #e2001a;
    --site-night: #141419;

    background: var(--site-paper);
    color: var(--site-ink);
    font-family: var(--l-font-sans, "Helvetica Neue", Helvetica, Arial, sans-serif);
  }

  .site__head {
    display: flex;
    align-items: baseline;
    gap: clamp(16px, 4vw, 48px);
    padding: 18px clamp(20px, 6vw, 72px);
    border-bottom: 1px solid var(--site-line);
    background: #fff;
  }

  .site__brand {
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  .site__nav {
    display: flex;
    flex-wrap: wrap;
    gap: clamp(12px, 2vw, 26px);
  }

  .site__navitem {
    font-size: 13px;
    color: var(--site-ink-soft);
  }

  /* ---------- Hero ---------- */

  .stage {
    position: relative;
    display: grid;
    min-height: clamp(320px, 46vh, 520px);
  }

  /* The image sits behind the text, not on top of it: that way the hero
     grows when the headline needs more lines in a narrow window. */
  .stage__img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .stage__text {
    position: relative;
    align-self: end;
    padding: clamp(24px, 5vw, 56px);
    max-width: 46ch;
    color: #fff;
    text-shadow: 0 1px 24px rgba(0, 0, 0, 0.45);
  }

  .stage__title {
    margin: 0 0 10px;
    font-size: clamp(26px, 3.6vw, 44px);
    line-height: 1.06;
    letter-spacing: -0.025em;
  }

  .stage__lead {
    margin: 0;
    font-size: 15px;
    line-height: 1.6;
    opacity: 0.9;
  }

  .eyebrow {
    margin: 0 0 6px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    opacity: 0.75;
  }

  /* ---------- Bands ---------- */

  .band {
    padding: clamp(32px, 5vw, 64px) clamp(20px, 6vw, 72px);
    /* Anchor targets do not end up underneath the panel. */
    scroll-margin-top: 90px;
  }

  .band--tight {
    padding-top: 0;
  }

  .band--pale {
    background: var(--site-pale);
  }

  .band--paper {
    background: var(--site-paper);
  }

  .band__title {
    margin: 0 0 20px;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--site-ink-soft);
  }

  .band__note {
    margin: 0;
    max-width: 52ch;
    font-size: 15px;
    line-height: 1.6;
    color: var(--site-ink-soft);
  }

  /* ---------- Swatches ---------- */

  .swatches {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 14px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .swatch {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .swatch__chip {
    display: block;
    height: clamp(90px, 12vw, 150px);
    border-radius: 10px;
  }

  .swatch__name {
    font-size: 13px;
    font-weight: 700;
  }

  .swatch__value {
    font-size: 12px;
    color: var(--site-ink-soft);
    font-variant-numeric: tabular-nums;
  }

  /* ---------- Text ---------- */

  .columns {
    columns: 3 26ch;
    column-gap: clamp(20px, 4vw, 48px);
    font-size: 15px;
    line-height: 1.65;
  }

  .columns p {
    margin: 0 0 1em;
    break-inside: avoid;
  }

  /* ---------- Images ---------- */

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 14px;
  }

  .tile {
    margin: 0;
  }

  .tile__img {
    display: block;
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
    border-radius: 10px;
  }

  .tile__caption {
    margin-top: 8px;
    font-size: 12px;
    color: var(--site-ink-soft);
  }

  /* ---------- Signal ---------- */

  .band--signal {
    background: var(--site-signal);
    color: #fff;
  }

  .signal__title {
    margin: 0 0 8px;
    font-size: clamp(24px, 3.2vw, 40px);
    letter-spacing: -0.02em;
    line-height: 1.1;
  }

  .signal__text {
    margin: 0;
    max-width: 46ch;
    font-size: 15px;
    line-height: 1.6;
    opacity: 0.92;
  }

  /* ---------- Grid ---------- */

  .band--grid {
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
      var(--site-paper);
  }

  /* ---------- Footer ---------- */

  .foot {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: clamp(16px, 4vw, 48px);
    padding: clamp(28px, 4vw, 48px) clamp(20px, 6vw, 72px);
    background: var(--site-night);
    color: rgba(255, 255, 255, 0.72);
  }

  .foot__brand {
    color: #fff;
    font-size: 15px;
    font-weight: 800;
  }

  .foot__cols {
    display: flex;
    flex-wrap: wrap;
    gap: clamp(12px, 2vw, 26px);
    font-size: 13px;
  }

  .foot__legal {
    flex: 1 1 100%;
    margin: 0;
    font-size: 12px;
    opacity: 0.55;
  }
</style>
