import { defineConfig, devices } from '@playwright/test';

/**
 * PECAÊ - Configuração do Playwright para Testes E2E do Novo Frontend Web (Next.js)
 */
export default defineConfig({
  testDir: './web-e2e',
  timeout: 90000,
  fullyParallel: false,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
  use: {
    baseURL: 'https://pecae.italohub.cloud',
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
