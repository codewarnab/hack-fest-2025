import type { NextConfig } from "next";

const nextConfig: NextConfig = {
/* config options here */
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'data.10thcollection.com'
    },
    {
      protocol: 'https',
      hostname: 'picsum.photos'
    },
  ],
},

};

export default nextConfig;
