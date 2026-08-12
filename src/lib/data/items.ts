import type { DockItem, LauncherItem } from "../types";

/**
 * Demo data for the stories. Nothing in the library depends on it — a
 * `GlassBar` renders whatever array you hand it.
 */
export const DEMO_ITEMS: LauncherItem[] = [
  { id: "profile", label: "Profile", icon: "user", href: "#profile" },
  { id: "calendar", label: "Calendar", icon: "calendar", href: "#calendar" },
  { id: "reports", label: "Reports", icon: "chart", href: "#reports" },
  { id: "contacts", label: "Contacts", icon: "network", href: "#contacts" },
  { id: "campaigns", label: "Campaigns", icon: "broadcast", href: "#campaigns" },
  { id: "projects", label: "Projects", icon: "briefcase", href: "#projects" },
  { id: "requests", label: "Requests", icon: "inbox", href: "#requests", count: 2 },
];

/** A shorter selection — five of seven, the common case. */
export const DEMO_ITEMS_SHORT: LauncherItem[] = DEMO_ITEMS.filter((item) =>
  ["profile", "calendar", "reports", "campaigns", "projects"].includes(item.id),
);

/**
 * A dock's worth of app tiles. The tints are what make it read as a dock
 * rather than as a row of icons: monoline glyphs alone have no weight, and
 * a dock is a row of *objects*.
 */
export const DEMO_DOCK: DockItem[] = [
  {
    id: "files",
    label: "Files",
    icon: "grid",
    href: "#files",
    tint: "linear-gradient(180deg, #6ec3f5, #1f7fd4)",
    running: true,
  },
  {
    id: "search",
    label: "Search",
    icon: "search",
    href: "#search",
    tint: "linear-gradient(180deg, #a78bfa, #6d43d8)",
  },
  {
    id: "mail",
    label: "Mail",
    icon: "mail",
    href: "#mail",
    tint: "linear-gradient(180deg, #4aa8ff, #1160cc)",
    running: true,
    count: 12,
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: "calendar",
    href: "#calendar",
    tint: "linear-gradient(180deg, #ff6b6b, #d61f3d)",
  },
  {
    id: "contacts",
    label: "Contacts",
    icon: "network",
    href: "#contacts",
    tint: "linear-gradient(180deg, #f7a94b, #d97108)",
  },
  {
    id: "music",
    label: "Music",
    icon: "play",
    href: "#music",
    tint: "linear-gradient(180deg, #fb7bb3, #d81f6a)",
    running: true,
  },
  {
    id: "photos",
    label: "Photos",
    icon: "star",
    href: "#photos",
    tint: "linear-gradient(180deg, #ffd166, #f08a1d)",
  },
  {
    id: "reports",
    label: "Reports",
    icon: "chart",
    href: "#reports",
    tint: "linear-gradient(180deg, #4fd1a5, #12866a)",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "settings",
    href: "#settings",
    tint: "linear-gradient(180deg, #9aa2ae, #5b636f)",
  },
  {
    id: "trash",
    label: "Trash",
    icon: "inbox",
    href: "#trash",
    tint: "linear-gradient(180deg, rgba(255,255,255,0.5), rgba(190,195,205,0.55))",
    separatorBefore: true,
  },
];
