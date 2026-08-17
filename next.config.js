/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false,
  },
  // pdfkit reads its core font metrics (data/*.afm) from a path relative to
  // its own module location at runtime; webpack-bundling it breaks that path
  // resolution (looks for the data files under .next/server/vendor-chunks/
  // instead of node_modules/pdfkit). Keep it external so Node requires it
  // normally.
  experimental: {
    serverComponentsExternalPackages: ["pdfkit"],
  },
};

module.exports = nextConfig;
