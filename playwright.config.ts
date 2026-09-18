import { defineConfig, devices } from '@playwright/test'
export default defineConfig({testDir:'./e2e',webServer:{command:'pnpm dev --host 127.0.0.1',url:'http://127.0.0.1:5173',reuseExistingServer:false},use:{baseURL:'http://127.0.0.1:5173'},projects:[{name:'mobile',use:{...devices['Desktop Chrome'],viewport:{width:390,height:844}}}]})
