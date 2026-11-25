import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir:'./tests/browser',
  fullyParallel:true,
  reporter:[['list'],['html',{open:'never'}]],
  use:{baseURL:'http://127.0.0.1:4321',...(process.env.LOCAL_CHROME ? {channel:'chrome'} : {}),trace:'retain-on-failure'},
  webServer:{command:'pnpm preview --port 4321',url:'http://127.0.0.1:4321',reuseExistingServer:!process.env.CI,timeout:30000},
  projects:[{name:'desktop',use:{...devices['Desktop Chrome']}},{name:'mobile',use:{...devices['Pixel 7']}}],
});
