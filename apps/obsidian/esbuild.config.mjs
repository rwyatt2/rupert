import esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/main.ts"],
  bundle: true,
  outfile: "main.js",
  format: "cjs",
  target: "es2022",
  platform: "node",
  external: ["obsidian", "electron"],
  sourcemap: "inline",
  logLevel: "info",
});
