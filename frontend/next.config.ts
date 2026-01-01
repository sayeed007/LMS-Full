/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  webpack: (config: { module: { rules: { test: RegExp; use: string[]; }[]; }; }) => {
    config.module.rules.push({
      test: /\.svg$/i,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;