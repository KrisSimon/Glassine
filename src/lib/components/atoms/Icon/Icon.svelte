<!--
  ATOM · Icon
  A small monoline icon set, sized for glass. Deliberately 1.6px stroke on a
  24 grid: that is what stays legible at 16px on a translucent surface,
  where a hairline would simply dissolve into the backdrop.

  Not a general-purpose icon library — just enough symbols to build the demo
  compositions. Swap in your own set by rendering any SVG into the same
  slots; nothing else in this library depends on these particular glyphs.
-->
<script lang="ts">
  import type { IconName } from "../../../types";

  interface Props {
    name: IconName;
    /** Edge length in px. */
    size?: number;
    /** Accessible name. Without it the icon is hidden from assistive tech,
     *  which is correct whenever the surrounding control is already labelled. */
    title?: string;
  }

  let { name, size = 18, title }: Props = $props();
</script>

<svg
  class="icon"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.6"
  stroke-linecap="round"
  stroke-linejoin="round"
  role={title ? "img" : "presentation"}
  aria-hidden={title ? undefined : "true"}
>
  {#if title}<title>{title}</title>{/if}

  {#if name === "user"}
    <!-- Profile card with a person -->
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <circle cx="9" cy="11" r="2.2" />
    <path d="M5.8 16.2c.7-1.5 1.9-2.2 3.2-2.2s2.5.7 3.2 2.2M15 10h3.5M15 13.5h3.5" />
  {:else if name === "calendar"}
    <rect x="3.5" y="5" width="17" height="15" rx="3" />
    <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
    <circle cx="9" cy="14" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="13" cy="14" r="1.1" fill="currentColor" stroke="none" />
  {:else if name === "chart"}
    <!-- Document with an analysis -->
    <path d="M6 3.5h7.5L18.5 8.5V19a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 19V5A1.5 1.5 0 0 1 6 3.5Z" />
    <path d="M13.5 3.5v5h5M8.5 16.5v-2.5M11.5 16.5v-5M14.5 16.5v-3.5" />
  {:else if name === "network"}
    <!-- Connected nodes -->
    <circle cx="12" cy="5.5" r="2.2" />
    <circle cx="5.5" cy="17" r="2.2" />
    <circle cx="18.5" cy="17" r="2.2" />
    <path d="M10.4 7.4 7 14.9M13.6 7.4 17 14.9M7.7 17h8.6" />
  {:else if name === "broadcast"}
    <!-- Reach / megaphone -->
    <path d="M4 9.5v5a1.5 1.5 0 0 0 1.5 1.5H8l6 4V5.5l-6 4H5.5A1.5 1.5 0 0 0 4 11Z" />
    <path d="M17.5 9c1 .9 1.6 1.9 1.6 3s-.6 2.1-1.6 3" />
  {:else if name === "briefcase"}
    <rect x="3" y="7.5" width="18" height="12" rx="2.5" />
    <path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5M3 12.5h18M11 12.5v2h2v-2" />
  {:else if name === "inbox"}
    <path d="M3.5 13.5 6 5.8A2 2 0 0 1 7.9 4.5h8.2A2 2 0 0 1 18 5.8l2.5 7.7" />
    <path d="M3.5 13.5h4l1 2.5h7l1-2.5h4v4.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z" />
  {:else if name === "mail"}
    <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
    <path d="m4 7.5 6.9 5a2 2 0 0 0 2.2 0l6.9-5" />
  {:else if name === "power"}
    <path d="M12 3.5v8.5" />
    <path d="M17.2 6.6a7 7 0 1 1-10.4 0" />
  {:else if name === "pen"}
    <path d="M4.5 19.5h4L19 9a2.5 2.5 0 0 0-3.5-3.5L5 16v3.5Z" />
    <path d="m14.5 7 2.5 2.5" />
  {:else if name === "grid"}
    <rect x="3.5" y="4.5" width="17" height="15" rx="3" />
    <path d="M3.5 9h17M9 9v10.5" />
  {:else if name === "search"}
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.2 15.2 4.3 4.3" />
  {:else if name === "settings"}
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3" />
  {:else if name === "bell"}
    <path d="M6 10a6 6 0 0 1 12 0c0 4 1.3 5.5 1.8 6H4.2C4.7 15.5 6 14 6 10Z" />
    <path d="M10 19.5a2.2 2.2 0 0 0 4 0" />
  {:else if name === "star"}
    <path d="m12 3.8 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 10l5.9-.9Z" />
  {:else if name === "heart"}
    <path d="M12 20s-7.5-4.4-7.5-9.3A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7.5 2.7C19.5 15.6 12 20 12 20Z" />
  {:else if name === "play"}
    <path d="M8 5.5 18.5 12 8 18.5Z" />
  {:else if name === "plus"}
    <path d="M12 5v14M5 12h14" />
  {/if}
</svg>

<style>
  .icon {
    display: block;
    flex: 0 0 auto;
  }
</style>
