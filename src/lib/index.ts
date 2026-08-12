/**
 * Glassine — a liquid-glass surface for the web.
 *
 * `GlassSurface` is the component; everything else is either built from it
 * or exists to demonstrate it. Import what you need:
 *
 *   import { GlassSurface } from "$lib";
 *
 * The components carry their own styling. Importing `tokens/tokens.css` is
 * optional and only needed to retheme them all at once.
 */

// Atoms
export { default as GlassSurface } from "./components/atoms/GlassSurface/GlassSurface.svelte";
export { default as GlassButton } from "./components/atoms/GlassButton/GlassButton.svelte";
export { default as GlassDivider } from "./components/atoms/GlassDivider/GlassDivider.svelte";
export { default as CountBadge } from "./components/atoms/CountBadge/CountBadge.svelte";
export { default as Icon } from "./components/atoms/Icon/Icon.svelte";
export { default as Tooltip } from "./components/atoms/Tooltip/Tooltip.svelte";

// Molecules
export { default as LauncherButton } from "./components/molecules/LauncherButton/LauncherButton.svelte";
export { default as MessagesButton } from "./components/molecules/MessagesButton/MessagesButton.svelte";
export { default as LogoutButton } from "./components/molecules/LogoutButton/LogoutButton.svelte";
export { default as GlassPen } from "./components/molecules/GlassPen/GlassPen.svelte";
export { default as BrowserFrame } from "./components/molecules/BrowserFrame/BrowserFrame.svelte";

// Organisms
export { default as GlassBar } from "./components/organisms/GlassBar/GlassBar.svelte";
export { default as Dock } from "./components/organisms/Dock/Dock.svelte";
export { default as InlineEditable } from "./components/organisms/InlineEditable/InlineEditable.svelte";

// Templates
export { default as GlassLayer } from "./components/templates/GlassLayer/GlassLayer.svelte";
export { default as WebsiteScaffold } from "./components/templates/WebsiteScaffold/WebsiteScaffold.svelte";
export { default as DemoSite } from "./components/templates/DemoSite/DemoSite.svelte";

// Pages (demo compositions)
export { default as DemoSiteOverlay } from "./components/pages/DemoSiteOverlay/DemoSiteOverlay.svelte";
export { default as FramedOverlay } from "./components/pages/FramedOverlay/FramedOverlay.svelte";
export { default as LayerProof } from "./components/pages/LayerProof/LayerProof.svelte";
export { default as ProfileInlineEdit } from "./components/pages/ProfileInlineEdit/ProfileInlineEdit.svelte";

// The refraction maths, in case you want to build your own surface on it.
export { buildLens, refractionMode } from "./components/atoms/GlassSurface/lens";
export type { Lens, LensProfile } from "./components/atoms/GlassSurface/lens";

// Demo data & types
export { DEMO_ITEMS, DEMO_ITEMS_SHORT, DEMO_DOCK } from "./data/items";
export type {
  LauncherItem,
  DockItem,
  IconName,
  GlassSize,
  LayerPlacement,
} from "./types";
