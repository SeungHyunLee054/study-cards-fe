import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// .env 파일 로드
dotenv.config({ path: path.join(__dirname, '../.env') })

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
