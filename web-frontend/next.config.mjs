/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'hsxeulvcfrbyvxehhhaj.supabase.co' },
      { hostname: 'images.pexels.com' },
      { hostname: 'images.unsplash.com' },
    ],
  },
  output: 'standalone',
};

export default nextConfig;
