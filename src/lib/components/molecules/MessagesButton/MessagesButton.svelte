<!--
  MOLECULE · MessagesButton
  Messages with a counter. Worth its own icon rather than a dot on the bar:
  "3 new" is the reason someone switches context in the first place, so it
  should be readable at a glance.
-->
<script lang="ts">
  import GlassButton from "../../atoms/GlassButton/GlassButton.svelte";
  import Icon from "../../atoms/Icon/Icon.svelte";
  import CountBadge from "../../atoms/CountBadge/CountBadge.svelte";
  import Tooltip from "../../atoms/Tooltip/Tooltip.svelte";
  import type { GlassSize } from "../../../types";

  interface Props {
    count?: number;
    href?: string;
    size?: GlassSize;
    label?: string;
    onopen?: () => void;
  }

  let {
    count = 0,
    href = "#messages",
    size = "md",
    label = "Messages",
    onopen,
  }: Props = $props();

  const iconSize = $derived(size === "sm" ? 14 : size === "lg" ? 22 : 18);
  const accessibleName = $derived(
    count > 0 ? `${label}, ${count} new` : `${label}, none new`,
  );

  function handleClick(event: MouseEvent) {
    if (onopen) {
      event.preventDefault();
      onopen();
    }
  }
</script>

<Tooltip label={count > 0 ? `${label} · ${count} new` : label}>
  <GlassButton label={accessibleName} {href} {size} onclick={handleClick}>
    <Icon name="mail" size={iconSize} />
    <CountBadge {count} label="new messages" />
  </GlassButton>
</Tooltip>
