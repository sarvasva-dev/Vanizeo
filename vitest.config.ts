import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [
      '**/node_modules/**',
      '**/tests/e2e/**', // Isolated from Playwright
    ],
    environment: 'jsdom',
  },
});
