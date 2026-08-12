<!--
  ATOM · CountBadge
  A small counter pinned to the corner of a control. The accent is the only
  colour on the entire glass layer, which is exactly why it reads as a
  signal rather than as decoration.

  Positions itself absolutely, so its parent needs `position: relative` —
  `GlassButton` already provides that.
-->
<script lang="ts">
  interface Props {
    count: number;
    /** Abbreviated above this value: 100 becomes "99+". */
    max?: number;
    /** Plain text for screen readers, e.g. "unread messages". */
    label?: string;
  }

  let { count, max = 99, label = "new" }: Props = $props();

  const display = $derived(count > max ? `${max}+` : String(count));
</script>

{#if count > 0}
  <span class="badge">
    <span aria-hidden="true">{display}</span>
    <span class="sr-only">{count} {label}</span>
  </span>
{/if}

<style>
  .badge {
    position: absolute;
    top: -3px;
    right: -3px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    background: var(--brand-accent, #e5484d);
    color: #fff;
    border-radius: var(--l-radius-pill, 999px);
    border: 1.5px solid rgba(255, 255, 255, 0.9);

    font-size: 10px;
    font-weight: 800;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.01em;

    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.28);
    pointer-events: none;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
</style>
