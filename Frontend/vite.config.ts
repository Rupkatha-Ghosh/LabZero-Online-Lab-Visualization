import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/signal': {
            target: 'ws://localhost:5000',
            ws: true,
            rewrite: (path) => path.replace(/^\/signal/, '')
          }
        }
      },
      preview: {
        port: 4173,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        mode === 'production' ? basicSsl() : [],
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
          workbox: {
            maximumFileSizeToCacheInBytes: 4000000,
            runtimeCaching: [
              {
                urlPattern: /^http:\/\/localhost:8000\/api\/.*/,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'api-cache',
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
                  },
                },
              },
              {
                urlPattern: /^https:\/\/.*\/api\/.*/,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'prod-api-cache',
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 60 * 24 * 7,
                  },
                },
              }
            ]
          },
          manifest: {
            name: 'LabZero Online Lab',
            short_name: 'LabZero',
            description: 'Interactive Online Science Laboratory',
            theme_color: '#ffffff',
            background_color: '#ffffff',
            display: 'standalone',
            icons: [
              {
                src: 'pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: 'pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ]
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        dedupe: ['react', 'react-dom'],
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

