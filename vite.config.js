import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'
  
  return {
    plugins: [react()],
    
    // Development server configuration
    server: {
      host: true,
      port: 3000,
      historyApiFallback: true,
      proxy: {
        '/api': {
          target: 'https://backend.realtyxpo.in',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    },

    // Build configuration
    build: {
      // Output directory
      outDir: 'dist',
      
      // Generate sourcemaps for production debugging
      sourcemap: isProduction ? 'hidden' : true,
      
      // Minimize in production
      minify: isProduction ? 'esbuild' : false,
      
      // Clean output directory before build
      emptyOutDir: true,
      
      // Chunk size warning limit
      chunkSizeWarningLimit: 1000,
      
      // Rollup options for advanced optimization
      rollupOptions: {
        input: {
          main: resolve(fileURLToPath(new URL('.', import.meta.url)), 'index.html'),
        },
        
        output: {
          // Manual chunk splitting for better caching
          manualChunks: {
            // Vendor chunks
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['@emotion/react', '@emotion/styled'],
            utils: ['axios', 'react-hot-toast'],
            
            // Feature-based chunks
            forms: [
              'src/pages/forms/AddLead.jsx',
              'src/pages/forms/EditLead.jsx',
              'src/pages/forms/AddInventry.jsx'
            ],
            
            team: [
              'src/pages/team/MyTeam.jsx',
              'src/pages/team/UserDetails.jsx',
              'src/pages/team/DailyPlan.jsx'
            ],
            
            resources: [
              'src/pages/resources/BrokersRequirements.jsx',
              'src/pages/resources/FindOpportunity.jsx',
              'src/pages/resources/LearnGrow.jsx'
            ]
          },
          
          // Naming patterns for assets
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
            if (facadeModuleId) {
              const fileName = facadeModuleId.split('/').pop().replace('.jsx', '').replace('.js', '')
              return `js/${fileName}.[hash].js`
            }
            return 'js/[name].[hash].js'
          },
          
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.')
            const ext = info[info.length - 1]
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `images/[name].[hash][extname]`
            }
            if (/woff2?|eot|ttf|otf/i.test(ext)) {
              return `fonts/[name].[hash][extname]`
            }
            return `assets/[name].[hash][extname]`
          },
          
          entryFileNames: 'js/[name].[hash].js'
        }
      },
      
      // Target modern browsers for smaller bundles
      target: 'es2015',
      
      // Asset handling
      assetsDir: 'assets',
      
      // CSS code splitting
      cssCodeSplit: true
    },

    // Optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'axios',
        'react-hot-toast'
      ],
      exclude: ['@vite/client', '@vite/env']
    },

    // Path resolution
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
        '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
        '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
        '@api': fileURLToPath(new URL('./src/api', import.meta.url)),
        '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
        '@context': fileURLToPath(new URL('./src/context', import.meta.url))
      }
    },

    // CSS configuration
    css: {
      modules: {
        localsConvention: 'camelCase'
      },
      postcss: './postcss.config.js'
    },

    // Environment variables
    envPrefix: 'VITE_',
    
    // Preview configuration (for production preview)
    preview: {
      port: 4173,
      host: true
    },

    // Esbuild configuration
    esbuild: {
      // Remove console logs in production
      drop: isProduction ? ['console', 'debugger'] : [],
      
      // Keep function names for better debugging
      keepNames: !isProduction
    },

    // Define global constants
    define: {
      __APP_VERSION__: JSON.stringify('1.0.0'),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
      __IS_PRODUCTION__: isProduction
    }
  }
})
