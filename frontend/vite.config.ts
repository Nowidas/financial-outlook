import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '^/api/v2/*': {
        target: 'https://bankaccountdata.gocardless.com',
        changeOrigin: true,
        rewrite: (path) => {
          console.log(path);
          return path
        }
      }
    }
  }
})