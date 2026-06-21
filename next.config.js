/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    unoptimized: true,
  },
  eslint: {
    // Не валить сборку из-за предупреждений линтера
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Не валить сборку из-за ошибок типов
    ignoreBuildErrors: true,
  },
}
module.exports = nextConfig
