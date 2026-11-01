import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', timeout: 60000, workers: 1,
  use: { baseURL: 'http://127.0.0.1:5184', browserName: 'chromium', acceptDownloads: true, launchOptions: { executablePath: process.env.CHROME_PATH || undefined } },
  webServer: { command: 'npm run build && npm run preview -- --port 5184 --strictPort', url: 'http://127.0.0.1:5184/content-studio/', reuseExistingServer: false }
});
