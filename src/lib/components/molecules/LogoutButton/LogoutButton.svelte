<!--
  MOLECULE · LogoutButton
  Set apart at the right-hand end: spatially separated so it is not hit by
  accident. The separation itself is the GlassDivider in the bar — here a
  switch to the accent colour on hover is enough as an acknowledgement.
-->
<script lang="ts">
  import GlassButton from "../../atoms/GlassButton/GlassButton.svelte";
  import Icon from "../../atoms/Icon/Icon.svelte";
  import Tooltip from "../../atoms/Tooltip/Tooltip.svelte";
  import type { GlassSize } from "../../../types";

  interface Props {
    href?: string;
    size?: GlassSize;
    label?: string;
    onlogout?: () => void;
  }

  let {
    href = "#sign-out",
    size = "md",
    label = "Sign out",
    onlogout,
  }: Props = $props();

  const iconSize = $derived(size === "sm" ? 14 : size === "lg" ? 20 : 17);

  function handleClick(event: MouseEvent) {
    if (onlogout) {
      event.preventDefault();
      onlogout();
    }
  }
</script>

<Tooltip {label}>
  <GlassButton {label} {href} {size} tone="accent" onclick={handleClick}>
    <Icon name="power" size={iconSize} />
  </GlassButton>
</Tooltip>
