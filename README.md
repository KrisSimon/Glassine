# Glassine

A **liquid-glass surface for the web**: refraction, scattering and specular light
in one component. `GlassSurface` is the whole idea — everything else in this repo
is either built on it or exists to demonstrate it.

```svelte
<script>
  import { GlassSurface } from "$lib";
</script>

<GlassSurface shape="pill">
  <span style="padding: 10px 20px">Hello</span>
</GlassSurface>
```

No stylesheet import required. Every value the component needs is a
`var(--x, fallback)`, so it renders correctly dropped into a project that has none
of this repo's CSS.

## Getting started

```bash
npm install
npm run storybook   # components, docs and the backdrop switcher, port 6006
npm run dev         # the layer in operation — scroll, tab, click
```

Also: `npm run check` (svelte-check), `npm run build`, `npm run build-storybook`.

Start in Storybook at **Introduction**, then **Atoms → GlassSurface → Playground**.
Switch the backdrop in the toolbar while you look at anything.

## Stack

- **Svelte 5** — runes throughout (`$props`, `$state`, `$derived`, `$effect`),
  snippets rather than slots
- **Vite 8** + TypeScript (strict)
- **Storybook 10** with Svelte CSF, `addon-docs` and `addon-a11y`
- No CSS framework: design tokens plus scoped styles. A utility framework would
  hide more than it saves when there is exactly *one* surface.

## Layout

```
src/lib/
├─ tokens/           tokens.css · global.css   — primitives → semantics
├─ types.ts          IconName, LauncherItem, GlassSize, LayerPlacement
├─ data/items.ts     demo entries for the stories
├─ stories/          backdrops.ts · BackdropStage.svelte · Introduction · Usage
└─ components/
   ├─ atoms/         GlassSurface · GlassButton · GlassDivider · CountBadge
   │                 Icon · Tooltip
   ├─ molecules/     LauncherButton · MessagesButton · LogoutButton
   │                 GlassPen · BrowserFrame
   ├─ organisms/     GlassBar · Dock · InlineEditable
   ├─ templates/     GlassLayer · WebsiteScaffold · DemoSite
   └─ pages/         DemoSiteOverlay · FramedOverlay · LayerProof
                     ProfileInlineEdit
```

Each component sits in its own folder with its `*.stories.svelte` beside it.
Import through the barrel:

```svelte
<script lang="ts">
  import { GlassBar, GlassLayer, DEMO_ITEMS } from "$lib";
</script>
```

### Where the decisions live

| File | Decision |
| --- | --- |
| `atoms/GlassSurface` | **The only place** liquid glass is defined. Bar, ball and pen are shapes of the same surface. |
| `atoms/GlassSurface/lens.ts` | The maths behind the displacement: how much it magnifies and where the image tips. |
| `templates/GlassLayer` | Where the layer sits and how it stays there — `fixed`, `sticky` or `absolute`. |
| `templates/WebsiteScaffold` | Separates `content` (the page) from `layer` (one element in the page template). Drop the condition and the layer is simply not rendered. |
| `templates/DemoSite` | The neutral backdrop: colour fields, images, text with its **own** palette. Deliberately not built with the glass tokens — otherwise the backdrop would be flattering the glass. |
| `organisms/GlassBar` | Order, collapsing when there are many entries, keyboard operation. |
| `organisms/Dock` | A macOS-style dock. Shows the three traps: tiles must sit *outside* the clipping glass, magnification must not touch layout (though the plate still grows), and the smoothing has to be one value per frame rather than a CSS transition. |
| `stories/backdrops.ts` | The one backdrop catalogue: toolbar, story controls and the echo copy all read from it. |
| `tokens/tokens.css` | Blur, saturation, specular edge, bevel, shadow — and the fallbacks. |

## What makes it glass

Five layers, back to front:

1. **Displacement** — the view through a *solid* block: the centre magnified,
   contours tipping away near the rim. See below.
2. **Scattering** — `backdrop-filter: blur() saturate()`. Saturation is the more
   important half: it pulls colour up out of the backdrop, so the panel reads as
   connected to the page instead of pasted onto it. With a displacement in play
   almost no blur is left (0.8px) — it would dissolve exactly the contours whose
   bending you want to see.
3. **Body** — a shallow white gradient, diagonal. Without it the glass is a hole.
4. **Light** — bright edge along the top, bloom in the lower left, and for a solid
   block the **bevel** running all the way round. The illusion lives here; the
   story *Without specular light* is the control experiment.
5. **Shadow** — tinted warm rather than neutral grey, otherwise the panel looks
   cut out and dropped onto a photograph.

### The refraction

`blur()` gives frosted glass: the backdrop goes soft but stays geometrically put.
A block of glass *displaces* it. Rebuilt with an SVG filter:

```
feImage            two maps — red displaces horizontally, green vertically, 128 = not at all
feDisplacementMap  displaces the backdrop accordingly (three times, marginally
                   different in strength → colour fringe, as thick glass produces)
```

The filter hangs **not** in the `backdrop-filter` but as an ordinary `filter` on an
inner layer that itself carries the `backdrop-filter`:

```html
<div class="glass">                       <!-- body, light, shadow, radius -->
  <span class="glass__refract"></span>    <!-- backdrop-filter: blur() · filter: url(#lens) -->
  …
```

That is the difference between "Chrome only" and "Chrome and Safari": WebKit
refuses to draw SVG filters inside a backdrop-filter, but happily filters a layer
that itself carries one.

Two engines still do not get there: WebKit **inside iframes** (Storybook!)
silently discards SVG filters on backdrop layers, and Gecko never filters the
result of a `backdrop-filter` at all. For both there is **echo mode**: the
environment supplies, through `--glass-echo-*`, the same values it gives its own
background; the refracting layer paints itself a pixel-aligned copy of the backdrop
with `background-attachment: fixed` and sends *that* — ordinary content — through
the filter. Both engines draw it. The copy is only correct as long as the backdrop
does not scroll; the story stage does not (`.storybook/storybook.css` sets the
variables, full-page stories opt out). Which path applies is decided by
`refractionMode()` in `lens.ts`: `real` · `echo` · `none`.

`lens.ts` computes the maps from the measured size of the element. Two numbers
determine the optics, both available as props:

| Prop | Meaning | Default |
| --- | --- | --- |
| `magnify` | The lens. Displacement grows linearly with distance from the centre. | `1.4` |
| `rim` / `rimBend` | Rim zone in px, and how hard contours tip inside it. | `12` / `12` |
| `chroma` | Colour fringe. `0` turns it off. | `0.015` |
| `refraction` | `"auto"`, `true`, `false` — `false` is plain frosted glass. | `"auto"` |

Both displacements point **inwards**, and that is not a matter of taste:
`backdrop-filter` only knows pixels inside the element. A map reaching outwards
gets an empty margin back.

### Seven things that cost real time

None of them produces an error, which is why they are written down here and at the
point in the source where they matter:

- **The backdrop disappears.** An ancestor with `filter`, `opacity < 1` or a
  running animation becomes a *backdrop root*: what lies behind it stops counting
  as the backdrop of its children, and every `backdrop-filter` below filters empty
  space — silently. That is exactly what `GlassLayer`'s entrance animation did
  (`animation … both` left `filter: blur(0)` standing forever). It now clears
  itself up once it has finished.
- **DOM order.** WebKit resolves `filter: url(#…)` when the element is inserted;
  if the filter is not in the document at that moment, the reference stays dead and
  is never retried. Since the refracting layer only comes into being after
  measuring, it was initially inserted *before* its own filter definition:
  unremarkable in Chrome (which resolves later), plain blur in Safari. Hence the
  `<svg>` sits **before** the layer that uses it.
- **Where the map lands.** `feImage` gets **no** `x/y/width/height`. Without them
  it fills the filter region, and that region lies exactly on the element. Given
  pixel values, WebKit resolves them against the document origin instead of the
  element edge: the further the glass is from the origin, the further the map
  slides away, until only a constant value arrives — the backdrop then shifts
  uniformly instead of magnifying. It looks like refraction at first glance and is
  not. Chrome places the map correctly, which is why the bug stays invisible there.
- **Changes do not land.** WebKit will not repaint a once-filtered layer while its
  `backdrop-filter` is unchanged — not even when the filter *and* the element are
  replaced. `magnify`, `rim`, `rimBend` and `chroma` were therefore dead controls
  there: the initial build was right, every change evaporated. `GlassSurface` now
  pushes three things together on every change: a new filter id (a fingerprint over
  the values), a newly inserted layer — and an imperceptible deviation in the
  scattering (one thousandth of a pixel, alternating on and off). Only the last one
  triggers the repaint.
- **A resizing panel tears itself apart.** Changing the measured size rebuilds the
  `<filter>` and the refracting layer (see above — in WebKit nothing less lands).
  Cheap once, ruinous sixty times a second: a panel whose width animates used to
  discard its own refraction every frame, which reads as flicker and torn edges.
  `GlassSurface` now lets the committed size settle for ~120ms first. During the
  transient the old filter keeps drawing, and it keeps drawing something sensible,
  because the maps are `feImage`s filling the filter region and therefore stretch
  to whatever size the element currently is.
- **A `transform` above the glass makes the backdrop jump.** In echo mode the
  backdrop copy is held by `background-attachment: fixed`, and the CSS Transforms
  spec makes a transformed element the containing block for *descendant fixed
  background attachments*. A transform on the surface or any ancestor of it — a
  1px hover lift was enough — re-anchors that copy from the viewport to that
  element, and the panel shows backdrop from the wrong place at the wrong zoom.
  Silent, and invisible in Chromium, which uses the `real` path. Hence
  `GlassSurface` lifts with `top` rather than `translateY`, `GlassLayer` centres
  with flex rather than `translateX(-50%)`, and `GlassPen` scales its icon rather
  than itself. `onmode` reports which path a surface took.
- **Frosted despite the filter, depending on engine and embedding.** Gecko never
  filters the result of a `backdrop-filter`; WebKit does at the top level but
  silently discards the same filter inside an iframe. Neither is measurable:
  `CSS.supports()` only answers whether the properties exist individually, and no
  script can read back what was painted. Hence a lookup table in `lens.ts` built
  from visual comparisons rather than a measurement — and echo mode for the
  affected cases, which needs no backdrop at all.

Verified in Chrome, Safari and Firefox (macOS) over the test chart — panel, large
surface and ball (*Lens*), each far from the document origin, and with values
changed at runtime: Chrome (real) and Safari (in Storybook: echo) magnify
identically and respond identically to the controls. Firefox shows the
displacement wherever the environment supplies the echo; without it, it stays
frosted there.

## Accessibility

- `GlassBar` is a **toolbar** per WAI-ARIA: one tab stop leads in, arrow keys move
  within, Home/End jump to the ends (roving `tabindex`).
- Icons carry `aria-label`; counters additionally carry plain text for screen
  readers ("3 new messages").
- `prefers-reduced-transparency`, `prefers-contrast: more` and
  `prefers-reduced-motion` are honoured; without `backdrop-filter` an `@supports`
  rule supplies a more opaque variant. Transparency is a preference, not a
  prerequisite.
- Focus ring with a white inner edge, so it stays visible on a photograph *and* on
  white.

## The backdrops

`public/backdrops/*.svg` are all generated for this repo — gradients, stripes,
dot rasters, grain, running text and a page layout. No third-party material, no
licensing question, and each image tests a different property of the filter
(saturation, moiré, darkness, near-achromatic surfaces).

`probe.svg` is the default in Storybook: a grid of 200px fields, each with
structure, hard boundaries in between. Deliberately dense throughout — a panel
lands wherever it lands, and wherever it lands on a calm surface the test is
worthless.

`stripes.svg`, `text.svg` and `layout.svg` are the three that matter most: straight
lines make the displacement readable, running text shows where it stops working,
and the layout is what an actual product looks like underneath.

Add your own by adding an entry to `src/lib/stories/backdrops.ts`. It appears in
the toolbar, in every `backdrop` control and in the gallery, with no other change.
Note the one constraint: it has to be expressible as a CSS `background`, because
echo mode can only copy a background — a backdrop built out of DOM would silently
fall back to frosted glass in Safari-in-an-iframe and in Firefox.
