/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export — deploys as plain files (Cloudflare Pages/Workers). No server runtime.
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
