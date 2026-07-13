/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone',
  reactStrictMode: true,
  transpilePackages: ["@podium/ui"],
  experimental: {
    optimizePackageImports: ["framer-motion", "@react-three/drei", "@react-three/fiber"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.medusajs.app" },
      { protocol: "https", hostname: "**.your-objectstorage.com" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
}

export default nextConfig
