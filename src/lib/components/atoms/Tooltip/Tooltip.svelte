<!--
  ATOM · Tooltip
  The plain-text label for an icon. Purely declarative (:hover /
  :focus-within), so it works while JavaScript is still loading. Touch
  devices never see it — there the aria-label carries the meaning.
-->
<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    label: string;
    placement?: "top" | "bottom";
    children?: Snippet;
  }

  let { label, placement = "bottom", children }: Props = $props();
</script>

<span class="tip tip--{placement}">
  {@render children?.()}
  <span class="tip__bubble" aria-hidden="true">{label}</span>
</span>

<style>
  .tip {
    position: relative;
    display: inline-flex;
  }

  .tip__bubble {
    position: absolute;
    left: 50%;
    z-index: 3;

    padding: 4px 8px;
    border-radius: 7px;
    background: rgba(24, 24, 28, 0.88);
    -webkit-backdrop-filter: blur(6px);
    backdrop-filter: blur(6px);
    color: #fff;

    font-size: 11px;
    font-weight: 600;
    line-height: 1.3;
    letter-spacing: 0.01em;
    white-space: nowrap;

    opacity: 0;
    pointer-events: none;
    transform: translate(-50%, -2px);
    transition:
      opacity var(--l-dur-fast, 140ms) var(--l-ease-out, cubic-bezier(0.16, 1, 0.3, 1)),
      transform var(--l-dur-fast, 140ms) var(--l-ease-out, cubic-bezier(0.16, 1, 0.3, 1));
  }

  .tip--bottom .tip__bubble {
    top: calc(100% + 8px);
  }
  .tip--top .tip__bubble {
    bottom: calc(100% + 8px);
    transform: translate(-50%, 2px);
  }

  .tip:hover .tip__bubble,
  .tip:focus-within .tip__bubble {
    opacity: 1;
    transform: translate(-50%, 0);
  }

  /* Pointerless operation: no hover tooltip left hanging around. */
  @media (hover: none) {
    .tip__bubble {
      display: none;
    }
  }
</style>
