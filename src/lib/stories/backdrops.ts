/**
 * The backdrop catalogue.
 *
 * Glass can only be judged over something, and a displacement only over
 * something with edges. So this is one list, used in two places: the
 * "Backdrop" toolbar in Storybook, and the `backdrop` control on the
 * playground stories.
 *
 * Every backdrop is expressed as plain CSS background values — never as
 * DOM. That is not a stylistic choice but a requirement of the echo mode:
 * where an engine refuses to filter a real backdrop (WebKit inside an
 * iframe, Gecko anywhere), `GlassSurface` filters a pixel-aligned *copy*
 * instead, and it can only copy something expressible as a background.
 * A backdrop built from DOM would silently fall back to frosted glass in
 * those engines. See `lens.ts` → `refractionMode`.
 */

export interface Backdrop {
  /** Label in the toolbar and in the controls panel. */
  title: string;
  /** Grouping, purely for reading the list. */
  group: "Structure" | "Text & layout" | "Images" | "Flat";
  /** One line on what this backdrop is good for. */
  note: string;
  color?: string;
  image?: string;
  size?: string;
  repeat?: string;
  position?: string;
}

export const BACKDROPS = {
  probe: {
    title: "Test chart",
    group: "Structure",
    note: "Stripes, checkerboard, rings, colour edges, a ruler and text in five sizes. The default, because it puts structure under the panel wherever it lands.",
    image: 'url("/backdrops/probe.svg")',
    size: "auto",
    repeat: "repeat",
    position: "top left",
  },
  stripes: {
    title: "Stripes",
    group: "Structure",
    note: "Straight lines in four frequencies and four angles, plus a continuous frequency sweep. The fastest way to see a displacement at all.",
    image: 'url("/backdrops/stripes.svg")',
    size: "auto",
    repeat: "repeat",
    position: "top left",
  },
  grid: {
    title: "Fine grid",
    group: "Structure",
    note: "A 7px ruled grid — the case where a blur starts producing moiré.",
    color: "#fbfaf8",
    image:
      "repeating-linear-gradient(90deg, rgba(0,0,0,0.07) 0 1px, transparent 1px 7px), " +
      "repeating-linear-gradient(0deg, rgba(0,0,0,0.07) 0 1px, transparent 1px 7px)",
    size: "auto",
    repeat: "repeat",
  },
  checker: {
    title: "Checkerboard",
    group: "Structure",
    note: "Hard corners at a single frequency. Corners bend differently from lines, and this is where you see it.",
    color: "#ffffff",
    image:
      "repeating-conic-gradient(#16161a 0% 25%, #ffffff 0% 50%)",
    size: "44px 44px",
    repeat: "repeat",
  },

  text: {
    title: "Running text",
    group: "Text & layout",
    note: "Body copy at five sizes, in columns, with a ruler. The hardest backdrop: this is where magnification turns into smear.",
    image: 'url("/backdrops/text.svg")',
    size: "auto",
    repeat: "repeat",
    position: "top left",
  },
  layout: {
    title: "Page layout",
    group: "Text & layout",
    note: "A dashboard: nav, cards, a chart, a table, media tiles. Straight edges at four scales at once — the realistic case.",
    image: 'url("/backdrops/layout.svg")',
    size: "cover",
    repeat: "no-repeat",
    position: "center",
  },
  layoutTiled: {
    title: "Page layout, tiled",
    group: "Text & layout",
    note: "The same layout at original size and repeated, so the 12px labels stay 12px instead of being scaled up by `cover`.",
    image: 'url("/backdrops/layout.svg")',
    size: "auto",
    repeat: "repeat",
    position: "top left",
  },

  photoHero: {
    title: "Photo · hero",
    group: "Images",
    note: "A soft gradient with a light source and grain. Tests whether the panel still carries over large, calm areas.",
    image: 'url("/backdrops/photo-01.svg")',
  },
  photoWarm: {
    title: "Photo · warm",
    group: "Images",
    note: "Warm and saturated — where `saturate()` pulls hardest.",
    image: 'url("/backdrops/photo-02.svg")',
  },
  photoStriped: {
    title: "Photo · striped",
    group: "Images",
    note: "Hard stripes in an image. Moiré and edge shimmer show up here.",
    image: 'url("/backdrops/photo-03.svg")',
  },
  photoBright: {
    title: "Photo · bright",
    group: "Images",
    note: "Near-achromatic and bright. Barely any colour for the filter to pull up into the panel.",
    image: 'url("/backdrops/photo-04.svg")',
  },
  photoDark: {
    title: "Photo · dark",
    group: "Images",
    note: "Dark with points of light. The shadow does nothing here; the specular edge is what carries the panel.",
    image: 'url("/backdrops/photo-05.svg")',
  },

  white: {
    title: "White",
    group: "Flat",
    note: "The hardest flat case. If the panel disappears, only the edge is holding it together.",
    color: "#ffffff",
  },
  dark: {
    title: "Dark",
    group: "Flat",
    note: "The shadow vanishes into the ground; everything depends on the specular edge.",
    color: "#16161a",
  },
  accent: {
    title: "Saturated colour",
    group: "Flat",
    note: "A brand surface. If `saturate()` over-drives it, the panel reads pink.",
    image: "linear-gradient(135deg, #e2001a, #8f0012)",
  },
  gradient: {
    title: "Gradient",
    group: "Flat",
    note: "A calm colour ramp. Deliberately edgeless: proof that refraction really is invisible without contours.",
    image: "linear-gradient(135deg, #1f6a8c, #63b7ad 45%, #ffe0a8)",
  },
  none: {
    title: "None",
    group: "Flat",
    note: "Storybook's own canvas. Frosted glass over nothing — which is the point being made.",
    color: "#f4f3f1",
  },
} as const satisfies Record<string, Backdrop>;

export type BackdropName = keyof typeof BACKDROPS;

export const BACKDROP_NAMES = Object.keys(BACKDROPS) as BackdropName[];

/** The default. Over a calm surface a displacement is simply invisible, so
 *  the test chart goes first rather than a pretty photograph. */
export const DEFAULT_BACKDROP: BackdropName = "probe";

/** Labels for the Storybook controls panel, keyed by name. */
export const BACKDROP_LABELS = Object.fromEntries(
  BACKDROP_NAMES.map((name) => [name, BACKDROPS[name].title]),
) as Record<BackdropName, string>;

/**
 * The custom properties a backdrop resolves to.
 *
 * Two sets with identical values: `--sb-backdrop-*` is what the stage
 * paints itself with, `--glass-echo-*` is the promise to `GlassSurface`
 * that a pixel-aligned copy of exactly that is available. They have to
 * agree, which is why they are produced together, here.
 */
export function backdropVars(name: BackdropName): Record<string, string> {
  const b: Backdrop = BACKDROPS[name];
  const pairs: Record<string, string> = {
    "--sb-backdrop-color": b.color ?? "transparent",
    "--sb-backdrop": b.image ?? "none",
    "--sb-backdrop-size": b.size ?? "cover",
    "--sb-backdrop-repeat": b.repeat ?? "no-repeat",
    "--sb-backdrop-position": b.position ?? "center",
  };
  return {
    ...pairs,
    "--glass-echo-color": pairs["--sb-backdrop-color"],
    "--glass-echo": pairs["--sb-backdrop"],
    "--glass-echo-size": pairs["--sb-backdrop-size"],
    "--glass-echo-repeat": pairs["--sb-backdrop-repeat"],
    "--glass-echo-position": pairs["--sb-backdrop-position"],
  };
}

/** The same, as an inline `style` string. */
export function backdropStyle(name: BackdropName): string {
  return Object.entries(backdropVars(name))
    .map(([key, value]) => `${key}:${value}`)
    .join(";");
}
