import type { NextConfig } from "next";

const pages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  ...(pages && {
    output: "export",
    basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
    trailingSlash: true,
    images: { unoptimized: true },
  }),
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: !pages,
  partialPrefetching: !pages,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
