import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['frontend/src/**/*.{ts,tsx}'],
      exclude: ['**/*.spec.{ts,tsx}'],
    },
  },
});