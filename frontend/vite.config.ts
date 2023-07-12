import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import eslint from 'vite-plugin-eslint';

const resolve = {
  alias: {
    "@": fileURLToPath(new URL("./src", import.meta.url)),
    "@modules": fileURLToPath(new URL("./src/modules", import.meta.url)),
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    devSourcemap: true,
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    watch: {
      usePolling: true,
    }
  },
  plugins: [react(), eslint()],
  resolve,
});
