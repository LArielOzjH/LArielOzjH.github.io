import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const isPagesBuild = process.env.GITHUB_PAGES === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isPagesBuild ? "/blog" : "",
  assetPrefix: isPagesBuild ? "/blog/" : "",
  images: {
    unoptimized: true
  },
  turbopack: {
    root: __dirname
  },
  pageExtensions: ["ts", "tsx", "md", "mdx"]
};

export default nextConfig;
