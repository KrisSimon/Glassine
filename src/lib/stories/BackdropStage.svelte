<!--
  STORY HELPER · BackdropStage
  A patch of backdrop with children centred on it, for stories that want to
  offer the backdrop as a control rather than only through the toolbar.

  `background-attachment: fixed` is not decoration: the copy that
  `GlassSurface` filters in echo mode is painted against the viewport, so
  the stage has to be painted against the viewport too. Otherwise the
  refracted image would sit a few pixels off the real one.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { BACKDROPS, backdropStyle, type BackdropName } from "./backdrops";

  interface Props {
    backdrop?: BackdropName;
    /** Height of the stage. Give the panel room to sit in. */
    height?: string;
    /** Show the one-line note about what this backdrop is testing. */
    caption?: boolean;
    children?: Snippet;
  }

  let {
    backdrop = "probe",
    height = "420px",
    caption = true,
    children,
  }: Props = $props();

  const vars = $derived(backdropStyle(backdrop));
  const note = $derived(BACKDROPS[backdrop].note);
  const title = $derived(BACKDROPS[backdrop].title);
</script>

<div class="stage" style={vars} style:min-height={height}>
  <div class="stage__content">
    {@render children?.()}
  </div>

  {#if caption}
    <p class="stage__caption">
      <strong>{title}</strong>
      {note}
    </p>
  {/if}
</div>

<style>
  .stage {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    overflow: hidden;

    background-color: var(--sb-backdrop-color, transparent);
    background-image: var(--sb-backdrop, none);
    background-size: var(--sb-backdrop-size, cover);
    background-repeat: var(--sb-backdrop-repeat, no-repeat);
    background-position: var(--sb-backdrop-position, center);
    /* Aligned with the echo copy — see the comment at the top. */
    background-attachment: fixed;
  }

  .stage__content {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 24px;
    padding: 32px;
  }

  .stage__caption {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    margin: 0;
    padding: 8px 14px;

    background: rgba(18, 18, 22, 0.72);
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);
    color: rgba(255, 255, 255, 0.86);

    font-family: var(--l-font-sans, "Helvetica Neue", Helvetica, Arial, sans-serif);
    font-size: 11px;
    line-height: 1.5;
  }

  .stage__caption strong {
    color: #fff;
    margin-right: 6px;
  }
</style>
