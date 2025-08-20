import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { copyFileSync, mkdirSync, existsSync } from "fs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svelte(),
    {
      name: "copy-types",
      closeBundle() {
        // Ensure types directory exists
        const typesDir = resolve(__dirname, "dist/types");
        if (!existsSync(typesDir)) {
          mkdirSync(typesDir, { recursive: true });
        }

        // Copy the main types file
        const sourceTypesFile = resolve(
          __dirname,
          "src/types/vormiaqueryjs.d.ts"
        );
        const targetTypesFile = resolve(
          __dirname,
          "dist/types/vormiaqueryjs.d.ts"
        );

        if (existsSync(sourceTypesFile)) {
          copyFileSync(sourceTypesFile, targetTypesFile);
          console.log("✅ Types file copied to dist/types/vormiaqueryjs.d.ts");
        }
      },
    },
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.js"),
        core: resolve(__dirname, "src/core/index.js"),
        "adapters/react/useVormiaQuery": resolve(
          __dirname,
          "src/adapters/react/useVormiaQuery.js"
        ),
        "adapters/react/VormiaProvider": resolve(
          __dirname,
          "src/providers/VormiaProvider.jsx"
        ),
        "adapters/svelte": resolve(
          __dirname,
          "src/adapters/svelte/vormiaStore.js"
        ),
        "adapters/solid": resolve(
          __dirname,
          "src/adapters/solid/createVormiaResource.js"
        ),
        "adapters/vue": resolve(__dirname, "src/adapters/vue/useVormia.js"),
        "adapters/qwik": resolve(__dirname, "src/adapters/qwik/useVormia.js"),
      },
      formats: ["es"],
      fileName: (format, entryName) => {
        const dir = format === "es" ? "esm" : "cjs";
        return `${dir}/${entryName}.${format === "es" ? "mjs" : "js"}`;
      },
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "@tanstack/react-query",
        "svelte",
        "svelte/store",
        "solid-js",
        "solid-js/store",
        "axios",
        "vue",
        "@builder.io/qwik",
        "@builder.io/qwik/jsx-runtime",
      ],
      output: {
        preserveModules: true,
        exports: "named",
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "@tanstack/react-query": "ReactQuery",
          svelte: "svelte",
          "svelte/store": "svelteStore",
          "solid-js": "solidJs",
          "solid-js/store": "solidJsStore",
          axios: "axios",
          vue: "Vue",
          "@builder.io/qwik": "qwik",
          "@builder.io/qwik/jsx-runtime": "qwikJsxRuntime",
        },
      },
      onwarn(warning, warn) {
        // Suppress circular dependency warnings
        if (warning.code === "CIRCULAR_DEPENDENCY") return;
        warn(warning);
      },
    },
    minify: "terser",
    sourcemap: true,
    emptyOutDir: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./test/setup.js",
    coverage: {
      reporter: ["text", "json", "html"],
    },
  },
});
