import type { Preview } from "@storybook/svelte-vite";
import "../src/lib/tokens/global.css";
import "./storybook.css";
import {
  BACKDROPS,
  BACKDROP_NAMES,
  DEFAULT_BACKDROP,
  backdropVars,
} from "../src/lib/stories/backdrops";

/**
 * The backdrop toolbar is driven from one catalogue
 * (`src/lib/stories/backdrops.ts`), so the toolbar, the story controls and
 * the echo-mode copy can never drift apart. The decorator only writes
 * custom properties; the visual side lives in storybook.css.
 */
const preview: Preview = {
  parameters: {
    layout: "centered",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // Surface violations without failing the build.
      test: "todo",
    },
    docs: {
      toc: true,
    },
    options: {
      storySort: {
        order: [
          "Introduction",
          "Usage",
          "Backdrops",
          "Atoms",
          "Molecules",
          "Organisms",
          "Templates",
          "Pages",
          "Spikes",
        ],
      },
    },
  },

  globalTypes: {
    backdrop: {
      description: "Backdrop underneath the glass layer",
      toolbar: {
        title: "Backdrop",
        icon: "photo",
        items: BACKDROP_NAMES.map((name) => ({
          value: name,
          title: BACKDROPS[name].title,
          right: BACKDROPS[name].group,
        })),
        dynamicTitle: true,
      },
    },
  },

  /* `globalTypes.defaultValue` has been inert since Storybook 8 — the
     default belongs here. Without this the toolbar starts empty and the
     first story renders over nothing at all. */
  initialGlobals: {
    backdrop: DEFAULT_BACKDROP,
  },

  decorators: [
    (story, context) => {
      const requested = context.globals.backdrop as string | undefined;
      const name =
        requested && requested in BACKDROPS
          ? (requested as typeof DEFAULT_BACKDROP)
          : DEFAULT_BACKDROP;

      /* Full-page stories bring their own — and scrolling — backdrop with
         them. A fixed copy cannot match that, so the echo is withdrawn and
         `GlassSurface` falls back to frosted glass where only the echo
         would have worked. Withdrawing has to happen here rather than in
         CSS: these properties are written inline, and no selector beats
         an inline declaration. */
      const ownsBackdrop =
        context.parameters?.layout === "fullscreen" ||
        context.parameters?.ownBackdrop === true;

      const style = document.body.style;
      if (ownsBackdrop) {
        for (const key of Object.keys(backdropVars(name))) {
          style.removeProperty(key);
        }
      } else {
        for (const [key, value] of Object.entries(backdropVars(name))) {
          style.setProperty(key, value);
        }
      }

      document.body.dataset.backdrop = name;
      document.body.dataset.pageStory = String(ownsBackdrop);

      return story();
    },
  ],
};

export default preview;
