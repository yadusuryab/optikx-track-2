import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Option 1: Using domains (simpler)
    domains: ["res.cloudinary.com"],
    
    // Option 2: Using remotePatterns (more flexible - recommended)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        // You can also specify pathname and port if needed
      },
      {
        protocol: 'https',
        hostname: '**', // Allow all domains (use cautiously)
      }
    ],
    
    // Optional: Add other image optimizations
    formats: ['image/webp', 'image/avif'],
  },
  // Other Next.js config options...
};

export default nextConfig;