import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://127.0.0.1:8003',
    serviceWorkers: 'allow'
  },
  webServer: {
    command: 'python3 -m http.server 8003 --directory docs',
    url: 'http://127.0.0.1:8003',
    reuseExistingServer: true
  }
});
