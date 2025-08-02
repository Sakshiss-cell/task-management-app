/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable the Next.js development indicator
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  // You can also disable it completely
  experimental: {
    // This removes all dev indicators
    devIndicators: false,
  }
}

export default nextConfig
