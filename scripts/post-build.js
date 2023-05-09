import { promises as fs } from "fs";
import { dirname, resolve } from "path";
import {readFile} from "fs/promises";
import {replaceBetween} from "./replace-between.js";

// await import("./correct-import-extensions.js");
// await import("./workerd-tests.js");

const { pack } = await import("@virtualstate/impack");

await pack({
  argv: ["--silent"],
  paths: {
    directory: "esnext"
  }
});

// await fs.rmdir("esnext-workerd").catch(() => {});
// await fs.cp("esnext", "esnext-workerd", {
//   recursive: true
// })
// //
// const capnp = await pack({
//   argv: ["--silent"],
//   paths: {
//     directory: "esnext-workerd",
//     importMap: "import-map-workerd.json",
//     capnpTemplate: "workerd-tests.template.capnp",
//     entrypoint: "esnext-workerd/tests/workerd/server-export.js"
//   }
// });
//
// if (capnp) {
//   await fs.writeFile("workerd-tests.capnp", capnp, "utf-8");
// }

{

  // const bundle = await rollup({
  //   input: "./esnext/tests/index.js",
  //   plugins: [
  //     ignore([
  //       "playwright",
  //       "fs",
  //       "path",
  //       "uuid",
  //       "cheerio",
  //       "@virtualstate/app-history",
  //       "@virtualstate/app-history-imported",
  //       `${cwd}/esnext/tests/app-history.playwright.js`,
  //       `${cwd}/esnext/tests/app-history.playwright.wpt.js`,
  //       `${cwd}/esnext/tests/dependencies-input.js`,
  //       `${cwd}/esnext/tests/dependencies.js`,
  //       "./app-history.playwright.js",
  //       "./app-history.playwright.wpt.js",
  //     ]),
  //     nodeResolve(),
  //   ],
  //   inlineDynamicImports: true,
  //   treeshake: {
  //     preset: "smallest",
  //     moduleSideEffects: "no-external",
  //   },
  // });
  // await bundle.write({
  //   sourcemap: true,
  //   output: {
  //     file: "./esnext/tests/rollup.js",
  //   },
  //   inlineDynamicImports: true,
  //   format: "cjs",
  //   interop: "auto",
  //   globals: {
  //     "esnext/tests/app-history.playwright.js": "globalThis",
  //   },
  // });
}

if (!process.env.NO_COVERAGE_BADGE_UPDATE) {
  const badges = [];

  const { name } = await fs.readFile("package.json", "utf-8").then(JSON.parse);

  badges.push(
    "### Support\n\n",
    "![Node.js supported](https://img.shields.io/badge/node-%3E%3D18.7.0-blue)",
      // "![Deno supported](https://img.shields.io/badge/deno-%3E%3D1.17.0-blue)",
      // "![Bun supported](https://img.shields.io/badge/bun-%3E%3D0.1.11-blue)"
    // "![Chromium supported](https://img.shields.io/badge/chromium-%3E%3D98.0.4695.0-blue)",
    // "![Webkit supported](https://img.shields.io/badge/webkit-%3E%3D15.4-blue)",
    // "![Firefox supported](https://img.shields.io/badge/firefox-%3E%3D94.0.1-blue)"
  );

  badges.push(
    "\n\n### Test Coverage\n\n"
    // `![nycrc config on GitHub](https://img.shields.io/nycrc/${name.replace(/^@/, "")})`
  );

  // const wptResults = await fs
  //   .readFile("coverage/wpt.results.json", "utf8")
  //   .then(JSON.parse)
  //   .catch(() => ({}));
  // if (wptResults?.total) {
  //   const message = `${wptResults.pass}/${wptResults.total}`;
  //   const name = "Web Platform Tests";
  //   badges.push(
  //     `![${name} ${message}](https://img.shields.io/badge/${encodeURIComponent(
  //       name
  //     )}-${encodeURIComponent(message)}-brightgreen)`
  //   );
  // }

  const coverage = await fs
    .readFile("coverage/coverage-summary.json", "utf8")
    .then(JSON.parse)
    .catch(() => ({}));
  const coverageConfig = await fs.readFile(".nycrc", "utf8").then(JSON.parse);
  for (const [name, { pct }] of Object.entries(coverage?.total ?? {})) {
    const good = coverageConfig[name];
    if (!good) continue; // not configured
    const color = pct >= good ? "brightgreen" : "yellow";
    const message = `${pct}%25`;
    badges.push(
      `![${message} ${name} covered](https://img.shields.io/badge/${name}-${message}-${color})`
    );
  }

  await replaceBetween(
      "README.md",
      "badges",
      badges.join(
          " "
      )
  )
  console.log("Wrote coverage badges!");
}


