import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": resolve(__dirname, "./src") },
  },
  base: "./",
  build: {
    outDir: "dist",
    assetsInlineLimit: 10240,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return;
          if (id.includes("lucide-react") || id.includes("framer-motion") || id.includes("recharts") || id.includes("html5-qrcode")) {
            return "vendor-ui";
          }
          return "vendor";
        },
      },
    },
  },
});
