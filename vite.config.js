import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Dev proxy: forward /api to the local Express backend so the browser makes
  // same-origin requests (no CORS). Set VITE_API_URL="" to route through this;
  // leave it set to the absolute URL to hit the backend directly instead.
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
