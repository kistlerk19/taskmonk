/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Disable static optimization for pages that use AWS Amplify
  experimental: {
    // This allows client-side only packages to work
    esmExternals: 'loose'
  },
  // Disable server-side rendering for problematic pages
  images: {
    unoptimized: true
  },
  // Prevent SSR for AWS Amplify
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false
    };
    return config;
  }
}

module.exports = nextConfig