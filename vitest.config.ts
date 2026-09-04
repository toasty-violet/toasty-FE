import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    exclude: ["node_modules", ".next", "e2e"],
  },
  resolve: {
    alias: [
      // svg는 @svgr/webpack 대신 스텁 컴포넌트로 해석한다. (test/svg-stub.tsx 참고)
      {
        find: /^.*\.svg$/,
        replacement: path.resolve(__dirname, "./test/svg-stub.tsx"),
      },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },
});
