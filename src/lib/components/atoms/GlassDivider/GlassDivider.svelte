<!--
  ATOM · GlassDivider
  Not a line but a slit of light: faded out at both ends, so the panel does
  not fall apart into two halves. Use it to set one control apart from the
  rest — the distance around it does more to prevent mis-clicks than any
  warning colour would.
-->
<script lang="ts">
  interface Props {
    orientation?: "vertical" | "horizontal";
    /** Length in px along the axis. */
    length?: number;
  }

  let { orientation = "vertical", length = 20 }: Props = $props();
</script>

<span
  class="divider divider--{orientation}"
  style:--divider-length="{length}px"
  role="separator"
  aria-orientation={orientation}
></span>

<style>
  .divider {
    display: block;
    flex: 0 0 auto;
    pointer-events: none;
  }

  .divider--vertical {
    width: 1px;
    height: var(--divider-length);
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0),
      rgba(70, 70, 80, 0.45),
      rgba(255, 255, 255, 0)
    );
  }

  .divider--horizontal {
    height: 1px;
    width: var(--divider-length);
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0),
      rgba(70, 70, 80, 0.45),
      rgba(255, 255, 255, 0)
    );
  }
</style>
