import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    libInjectCss(),
    dts({
      insertTypesEntry: true,
      exclude: ['**/__tests__/**', '**/*.test.ts', '**/*.spec.ts'],
      outDir: 'dist/types',
      copyDtsFiles: true,
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        core: resolve(__dirname, 'src/core/index.ts'),
        'adapters/react': resolve(__dirname, 'src/adapters/react/index.ts'),
        'adapters/svelte': resolve(__dirname, 'src/adapters/svelte/index.ts'),
        'adapters/solid': resolve(__dirname, 'src/adapters/solid/index.ts'),
        'adapters/vue': resolve(__dirname, 'src/adapters/vue/index.ts'),
        'adapters/qwik': resolve(__dirname, 'src/adapters/qwik/index.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        const dir = format === 'es' ? 'esm' : 'cjs';
        return `${dir}/${entryName}.${format === 'es' ? 'mjs' : 'js'}`;
      },
    },
    rollupOptions: {
      external: [
        'react', 
        'react-dom', 
        '@tanstack/react-query',
        'svelte',
        'svelte/store',
        'solid-js',
        'solid-js/store',
        'axios'
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@tanstack/react-query': 'ReactQuery',
          'svelte': 'Svelte',
          'svelte/store': 'SvelteStore',
          'solid-js': 'SolidJS',
          'solid-js/store': 'SolidStore',
          'axios': 'axios',
        },
      },
    },
    emptyOutDir: true,
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
});
