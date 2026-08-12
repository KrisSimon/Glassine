/**
 * Wobble — a damped oscillator, for making a glass surface behave like a
 * bubble of liquid when it is poked.
 *
 * SPIKE. Not wired into any component yet; `src/lib/stories/spikes/` uses
 * it so the behaviour can be judged before it spreads.
 *
 * The model is an impact, not a transition: a poke lands, the surface
 * deforms immediately, then oscillates around its rest shape and dies away.
 * So the value starts at its peak rather than at zero.
 *
 *     s(t) = e^(−damping · t) · cos(2π · frequency · t)
 *
 * Solved analytically rather than integrated per frame. A stepped spring
 * accumulates error when frames are dropped, and a dropped frame is exactly
 * when a wobble is most likely to be running.
 *
 * Two things this deliberately does NOT do:
 *
 * · It never touches `magnify`, `rim` or any other lens parameter. Those
 *   change the measured lens, and changing the lens rebuilds the SVG filter
 *   — sixty times a second that tears the panel apart. The refraction still
 *   appears to deform, because scaling the element scales the filtered
 *   result along with it. Free, and safe by construction.
 *
 * · It never animates width, height or padding. Only `transform` and
 *   `border-radius`, so no layout is invalidated and no `ResizeObserver`
 *   anywhere is woken up.
 */

export interface WobbleTuning {
  /** Peak deformation as a fraction of size. 0.07 is a firm jelly. */
  amplitude?: number;
  /** Oscillations per second. Lower reads as heavier and more viscous. */
  frequency?: number;
  /** How fast it dies away, per second. Lower rings for longer. */
  damping?: number;
  /** Squash and stretch. The main event. */
  squash?: boolean;
  /** Peak corner deformation in px. Needs `radius`. 0 turns it off. */
  corners?: number;
  /** Resting corner radius in px, so the corner morph knows where to sit. */
  radius?: number | null;
  /** Deform away from where the poke landed rather than from the centre. */
  originAtPoint?: boolean;
  /** A ring travelling out from the poke. */
  ripple?: boolean;
  /** Seconds the ring takes to cross the surface. */
  rippleLife?: number;
}

const DEFAULTS = {
  amplitude: 0.07,
  frequency: 2.4,
  damping: 3.6,
  squash: true,
  corners: 0,
  radius: null,
  originAtPoint: true,
  ripple: true,
  rippleLife: 0.62,
} satisfies Required<WobbleTuning>;

/** Below this the oscillation is not visible and the loop can stop. */
const FLOOR = 0.003;

export class Wobble {
  #tuning: () => WobbleTuning;
  #startedAt = 0;
  #frame = 0;

  /** The oscillator, −1…1, decaying to 0. */
  value = $state(0);
  /** A quarter-period behind `value`. The corners lag the squash, the way
      the rim of a real drop is still moving when the centre has stopped. */
  lag = $state(0);
  /** The decay envelope, 1…0. Zero means at rest. */
  envelope = $state(0);
  /** Seconds since the poke landed. */
  age = $state(0);
  /** Where the poke landed, in fractions of the element, 0…1. */
  point = $state<{ x: number; y: number } | null>(null);

  constructor(tuning: () => WobbleTuning = () => ({})) {
    this.#tuning = tuning;
  }

  get #t(): Required<WobbleTuning> {
    return { ...DEFAULTS, ...this.#tuning() };
  }

  get active(): boolean {
    return this.envelope > 0;
  }

  /**
   * Poke it. Pass the event and the element it landed on to deform away
   * from the right place; pass nothing to deform from the centre.
   */
  kick(event?: { clientX: number; clientY: number }, element?: HTMLElement | null) {
    if (event && element) {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        this.point = {
          x: Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1),
          y: Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1),
        };
      }
    } else {
      this.point = null;
    }

    // Restart rather than accumulate: a second poke re-energises the same
    // oscillator instead of stacking a second one on top, which is both
    // what a real surface does and what stops rapid clicking from tearing.
    this.#startedAt = performance.now();
    if (!this.#frame) this.#frame = requestAnimationFrame(this.#tick);
  }

  stop() {
    cancelAnimationFrame(this.#frame);
    this.#frame = 0;
    this.value = 0;
    this.lag = 0;
    this.envelope = 0;
    this.age = 0;
  }

  #tick = () => {
    const { frequency, damping, ripple, rippleLife } = this.#t;
    const t = (performance.now() - this.#startedAt) / 1000;
    const env = Math.exp(-damping * t);

    const ringing = env >= FLOOR;
    const rippling = ripple && t < rippleLife;

    if (!ringing && !rippling) {
      this.#frame = 0;
      this.value = 0;
      this.lag = 0;
      this.envelope = 0;
      return;
    }

    const w = 2 * Math.PI * frequency;
    // Two slightly detuned modes rather than one. A single cosine reads as
    // a mechanical bounce; the beat between two reads as fluid.
    const shape = (phase: number) =>
      0.78 * Math.cos(w * t + phase) + 0.22 * Math.cos(1.87 * w * t + phase + 0.6);

    this.value = ringing ? env * shape(0) : 0;
    this.lag = ringing ? env * shape(-Math.PI / 2) : 0;
    this.envelope = ringing ? env : 0;
    this.age = t;

    this.#frame = requestAnimationFrame(this.#tick);
  };

  /**
   * The squash, as a `transform`. Split out from `shapeStyle` on purpose:
   * a transform is not always safe to put on the glass itself.
   *
   * In `"echo"` refraction the panel's backdrop copy is anchored with
   * `background-attachment: fixed`, and the CSS Transforms spec makes a
   * transformed element the containing block for *descendant fixed
   * background attachments*. Transform the glass and that copy re-anchors
   * from the viewport to the panel — it jumps, and a `cover` background
   * suddenly resolves against a 400px box instead of a whole screen. The
   * caller therefore needs to be able to put this somewhere else.
   */
  get deformStyle(): string {
    if (!this.active && this.value === 0) return "";
    const t = this.#t;
    if (!t.squash) return "";

    const a = t.amplitude * this.value;
    // What it gains across it loses down: roughly volume-preserving, which
    // is the difference between a bubble and a balloon.
    const parts = [`transform:scale(${(1 + a).toFixed(4)},${(1 - a).toFixed(4)})`];

    if (t.originAtPoint && this.point) {
      // Only 60% of the way to the poke. Scaling about the exact point
      // reads as the panel sliding sideways rather than deforming.
      const ox = 50 + (this.point.x * 100 - 50) * 0.6;
      const oy = 50 + (this.point.y * 100 - 50) * 0.6;
      parts.push(`transform-origin:${ox.toFixed(1)}% ${oy.toFixed(1)}%`);
    }

    return parts.join(";");
  }

  /** The corner morph. Safe on the glass in every mode — `border-radius`
      creates no containing block, so nothing re-anchors. */
  get shapeStyle(): string {
    if (!this.active && this.value === 0) return "";
    const t = this.#t;
    if (!(t.corners > 0) || t.radius == null) return "";

    const q = t.corners * this.lag;
    const a = Math.max(0, t.radius + q);
    const b = Math.max(0, t.radius - q);
    // Opposite corners move together, so the silhouette leans rather than
    // simply breathing.
    return `border-radius:${a}px ${b}px ${a}px ${b}px / ${b}px ${a}px ${b}px ${a}px`;
  }

  /** Both together. Correct wherever a transform on the glass is safe —
      which is `"real"` and `"none"` refraction, i.e. Chromium everywhere
      and WebKit outside an iframe. */
  get style(): string {
    return [this.shapeStyle, this.deformStyle].filter(Boolean).join(";");
  }

  /** The travelling ring, or null when there is nothing to draw. */
  get ring(): { x: number; y: number; radius: number; opacity: number } | null {
    const t = this.#t;
    if (!t.ripple || this.age <= 0 || this.age >= t.rippleLife) return null;
    const p = this.age / t.rippleLife;
    return {
      x: (this.point?.x ?? 0.5) * 100,
      y: (this.point?.y ?? 0.5) * 100,
      // Eases out: fast while the impact is fresh, then coasting.
      radius: 140 * (1 - (1 - p) ** 2),
      opacity: (1 - p) ** 1.6,
    };
  }
}

/**
 * Convenience for components: a `Wobble` that cleans its animation frame up
 * when the component is destroyed.
 */
export function useWobble(tuning: () => WobbleTuning = () => ({})): Wobble {
  const wobble = new Wobble(tuning);
  $effect(() => () => wobble.stop());
  return wobble;
}
