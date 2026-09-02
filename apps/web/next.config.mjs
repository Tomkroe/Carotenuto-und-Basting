/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@maklerprogram/types"],
  async rewrites() {
    return [
      {
        source: "/api-backend/:path*",
        destination: "http://localhost:3001/:path*",
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Verhindert das harte Fehlerschlagen bei statischen Generation-Errors
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

export default nextConfig;
