/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@maklerprogram/types"],
  // Build-Fehler ignorieren, falls beim Deployment Linting-Probleme auftreten
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    // Nutzt die Umgebungsvariable API_URL, falls vorhanden, sonst localhost
    const backendUrl = process.env.API_URL || "http://localhost:3001";

    return [
      {
        source: "/api-backend/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
