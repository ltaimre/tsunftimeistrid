// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // lubame nii http kui https; sinu URL oli http://...
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
      // (valikuline) kui mõni pilt tuleb ka muis.ee alt
      // { protocol: 'https', hostname: 'muis.ee', pathname: '/**' },
      // { protocol: 'http',  hostname: 'muis.ee', pathname: '/**' },
    ],
  },
};

module.exports = nextConfig;
