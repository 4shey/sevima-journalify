import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    laravel({
      input: "resources/js/app.tsx",
      ssr: "resources/js/ssr.tsx",
      refresh: true,
    }),
    react(),
    tailwindcss(),
  ],

  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    origin: "http://localhost:5173",
    cors: {
      origin: ["http://localhost:8080"],
    },
    hmr: {
      host: "localhost",
      port: 5173,
    },
  },
});
