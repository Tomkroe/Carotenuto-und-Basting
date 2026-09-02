/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@maklerprogram/types"],
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
