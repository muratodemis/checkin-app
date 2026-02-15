import type { NextConfig } from "next";

const basePath = "/5mins";

const nextConfig: NextConfig = {
  output: "standalone",
  basePath,
};

export default nextConfig;
