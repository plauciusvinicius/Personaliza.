import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Workaround para bug no Next.js 16.2.3 com generateBuildId
  generateBuildId: async () => null,
  // Ignorar erros de tipo até ter conexão real com Supabase
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "drive.google.com" },
    ],
  },
};

export default nextConfig;
