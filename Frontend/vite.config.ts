import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      watch: {
        ignored: [
          '**/chrome-profile*/**',
          '**/chrome_log*.*',
          '**/dist/**',
          '**/.git/**',
          '**/node_modules/**'
        ]
      },
      proxy: {
        '/signal': {
          target: env.VITE_SIGNALING_SERVER_URL || 'ws://localhost:5000',
          ws: true,
          rewrite: (path) => path.replace(/^\/signal/, '')
        },
        '/api': {
          target: env.VITE_BACKEND_URL || 'http://localhost:8000',
          changeOrigin: true,
        }
      }
    },
    preview: {
      port: 4173,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        workbox: {
          clientsClaim: false,
          // Clean up old caches on new service worker activation
          cleanupOutdatedCaches: true,
          // Limit precache to essential files to avoid bloating the SW install
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          // Exclude large vendor bundles that are code‑split and lazy‑loaded
          globIgnores: ['**/vendor-three*.js', '**/vendor-livekit*.js', '**/vendor-react*.js'],
          maximumFileSizeToCacheInBytes: 2000000, // 2 MB per file
          runtimeCaching: [
            {
              // Cache font files with a stale‑while‑revalidate strategy
              urlPattern: /\.(?:woff2|woff|ttf|otf)$/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'font-cache',
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
            {
              // Cache JavaScript and CSS chunks (including vendor bundles) under /assets/
              urlPattern: /\/assets\/.*\.(?:js|css)$/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'assets-cache',
                expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }, // 30 days
              },
            },
            {
              // Cache image assets (icons, logos) similarly
              urlPattern: /\.(?:png|svg|jpg|jpeg|webp)$/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'image-cache',
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
            {
              // Cache 3D model files (glb, gltf) aggressively using CacheFirst
              urlPattern: /\.(?:glb|gltf)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: '3d-model-cache',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // Cache for 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              },
            },
            {
              // Cache Draco decoder files aggressively from Google Static CDN
              urlPattern: /^https:\/\/www\.gstatic\.com\/draco\/.*$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'draco-decoder-cache',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // Cache for 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              },
            },
            // Existing API caching remains unchanged
            {
              urlPattern: /^http:\/\/localhost:8000\/api\/.*$/,
              handler: 'NetworkFirst',
              options: { cacheName: 'api-cache', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 } },
            },
            {
              urlPattern: /^https:\/\/.*\/api\/.*$/,
              handler: 'NetworkFirst',
              options: { cacheName: 'prod-api-cache', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 } },
            },
          ],
        },
        manifest: {
          name: 'LabZero Online Lab',
          short_name: 'LabZero',
          description: 'Interactive Online Science Laboratory',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          icons: [
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          ],
        },
      })
    ],
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      target: 'es2022',
      chunkSizeWarningLimit: 700,
      modulePreload: {
        resolveDependencies(filename, deps, { hostId, hostType }) {
          return deps.filter(dep => {
            const lower = dep.toLowerCase();
            // Avoid preloading heavy vendor packages
            if (lower.includes('vendor-three') || lower.includes('vendor-livekit')) {
              return false;
            }
            // Avoid preloading below-the-fold / dashboard dynamic chunks
            if (
              lower.includes('dashboard') ||
              lower.includes('topicpage') ||
              lower.includes('subjectpage') ||
              lower.includes('meetingroom') ||
              lower.includes('quiz') ||
              lower.includes('glossary') ||
              lower.includes('settingsmenu') ||
              lower.includes('authoverlay') ||
              lower.includes('memorymapoverlay') ||
              lower.includes('gesturecontroller')
            ) {
              return false;
            }
            return true;
          });
        }
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalized = id.replace(/\\/g, '/');
            if (normalized.includes('/node_modules/')) {
              const pkgPath = normalized.split('/node_modules/').pop() || '';
              if (pkgPath.startsWith('react/') || pkgPath.startsWith('react-dom/') || pkgPath.startsWith('scheduler/')) {
                return 'vendor-react';
              }
              if (pkgPath.startsWith('three/') || pkgPath.startsWith('@react-three/')) {
                return 'vendor-three';
              }
              if (pkgPath.startsWith('livekit-client/') || pkgPath.startsWith('@livekit/')) {
                return 'vendor-livekit';
              }
              if (pkgPath.startsWith('framer-motion/') || pkgPath.startsWith('motion/')) {
                return 'vendor-motion';
              }
            }
          }
        }
      }
    }
  };
});

