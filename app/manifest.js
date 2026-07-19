export default function manifest() {
  return {
    name: 'iPlug — Find Your Plug',
    short_name: 'iPlug',
    description: 'Nigeria\'s hyperlocal marketplace. Find services, shops, and places near you.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090B',
    theme_color: '#FF6B35',
    icons: [
      {
        src: '/iplug_logo.png',
        sizes: '192x192 512x512',
        type: 'image/png',
      }
    ],
  }
}
