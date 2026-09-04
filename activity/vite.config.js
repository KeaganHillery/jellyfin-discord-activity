import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    allowedHosts: [
      "chapter-duties-perfectly-laundry.trycloudflare.com"
    ],
    proxy: {
      "/api": {
        target: "http://server:3000",
        changeOrigin: true
      }
    }
  }
});
