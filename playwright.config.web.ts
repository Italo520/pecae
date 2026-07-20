import { defineConfig, devices } from '@playwright/test';

/**
 * PECAÊ - Configuração do Playwright para Testes E2E do Novo Frontend Web (Next.js)
 */
export default defineConfig({
  testDir: './web-e2e',
  timeout: 60000,
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
});
