import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    // Desktop browsers with touch support for testing
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        hasTouch: true,
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        hasTouch: true,
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        hasTouch: true,
      },
    },
    
    // Mobile devices with touch support
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
        hasTouch: true,
      },
    },
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 12'],
        hasTouch: true,
      },
    },
    {
      name: 'tablet-chrome',
      use: { 
        ...devices['iPad Pro'],
        hasTouch: true,
      },
    },
    
    // Additional mobile devices for comprehensive testing
    {
      name: 'iphone-se',
      use: { 
        ...devices['iPhone SE'],
        hasTouch: true,
      },
    },
    {
      name: 'galaxy-s8',
      use: { 
        ...devices['Galaxy S8'],
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
