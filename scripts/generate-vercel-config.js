import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Vercel 환경변수는 이미 process.env에 주입되어 있음
// 로컬에서는 .env 파일을 vite가 자동으로 로드

const apiBackendUrl = process.env.API_BACKEND_URL

if (!apiBackendUrl) {
  console.warn('⚠️  API_BACKEND_URL 환경변수가 설정되지 않았습니다.')
  console.warn('   vercel.json의 rewrites가 제대로 작동하지 않을 수 있습니다.')
} else {
  console.log('✓ API_BACKEND_URL 환경변수 감지됨')
}

const vercelConfig = {
  rewrites: [
    {
      source: '/api/:path*',
      destination: `${apiBackendUrl}/api/:path*`,
    },
    {
      source: '/oauth2/:path*',
      destination: `${apiBackendUrl}/oauth2/:path*`,
    },
  ],
}

const outputPath = path.join(__dirname, '../vercel.json')

fs.writeFileSync(outputPath, JSON.stringify(vercelConfig, null, 2))
console.log('✅ vercel.json generated successfully')
