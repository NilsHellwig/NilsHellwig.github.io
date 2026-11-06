/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for GitHub Pages (output goes to ./out)
  output: "export",
  trailingSlash: true,
  turbopack: { root: import.meta.dirname },
  images: { unoptimized: true },
};

export default nextConfig;
