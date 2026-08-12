import type { StorybookConfig } from "@storybook/svelte-vite";
import type { Plugin } from "vite";
import remarkGfm from "remark-gfm";

/**
 * GitHub Pages serves a project site from `/<repo>/`, not from the domain
 * root. The backdrops are referenced as absolute `/backdrops/*.svg` — as
 * `url()` in stylesheets, in inline `style` attributes, and as plain strings
 * in `.ts` — so under a sub-path they would 404 and every story would show
 * glass over nothing.
 *
 * Vite already rebases `url()` in CSS against `base`. It cannot see the
 * string literals, which is what this covers — and it must stay out of CSS
 * entirely, or those paths get the prefix twice.
 *
 * No-op locally, where the base is `/`.
 */
function publicAssetBase(base: string): Plugin {
  const PUBLIC_ROOTS = ["/backdrops/", "/logo.svg"];
  const STYLE_BLOCK = /<style[\s\S]*?<\/style>/gi;
  const prefix = base.replace(/\/$/, "");

  const rewrite = (source: string) => {
    let out = source;
    for (const root of PUBLIC_ROOTS) out = out.split(root).join(prefix + root);
    return out;
  };

  /** Rewrites everything except `<style>` blocks, which Vite handles. */
  const rewriteMarkup = (source: string) => {
    let out = "";
    let cursor = 0;
    for (const match of source.matchAll(STYLE_BLOCK)) {
      out += rewrite(source.slice(cursor, match.index)) + match[0];
      cursor = match.index + match[0].length;
    }
    return out + rewrite(source.slice(cursor));
  };

  return {
    name: "glassine:public-asset-base",
    enforce: "pre",
    apply: "build",
    transform(code, id) {
      if (!prefix || id.includes("node_modules")) return null;
      const file = id.split("?")[0];
      if (!/\.(svelte|ts|js)$/.test(file)) return null;

      const out = file.endsWith(".svelte") ? rewriteMarkup(code) : rewrite(code);
      return out === code ? null : { code: out, map: null };
    },
  };
}

// Set by the Pages workflow to `/<repo>/`; `/` everywhere else.
const BASE = process.env.STORYBOOK_BASE_PATH ?? "/";

const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|ts|svelte)",
  ],
  addons: [
    "@storybook/addon-svelte-csf",
    // MDX 3 has no tables of its own — the docs pages need GFM for those.
    {
      name: "@storybook/addon-docs",
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
    "@storybook/addon-a11y",
  ],
  framework: {
    name: "@storybook/svelte-vite",
    options: {},
  },
  // The backdrops. Glass without something underneath it is just milk, so the
  // stories cannot work without these being served.
  staticDirs: ["../public"],
  viteFinal(cfg) {
    cfg.base = BASE;
    cfg.plugins = [...(cfg.plugins ?? []), publicAssetBase(BASE)];
    return cfg;
  },
};

export default config;
