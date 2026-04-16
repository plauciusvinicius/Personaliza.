/** @type {import('next').NextConfig} */
const nextConfig = {
  // Workaround para bug no Next.js 16.2.3 com generateBuildId
  generateBuildId: async () => null,
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "drive.google.com" },
    ],
  },
};

module.exports = nextConfig;
