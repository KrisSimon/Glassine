<!--
  MOLECULE · LauncherButton
  Icon + counter + plain-text label = one shortcut into somewhere.
  Composed from Tooltip, GlassButton, Icon and CountBadge.
-->
<script lang="ts">
  import GlassButton from "../../atoms/GlassButton/GlassButton.svelte";
  import Icon from "../../atoms/Icon/Icon.svelte";
  import CountBadge from "../../atoms/CountBadge/CountBadge.svelte";
  import Tooltip from "../../atoms/Tooltip/Tooltip.svelte";
  import type { GlassSize, LauncherItem } from "../../../types";

  interface Props {
    item: LauncherItem;
    size?: GlassSize;
    /** Plain-text label on hover. Turn off for very dense bars. */
    showTooltip?: boolean;
    onopen?: (item: LauncherItem) => void;
  }

  let { item, size = "md", showTooltip = true, onopen }: Props = $props();

  const iconSize = $derived(size === "sm" ? 14 : size === "lg" ? 22 : 18);

  function handleClick(event: MouseEvent) {
    if (onopen) {
      event.preventDefault();
      onopen(item);
    }
  }
</script>

{#snippet control()}
  <GlassButton
    label={item.count ? `${item.label}, ${item.count} new` : item.label}
    href={item.href}
    {size}
    onclick={handleClick}
  >
    <Icon name={item.icon} size={iconSize} />
    {#if item.count}
      <CountBadge count={item.count} label="new" />
    {/if}
  </GlassButton>
{/snippet}

{#if showTooltip}
  <Tooltip label={item.label}>
    {@render control()}
  </Tooltip>
{:else}
  {@render control()}
{/if}
