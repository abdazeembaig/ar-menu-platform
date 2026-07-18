import type { NextConfig } from "next";

const isPagesBuild = process.env.GITHUB_PAGES === "true";
const previewBuildSha = process.env.NEXT_PUBLIC_PREVIEW_BUILD_SHA ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isPagesBuild ? "/ar-menu-platform" : undefined,
  assetPrefix: isPagesBuild ? "/ar-menu-platform/" : undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: isPagesBuild ? "/ar-menu-platform" : "",
    NEXT_PUBLIC_PREVIEW_BUILD_SHA: previewBuildSha,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
