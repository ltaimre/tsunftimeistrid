/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export', // Määrab Next.js ekspordi staatiliseks
    trailingSlash: true, // Lisab URL-idele kaldkriipsu (vajalik mõnes keskkonnas)
    images: {
      unoptimized: true, // Kui kasutad Next.js pilte, vältida optimeerimise vigu
    },
  };
  
  module.exports = nextConfig;
  