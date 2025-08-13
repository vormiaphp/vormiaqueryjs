import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svelte()],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.js"),
        core: resolve(__dirname, "src/core/index.js"),
        "adapters/react": resolve(
          __dirname,
          "src/adapters/react/useVormiaQuery.js"
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
      formats: ["es", "cjs"],
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
        "crypto-js",
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
          "crypto-js": "CryptoJS",
          vue: "Vue",
          "@builder.io/qwik": "qwik",
          "@builder.io/qwik/jsx-runtime": "qwikJsxRuntime",
        },
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
