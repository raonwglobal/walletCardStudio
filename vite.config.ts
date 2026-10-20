import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    restoreMocks: true,
    // Edge Function tests use Deno and run in a separate CI step.
    exclude: ["supabase/**/*.test.ts", "**/node_modules/**", "**/dist/**"],
  },
});
