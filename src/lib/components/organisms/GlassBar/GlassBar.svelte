<!--
  ORGANISM · GlassBar
  A translucent glass capsule holding a row of controls:

    [ items … | messages ]  ·|·  [ sign out ]

  Order is meaning: on the left what you need daily; on the right, behind
  the slit of light, what you want rarely and never by accident.

  Operation: a toolbar in the WAI-ARIA sense — Tab moves *into* the bar,
  arrow keys move *within* it. That way an extra layer costs keyboard users
  exactly one tab stop rather than one per control.
-->
<script lang="ts">
  import GlassSurface from "../../atoms/GlassSurface/GlassSurface.svelte";
  import GlassDivider from "../../atoms/GlassDivider/GlassDivider.svelte";
  import GlassButton from "../../atoms/GlassButton/GlassButton.svelte";
  import Icon from "../../atoms/Icon/Icon.svelte";
  import Tooltip from "../../atoms/Tooltip/Tooltip.svelte";
  import LauncherButton from "../../molecules/LauncherButton/LauncherButton.svelte";
  import MessagesButton from "../../molecules/MessagesButton/MessagesButton.svelte";
  import LogoutButton from "../../molecules/LogoutButton/LogoutButton.svelte";
  import type { GlassSize, LauncherItem } from "../../../types";

  interface Props {
    /** The entries to show. */
    items?: LauncherItem[];
    messageCount?: number;
    /** Above this many entries the rest collapse into one "more" control. */
    maxVisible?: number;
    size?: GlassSize;
    /** Refraction like a solid block of glass. `false` gives frosted glass. */
    refraction?: boolean | "auto";
    /** Magnification of the backdrop under the bar. */
    magnify?: number;
    showMessages?: boolean;
    showLogout?: boolean;
    showTooltips?: boolean;
    /** Target of the "more" control. */
    overflowHref?: string;
    label?: string;
    onopenitem?: (item: LauncherItem) => void;
    onopenmessages?: () => void;
    onlogout?: () => void;
  }

  let {
    items = [],
    messageCount = 0,
    maxVisible = 7,
    size = "md",
    refraction = "auto",
    magnify,
    showMessages = true,
    showLogout = true,
    showTooltips = true,
    overflowHref = "#more",
    label = "Quick access",
    onopenitem,
    onopenmessages,
    onlogout,
  }: Props = $props();

  const visibleItems = $derived(items.slice(0, maxVisible));
  const overflowCount = $derived(Math.max(0, items.length - maxVisible));
  const iconSize = $derived(size === "sm" ? 14 : size === "lg" ? 22 : 18);
  const dividerLength = $derived(size === "sm" ? 16 : size === "lg" ? 26 : 20);

  let bar = $state<HTMLElement | null>(null);

  function controls(): HTMLElement[] {
    if (!bar) return [];
    return Array.from(
      bar.querySelectorAll<HTMLElement>("a[href], button:not(:disabled)"),
    );
  }

  /** Roving tabindex: the bar is exactly one tab stop. */
  function rove(active: HTMLElement | null) {
    const list = controls();
    const target = active && list.includes(active) ? active : list[0];
    for (const item of list) {
      item.tabIndex = item === target ? 0 : -1;
    }
  }

  $effect(() => {
    // Rebuild as soon as the composition of the bar changes.
    void visibleItems;
    void showLogout;
    void showMessages;
    void overflowCount;
    rove(document.activeElement as HTMLElement);
  });

  /** Arrows walk the controls, Home/End jump to the ends. */
  function handleKeydown(event: KeyboardEvent) {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(event.key)) return;

    const list = controls();
    if (list.length === 0) return;

    const current = list.indexOf(document.activeElement as HTMLElement);
    let next = current;

    if (event.key === "ArrowRight") next = (current + 1) % list.length;
    else if (event.key === "ArrowLeft")
      next = (current - 1 + list.length) % list.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = list.length - 1;

    if (next !== current && next >= 0) {
      event.preventDefault();
      list[next].focus();
    }
  }
</script>

<GlassSurface
  shape="pill"
  elevation="floating"
  {refraction}
  {magnify}
  class="glass-bar glass-bar--{size}"
>
  <div
    class="bar"
    bind:this={bar}
    role="toolbar"
    tabindex="-1"
    aria-label={label}
    aria-orientation="horizontal"
    onkeydown={handleKeydown}
    onfocusin={(e) => rove(e.target as HTMLElement)}
  >
    {#each visibleItems as item (item.id)}
      <LauncherButton {item} {size} showTooltip={showTooltips} onopen={onopenitem} />
    {/each}

    {#if overflowCount > 0}
      <Tooltip label="{overflowCount} more">
        <GlassButton label="Show {overflowCount} more" href={overflowHref} {size}>
          <Icon name="grid" size={iconSize} />
        </GlassButton>
      </Tooltip>
    {/if}

    {#if showMessages}
      <MessagesButton count={messageCount} {size} onopen={onopenmessages} />
    {/if}

    <!-- Set apart: the destructive action -->
    {#if showLogout}
      <span class="bar__gap"></span>
      <GlassDivider length={dividerLength} />
      <span class="bar__gap"></span>
      <LogoutButton {size} {onlogout} />
    {/if}
  </div>
</GlassSurface>

<style>
  .bar {
    display: flex;
    align-items: center;
    gap: var(--bar-gap, var(--l-space-3, 6px));
    padding: var(--bar-pad-y, var(--l-space-2, 4px))
      var(--bar-pad-x, var(--l-space-3, 6px));
  }

  /* The gap before the slit is the actual protection against mis-clicks —
     not the slit itself. */
  .bar__gap {
    display: block;
    width: var(--l-space-1, 2px);
    flex: 0 0 auto;
  }

  :global(.glass-bar--sm) .bar {
    --bar-gap: var(--l-space-2, 4px);
    --bar-pad-x: var(--l-space-2, 4px);
  }

  :global(.glass-bar--lg) .bar {
    --bar-gap: var(--l-space-4, 8px);
    --bar-pad-x: var(--l-space-4, 8px);
    --bar-pad-y: var(--l-space-3, 6px);
  }
</style>
