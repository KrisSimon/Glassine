<!--
  ATOM · GlassButton
  The "glass ball": a round control that sits on the glass layer. Renders as
  an <a> as soon as an href is present — a shortcut into somewhere is a
  link, not a button (middle click, copy target, status bar).
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { GlassSize } from "../../../types";

  interface Props {
    /** Accessible name. Required — the balls carry only an icon. */
    label: string;
    href?: string;
    target?: string;
    size?: GlassSize;
    /** Highlights the control (reserve it for destructive actions). */
    tone?: "neutral" | "accent";
    disabled?: boolean;
    pressed?: boolean;
    onclick?: (event: MouseEvent) => void;
    children?: Snippet;
  }

  let {
    label,
    href,
    target,
    size = "md",
    tone = "neutral",
    disabled = false,
    pressed,
    onclick,
    children,
  }: Props = $props();
</script>

{#if href && !disabled}
  <a
    class="ball ball--{size} ball--{tone}"
    {href}
    {target}
    rel={target === "_blank" ? "noopener noreferrer" : undefined}
    aria-label={label}
    {onclick}
  >
    {@render children?.()}
  </a>
{:else}
  <button
    type="button"
    class="ball ball--{size} ball--{tone}"
    aria-label={label}
    aria-pressed={pressed}
    {disabled}
    {onclick}
  >
    {@render children?.()}
  </button>
{/if}

<style>
  .ball {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;

    border-radius: 50%;
    background: var(
      --control-bg,
      linear-gradient(160deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.8))
    );
    border: var(--control-border, 0.5px solid rgba(255, 255, 255, 0.95));
    box-shadow: var(
      --control-shadow,
      inset 0 0.5px 0 rgba(255, 255, 255, 1),
      0 1px 2px rgba(20, 20, 30, 0.18)
    );
    color: var(--control-ink, #26262b);

    cursor: pointer;
    text-decoration: none;
    -webkit-appearance: none;
    appearance: none;
    padding: 0;

    transition:
      transform var(--l-dur-fast, 140ms) var(--l-ease-out, cubic-bezier(0.16, 1, 0.3, 1)),
      box-shadow var(--l-dur-fast, 140ms) var(--l-ease-out, cubic-bezier(0.16, 1, 0.3, 1)),
      background var(--l-dur-fast, 140ms) linear;
  }

  .ball--sm {
    width: 26px;
    height: 26px;
  }
  .ball--md {
    width: 34px;
    height: 34px;
  }
  .ball--lg {
    width: 44px;
    height: 44px;
  }

  .ball--accent {
    color: var(--brand-accent-ink, #b8353a);
  }

  .ball:hover {
    background: linear-gradient(
      160deg,
      rgba(255, 255, 255, 1),
      rgba(255, 255, 255, 0.9)
    );
    transform: translateY(-1px);
    box-shadow:
      inset 0 0.5px 0 rgba(255, 255, 255, 1),
      0 3px 7px rgba(20, 20, 30, 0.24);
  }

  .ball:active {
    transform: translateY(0) scale(0.96);
  }

  .ball:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
  }

  .ball--accent:hover {
    color: #fff;
    background: linear-gradient(
      160deg,
      var(--brand-accent, #e5484d),
      var(--brand-accent-ink, #b8353a)
    );
  }
</style>
