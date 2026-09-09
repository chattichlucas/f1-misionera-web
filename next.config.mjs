/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build compacto para Docker (genera .next/standalone/server.js).
  output: "standalone",
  eslint: {
    // ESLint no está instalado; Vercel no debe frenar el build por lint.
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    // subida de imágenes vía server action
    serverActions: { bodySizeLimit: "6mb" },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "media.base44.com" },
    ],
  },
};

export default nextConfig;
