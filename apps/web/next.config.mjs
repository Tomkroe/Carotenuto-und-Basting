/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@maklerprogram/types"],
  async rewrites() {
    return [
      {
        source: "/api-backend/:path*",
        destination: `${process.env.API_ORIGIN ?? "http://localhost:3001"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
