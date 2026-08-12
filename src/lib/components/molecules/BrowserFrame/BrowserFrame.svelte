<!--
  MOLECULE · BrowserFrame
  A chromeless browser window for presentation only. Useful in Storybook and
  in slides to show that the glass layer belongs to a page rather than
  floating in a void.
-->
<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    url?: string;
    /** Aspect ratio of the content area, e.g. "1440 / 726". */
    ratio?: string;
    children?: Snippet;
  }

  let { url = "example.com", ratio, children }: Props = $props();
</script>

<div class="frame">
  <div class="frame__bar">
    <i class="frame__dot"></i>
    <i class="frame__dot"></i>
    <i class="frame__dot"></i>
    <span class="frame__url">{url}</span>
  </div>
  <div class="frame__viewport" style:aspect-ratio={ratio}>
    {@render children?.()}
  </div>
</div>

<style>
  .frame {
    border: 1px solid var(--l-line, #e4e3e0);
    border-radius: 12px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 12px 34px rgba(20, 20, 30, 0.1);
  }

  .frame__bar {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: #f7f6f4;
    border-bottom: 1px solid var(--l-line, #e4e3e0);
  }

  .frame__dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #d9d7d3;
  }

  .frame__url {
    margin-left: 10px;
    padding: 3px 12px;
    border-radius: var(--l-radius-pill, 999px);
    background: #fff;
    border: 1px solid var(--l-line, #e4e3e0);
    font-size: 11px;
    color: var(--l-ink-500, #55565a);
  }

  .frame__viewport {
    position: relative;
    overflow: hidden;
    background: #fff;
  }
</style>
