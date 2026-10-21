import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    restoreMocks: true,
    // Edge Function tests use Deno and run in a separate CI step.
    exclude: ["supabase/**/*.test.ts", "**/node_modules/**", "**/dist/**"],
  },
});
