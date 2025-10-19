import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',
    'process.env': {}
  },
  build: {
    target: "es2022"
  },
  server: {
    port: 5173,
    open: true
  },
  preview: {
    port: 4173
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"]
    }
  }
});
