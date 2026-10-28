import { build } from "esbuild";

await build({
  entryPoints: ["src/*.ts"],
  bundle: true,
  platform: "node",
  target: "node24",
  format: "cjs",
  outdir: "container-dist",
});
