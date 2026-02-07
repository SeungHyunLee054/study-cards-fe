import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 로컬 환경에서는 dotenv로 .env 파일 로드
// Vercel에서는 환경변수가 이미 주입되어 있어 dotenv 불필요
try {
  const dotenv = await import('dotenv')
  dotenv.config({ path: path.join(__dirname, '../.env') })
} catch (error) {
  // Vercel에서는 dotenv가 없을 수 있음 (정상)
}

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
