// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => ({
  base: "/shop/",

  plugins: [react()],

  server: {
    port: 5173,
    open: true,
    proxy: {
      "/api": {
        target: "https://ilan-israel.co.il",
        changeOrigin: true,
        secure: false,
      },
      // '/socket.io': { target: 'wss://ilan-israel.co.il', ws: true, changeOrigin: true },
    },
  },

  resolve: {
    alias: {
      "@": "/src",
    },
  },

  build: {
    outDir: "dist",
  },
}));
