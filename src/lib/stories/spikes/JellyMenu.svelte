<!--
  SPIKE · JellyMenu
  The menu case, which is the interesting one: two wobbles at different
  scales at the same time.

  Picking an item pokes the *item* hard and the *panel* softly, from the
  same point. That reads as one object made of one material — a menu whose
  panel sits still while its rows wobble reads as a sticker on glass.

  The panel's wobble is deliberately slower and lower-amplitude than the
  item's. Bigger bodies of liquid move more slowly; matching frequencies
  would make the two look mechanically linked.
-->
<script lang="ts">
  import GlassSurface from "../../components/atoms/GlassSurface/GlassSurface.svelte";
  import Icon from "../../components/atoms/Icon/Icon.svelte";
  import { useWobble, type WobbleTuning } from "../../motion/wobble.svelte";
  import type { IconName } from "../../types";

  interface Props extends WobbleTuning {
    items?: { id: string; label: string; icon: IconName; hint?: string }[];
    refraction?: boolean | "auto";
    /** How much of the item's wobble the whole panel takes on, 0…1. */
    sympathy?: number;
  }

  let {
    items = [],
    refraction = "auto",
    sympathy = 0.35,
    ...tuning
  }: Props = $props();

  let panelEl = $state<HTMLElement | null>(null);
  let selected = $state<string | null>(null);
  let mode = $state<"real" | "echo" | "none">("none");

  /* In echo refraction a transform on the glass re-anchors the backdrop
     copy and makes it jump — see JellySurface for the full story. The rows
     are ordinary DOM inside the panel, so their transform is always safe;
     only the panel's own has to be withheld. */
  const transformOnPanel = $derived(mode !== "echo");

  const panel = useWobble(() => ({
    ...tuning,
    amplitude: (tuning.amplitude ?? 0.07) * sympathy,
    frequency: (tuning.frequency ?? 2.4) * 0.72,
    ripple: false,
  }));

  /** One oscillator, reused: only one row can be picked at a time, so a
      wobble per row would be state nobody reads. */
  const item = useWobble(() => ({ ...tuning, corners: 0 }));

  function pick(event: MouseEvent, id: string) {
    selected = id;
    item.kick(event, event.currentTarget as HTMLElement);
    panel.kick(event, panelEl);
  }
</script>

<div class="menu" bind:this={panelEl}>
  <GlassSurface
    shape="rounded"
    elevation="floating"
    {refraction}
    style={transformOnPanel ? panel.style : panel.shapeStyle}
    onmode={(m) => (mode = m)}
  >
    <ul class="menu__list" role="menu">
      {#each items as entry (entry.id)}
        <li role="none">
          <button
            type="button"
            role="menuitem"
            class="menu__item"
            class:menu__item--selected={selected === entry.id}
            style={selected === entry.id ? item.style : ""}
            onclick={(e) => pick(e, entry.id)}
          >
            <Icon name={entry.icon} size={17} />
            <span class="menu__label">{entry.label}</span>
            {#if entry.hint}
              <span class="menu__hint">{entry.hint}</span>
            {/if}
          </button>
        </li>
      {/each}
    </ul>
  </GlassSurface>
</div>

<style>
  .menu {
    display: inline-flex;
  }

  .menu__list {
    margin: 0;
    padding: 6px;
    list-style: none;
    min-width: 232px;
  }

  .menu__item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px 12px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: inherit;
    text-align: left;
    cursor: pointer;

    font-family: var(--l-font-sans, "Helvetica Neue", Helvetica, Arial, sans-serif);
    font-size: 13px;
    font-weight: 600;
    /* The row deforms about its own middle; an off-centre origin inside a
       list reads as the row escaping the menu. */
    transform-origin: 50% 50%;
  }

  .menu__item:hover {
    background: rgba(255, 255, 255, 0.34);
  }

  .menu__item--selected {
    background: rgba(255, 255, 255, 0.52);
  }

  .menu__label {
    flex: 1 1 auto;
  }

  .menu__hint {
    font-size: 11px;
    font-weight: 500;
    opacity: 0.55;
    font-variant-numeric: tabular-nums;
  }
</style>
