/** Every glyph the bundled `Icon` component can draw. */
export type IconName =
  | "user"
  | "calendar"
  | "chart"
  | "network"
  | "broadcast"
  | "briefcase"
  | "inbox"
  | "mail"
  | "power"
  | "pen"
  | "grid"
  | "search"
  | "settings"
  | "bell"
  | "star"
  | "heart"
  | "play"
  | "plus";

/** One entry in a `GlassBar` — an icon that links somewhere. */
export interface LauncherItem {
  id: string;
  /** Plain text for the tooltip and for screen readers. */
  label: string;
  icon: IconName;
  href: string;
  /** Optional counter drawn as a badge on the control. */
  count?: number;
}

/** One app tile in a `Dock`. */
export interface DockItem {
  id: string;
  /** Plain text for the label bubble and for screen readers. */
  label: string;
  icon: IconName;
  href?: string;
  /** Background of the tile. Any CSS background value — the icon is white. */
  tint?: string;
  /** Draws the running-app dot underneath. */
  running?: boolean;
  /** Badge on the tile, as macOS does for unread counts. */
  count?: number;
  /** Insert a separator before this item, as macOS does before the trash. */
  separatorBefore?: boolean;
}

/** Control sizes shared across the glass controls. */
export type GlassSize = "sm" | "md" | "lg";

/** Where a `GlassLayer` parks its content. */
export type LayerPlacement =
  | "top-right"
  | "top-left"
  | "top-center"
  | "bottom-right"
  | "bottom-center";
