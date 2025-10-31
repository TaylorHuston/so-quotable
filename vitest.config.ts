import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Use Node environment for Convex tests, happy-dom for React tests
    // @ts-expect-error - environmentMatchGlobs is supported in Vitest 4.0+
    environmentMatchGlobs: [
      ["convex/**/*.test.ts", "node"],
      ["src/**/*.test.{ts,tsx}", "happy-dom"],
      ["tests/**/*.test.{ts,tsx}", "happy-dom"],
    ],
    globals: true,
    setupFiles: ["./tests/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
    },
  },
});
