import { execSync } from 'node:child_process'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const gitBuildId=()=>{try{return execSync('git rev-parse --short HEAD',{encoding:'utf8'}).trim()}catch{return 'dev'}}
const buildId=(process.env.GITHUB_SHA ?? gitBuildId()).slice(0,7)

export default defineConfig({define:{__APP_BUILD_ID__:JSON.stringify(buildId)},plugins:[react()],test:{exclude:['e2e/**','node_modules/**']}})
