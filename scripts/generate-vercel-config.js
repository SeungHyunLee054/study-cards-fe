import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Vercel 환경변수는 이미 process.env에 주입되어 있음
// 로컬에서는 .env 파일을 vite가 자동으로 로드

const vercelConfig = {
  rewrites: [
    {
      source: '/api/:path*',
      destination: `${process.env.API_BACKEND_URL}/api/:path*`,
    },
    {
      source: '/oauth2/:path*',
      destination: `${process.env.API_BACKEND_URL}/oauth2/:path*`,
    },
  ],
}

const outputPath = path.join(__dirname, '../vercel.json')

fs.writeFileSync(outputPath, JSON.stringify(vercelConfig, null, 2))
console.log('✅ vercel.json generated successfully')
