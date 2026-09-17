
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Корень воркспейса задан явно, иначе Turbopack цепляет посторонний
  // package-lock.json из родительской папки
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    unoptimized: true,
  },
  typescript: {
    // Не валить сборку из-за ошибок типов
    ignoreBuildErrors: true,
  },
}
module.exports = nextConfig
