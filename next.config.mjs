/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for GitHub Pages (output goes to ./out)
  output: "export",
  trailingSlash: true,
  turbopack: { root: import.meta.dirname },
  images: { unoptimized: true },
  // Allow opening the dev server from other devices on the local network.
  allowedDevOrigins: ["192.168.178.172"],
};

export default nextConfig;
