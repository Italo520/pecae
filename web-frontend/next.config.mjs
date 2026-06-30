/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'hsxeulvcfrbyvxehhhaj.supabase.co' },
      { hostname: 'images.pexels.com' },
    ],
  },
  output: 'standalone',
};

export default nextConfig;
