import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3000,
    open: true,
    proxy: {
      "/api/llm": {
        target: "https://apifreellm.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/llm/, "/v1"),
      },
    },
  },
  build: {
    outDir: "dist",
  },
});
