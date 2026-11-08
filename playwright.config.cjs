const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://127.0.0.1:8795', channel: process.env.PLAYWRIGHT_CHANNEL || undefined },
  webServer: { command: 'node scripts/serve.cjs', url: 'http://127.0.0.1:8795', reuseExistingServer: false },
});
