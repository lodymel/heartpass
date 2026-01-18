import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  transpilePackages: ['date-fns'],
};

export default nextConfig;
