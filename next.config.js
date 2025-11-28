// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // MUIS
      {
        protocol: "http",
        hostname: "opendata.muis.ee",
        pathname: "/dhmedia/**",
      },
      {
        protocol: "https",
        hostname: "opendata.muis.ee",
        pathname: "/dhmedia/**",
      },
      // WikiMedia Commons
      {
        protocol: "https",
        hostname: "commons.wikimedia.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
