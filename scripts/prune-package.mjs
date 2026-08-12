/**
 * `svelte-package` copies everything under `src/lib`, stories included. The
 * published surface is the components and the tokens — nothing that only
 * exists to demonstrate them.
 *
 * Removing the stories also removes the only reason the package would ask a
 * consumer for `/backdrops/*`: those files live in `public/` and are served
 * by Storybook, not shipped.
 */
import { readdir, rm, stat } from "node:fs/promises";
import { join } from "node:path";

const DIST = new URL("../dist/", import.meta.url).pathname;

/** Whole directories that never belong in the package. */
const DROP_DIRS = new Set(["stories"]);
/** Any file matching one of these is demo-only, wherever it sits. */
const DROP_FILE = /\.stories\.(svelte|js|ts)(\.d\.ts)?$/;

let removed = 0;

async function walk(dir) {
  for (const entry of await readdir(dir)) {
    const path = join(dir, entry);

    if (DROP_DIRS.has(entry) && (await stat(path)).isDirectory()) {
      await rm(path, { recursive: true, force: true });
      removed++;
      continue;
    }

    if ((await stat(path)).isDirectory()) {
      await walk(path);
    } else if (DROP_FILE.test(entry)) {
      await rm(path);
      removed++;
    }
  }
}

await walk(DIST);
console.log(`prune-package: removed ${removed} demo-only entries from dist/`);
