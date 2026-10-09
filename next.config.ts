import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  images: {
    loader: "custom",
    loaderFile: "./src/components/sites/reigningchamp/image-loader.ts",
  },
  outputFileTracingIncludes: {
    "/**": ["./src/components/sites/reigningchamp/catalog/*.json"],
  },
};

export default nextConfig;
