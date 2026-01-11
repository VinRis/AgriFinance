import type {NextConfig} from 'next';

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    // Cache pages with a Stale-While-Revalidate strategy
    {
      urlPattern: ({ request, url }) => {
        if (request.destination === 'document') {
          return true;
        }
        return false;
      },
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'pages',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        },
      },
    },
    // Cache static assets (js, css, etc.) with a Stale-While-Revalidate strategy
     {
      urlPattern: ({ request }) =>
        request.destination === 'script' ||
        request.destination === 'style' ||
        request.destination === 'worker',
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        },
      },
    },
    // Cache images with a Cache First strategy
    {
      urlPattern: ({ request }) => request.destination === 'image',
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        },
      },
    },
     // Cache fonts
    {
      urlPattern: ({ request }) => request.destination === 'font',
      handler: 'CacheFirst',
      options: {
        cacheName: 'fonts',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        },
      },
    },
  ],
  fallbacks: {
    document: '/offline',
  },
});

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
   async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: true,
      },
    ]
  },
};

export default withPWA(nextConfig);
