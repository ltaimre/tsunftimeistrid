/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export', // Seadistab Next.js-i staatiliseks eksportimiseks
    trailingSlash: true, // Lisab URL-idele lõppu kaldkriipsu (mõnel hostil vajalik)
    images: {
      unoptimized: true, // Kui kasutad Next.js pildikomponenti, aitab see vältida optimeerimisvigu
    },
  };
  
  module.exports = nextConfig;
  