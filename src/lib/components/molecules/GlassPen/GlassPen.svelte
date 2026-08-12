<!--
  MOLECULE · GlassPen
  The same surface as the bar, only small. It appears on hover and so keeps
  the view calm; on touch devices it stays visible, because there is no
  hover there to reveal it.
-->
<script lang="ts">
  import GlassSurface from "../../atoms/GlassSurface/GlassSurface.svelte";
  import Icon from "../../atoms/Icon/Icon.svelte";
  import type { GlassSize } from "../../../types";

  interface Props {
    label?: string;
    size?: GlassSize;
    /** Keep visible regardless of the pointer. */
    visible?: boolean;
    onedit?: () => void;
  }

  let {
    label = "Edit",
    size = "sm",
    visible = false,
    onedit,
  }: Props = $props();

  const dim = $derived(size === "lg" ? 32 : size === "md" ? 26 : 22);
  const iconSize = $derived(Math.round(dim * 0.55));
</script>

<button
  type="button"
  class="pen"
  class:pen--visible={visible}
  style:--pen-size="{dim}px"
  aria-label={label}
  onclick={onedit}
>
  <GlassSurface
    shape="circle"
    blur={12}
    saturate={180}
    elevation="raised"
    style="width:100%;height:100%"
  >
    <!-- The pop lives here, inside the glass, rather than on the wrapper
         around it. A transform on an ancestor of the surface re-anchors the
         backdrop copy in echo refraction (see GlassSurface); a transform on
         its content is harmless. -->
    <span class="pen__pop">
      <Icon name="pen" size={iconSize} />
    </span>
  </GlassSurface>
</button>

<style>
  .pen {
    width: var(--pen-size);
    height: var(--pen-size);
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: none;
    cursor: pointer;
    flex: 0 0 auto;

    /* Fades only. Deliberately no transform on this element: it is an
       ancestor of the glass, and in echo refraction a transform above the
       backdrop copy makes it jump. The scale moved inside, to `.pen__pop`. */
    opacity: 0;
    transition: opacity var(--l-dur-base, 220ms)
      var(--l-ease-out, cubic-bezier(0.16, 1, 0.3, 1));
  }

  .pen__pop {
    display: flex;
    align-items: center;
    justify-content: center;
    transform: scale(0.9);
    transition: transform var(--l-dur-base, 220ms)
      var(--l-ease-out, cubic-bezier(0.16, 1, 0.3, 1));
  }

  .pen--visible,
  .pen:focus-visible {
    opacity: 1;
  }

  .pen--visible .pen__pop,
  .pen:focus-visible .pen__pop {
    transform: scale(1);
  }

  /* Without a pointer there is no hover — so the pen stays put. */
  @media (hover: none) {
    .pen {
      opacity: 1;
    }
    .pen__pop {
      transform: scale(1);
    }
  }
</style>
