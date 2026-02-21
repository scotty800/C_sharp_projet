/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'your-api-domain.com'],
    formats: ['image/avif', 'image/webp'],
  },
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig