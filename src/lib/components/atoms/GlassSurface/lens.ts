/**
 * Refraction — the view through a solid block of glass.
 *
 * `backdrop-filter: blur()` gives you frosted glass: the backdrop goes soft
 * but stays geometrically where it was. A block of glass does something
 * else — it *displaces* the backdrop: the centre appears magnified, and
 * close to the rim the image tips away, because that is where the light
 * path bends hardest.
 *
 * That is exactly what an SVG filter can reproduce:
 *
 *   feImage           — a map saying, for every point, where to displace to
 *                       (red = x, green = y, 128 = not at all)
 *   feDisplacementMap — displaces the backdrop accordingly
 *
 * This module computes the map. Two numbers determine the optics:
 *
 *   magnify — magnification on the inside. It comes about because every
 *             point fetches its image a little further *out from the
 *             centre*; the displacement grows linearly with the distance
 *             from the centre.
 *   rim     — the rim zone. There a quadratically growing displacement is
 *             added on top: the edge where contours visibly bend.
 *
 * Both point inwards. That is not an accident but a necessity:
 * `backdrop-filter` only knows pixels inside the element. A map reaching
 * outwards would get an empty margin back.
 */

/** Maximum excursion of a channel: 0…1 around the neutral value 0.5. */
const CHANNEL_RANGE = 0.5;

export interface LensProfile {
  /** Size of the glass body in CSS pixels. */
  width: number;
  height: number;
  /** Magnification on the inside (1 = none). */
  magnify: number;
  /** Width of the rim zone in pixels. */
  rim: number;
  /** Additional displacement at the outermost edge, in pixels. */
  rimBend: number;
}

export interface Lens {
  /** Map for the x axis (red channel) as a data: URL. */
  mapX: string;
  /** Map for the y axis (green channel) as a data: URL. */
  mapY: string;
  /** Value for `scale` on feDisplacementMap, in pixels. */
  scale: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * Displacement at position `p` (0…1 across the axis), in pixels.
 * Positive means "fetch the image further to the right / further down" —
 * which, for the left half, means inwards.
 */
function displacement(
  p: number,
  length: number,
  magnify: number,
  rimFraction: number,
  rimBend: number,
): number {
  // Lens: linear with the distance from the centre.
  const lens = (0.5 - p) * length * (1 - 1 / magnify);

  // Rim: growing quadratically, so the centre stays calm and the bending
  // only sets in shortly before the edge.
  let edge = 0;
  if (p < rimFraction) {
    edge = rimBend * ((rimFraction - p) / rimFraction) ** 2;
  } else if (p > 1 - rimFraction) {
    edge = -rimBend * ((p - (1 - rimFraction)) / rimFraction) ** 2;
  }

  return lens + edge;
}

/** Sample points: dense in the two rim zones, coarse in between. */
function samples(rimFraction: number): number[] {
  const points = new Set<number>([0, 0.5, 1]);
  for (let i = 0; i <= 8; i++) {
    const p = (rimFraction * i) / 8;
    points.add(p);
    points.add(1 - p);
  }
  for (let i = 1; i < 8; i++) {
    points.add(rimFraction + (1 - 2 * rimFraction) * (i / 8));
  }
  return [...points].sort((a, b) => a - b);
}

function gradientMap(axis: "x" | "y", stops: { at: number; value: number }[]) {
  const direction =
    axis === "x" ? 'x1="0" y1="0" x2="1" y2="0"' : 'x1="0" y1="0" x2="0" y2="1"';

  const body = stops
    .map(({ at, value }) => {
      const byte = Math.round(clamp(value, 0, 1) * 255);
      const color = axis === "x" ? `rgb(${byte},0,0)` : `rgb(0,${byte},0)`;
      return `<stop offset="${+at.toFixed(4)}" stop-color="${color}"/>`;
    })
    .join("");

  // 100 × 100 as the reference size; feImage stretches the map onto the element.
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" ` +
    `viewBox="0 0 100 100" preserveAspectRatio="none">` +
    `<defs><linearGradient id="m" ${direction}>${body}</linearGradient></defs>` +
    `<rect width="100" height="100" fill="url(#m)"/></svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Builds the two displacement maps and the matching `scale` value.
 *
 * Both axes share a single `scale` (feDisplacementMap only knows one). So it
 * is derived from the larger of the two excursions and the other axis is
 * encoded correspondingly flatter — a narrow bar therefore bends less
 * vertically than horizontally, which is also correct: across 56 pixels of
 * height, light simply has less distance to travel.
 */
export function buildLens(profile: LensProfile): Lens {
  const { width, height, magnify, rim, rimBend } = profile;

  // The rim zone must never take up more than a third of each axis, or
  // nothing is left of the calm centre (small balls!).
  const rimX = clamp(rim / Math.max(width, 1), 0.02, 1 / 3);
  const rimY = clamp(rim / Math.max(height, 1), 0.02, 1 / 3);

  // The bend has to suit the axis. On a bar 43 pixels high, a rim
  // displacement of 14 pixels would drag half the image into the rim —
  // "thick glass" would turn into smear. So never more than a sixth.
  const bendX = Math.min(rimBend, width / 6);
  const bendY = Math.min(rimBend, height / 6);

  const stopsX = samples(rimX).map((at) => ({
    at,
    raw: displacement(at, width, magnify, rimX, bendX),
  }));
  const stopsY = samples(rimY).map((at) => ({
    at,
    raw: displacement(at, height, magnify, rimY, bendY),
  }));

  const peak = Math.max(
    ...stopsX.map((s) => Math.abs(s.raw)),
    ...stopsY.map((s) => Math.abs(s.raw)),
    1,
  );
  const scale = peak / CHANNEL_RANGE;

  const encode = (stops: { at: number; raw: number }[]) =>
    stops.map(({ at, raw }) => ({ at, value: 0.5 + raw / scale }));

  return {
    mapX: gradientMap("x", encode(stopsX)),
    mapY: gradientMap("y", encode(stopsY)),
    scale,
  };
}

/**
 * A short, stable fingerprint over the values of a lens.
 *
 * It becomes part of the filter id — and that id has to change as soon as
 * anything about the lens changes. Reason: WebKit resolves
 * `filter: url(#…)` when the element is inserted and keeps that resolution
 * afterwards. Changing attributes inside the filter (or swapping it out and
 * re-pointing the reference) has no effect there; only a new filter *and* a
 * newly inserted layer land. The fingerprint is what triggers that.
 */
export function lensFingerprint(...parts: (string | number)[]): string {
  const input = parts.join("|");
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

/**
 * How can this browser draw the refraction — in this particular place?
 *
 *   "real"  The displacement filters the *real* backdrop: an ordinary
 *           `filter` on an inner layer that itself carries the
 *           `backdrop-filter`. Chromium can always do this; WebKit only in
 *           the top-level document.
 *   "echo"  The displacement filters a *pixel-aligned copy* of the backdrop
 *           (`background-attachment: fixed`) that the environment supplies
 *           through CSS variables — Storybook does this. Needed inside
 *           WebKit iframes (where the engine silently discards SVG filters
 *           on backdrop layers, though not on ordinary content) and in
 *           Gecko (which never filters backdrop results).
 *   "none"  No displacement — frosted glass, as before.
 *
 * None of this can be measured: `CSS.supports()` only answers whether the
 * properties exist individually, and no script can read back what was
 * actually painted. The mapping is the result of visual comparisons (see
 * README, pitfalls) — engine by engine, top level and inside an iframe.
 */
export function refractionMode(): "real" | "echo" | "none" {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return "none";
  }

  const backdrop =
    CSS.supports?.("backdrop-filter", "blur(1px)") ||
    CSS.supports?.("-webkit-backdrop-filter", "blur(1px)");
  if (!backdrop) return "none";

  const ua = navigator.userAgent;

  // Chromium carries "Chrome/<number>" in the user agent.
  if (/Chrome\/\d+/.test(ua)) return "real";

  // Only Firefox carries "Gecko/<number>"; Chrome and Safari write
  // "like Gecko" there.
  if (/\bGecko\/\d+/.test(ua)) return "echo";

  // WebKit: real at the top level, only the copy inside an iframe.
  return window.self === window.top ? "real" : "echo";
}
