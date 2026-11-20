import { defineConfig } from "vitest/config";

export default defineConfig({
  // TSX under src renders with maniatsx, not React
  oxc: { jsx: { runtime: "automatic", importSource: "maniatsx" } },
  test: {
    include: ["src/**/*.test.ts", "test/**/*.test.ts"],
    exclude: ["test/integration/**"],
    restoreMocks: true,
  },
});
