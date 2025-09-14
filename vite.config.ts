import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "192.168.1.3",
      "plan-labor-crowd-plate.trycloudflare.com",
      ".trycloudflare.com"
    ],
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: [
        'mock-aws-s3', 
        'aws-sdk', 
        'nock', 
        '@mapbox/node-pre-gyp', 
        'bcrypt', 
        'jsonwebtoken',
        'prisma'
      ],
      output: {
        manualChunks: undefined
      }
    }
  },
  optimizeDeps: {
    exclude: [
      'mock-aws-s3', 
      'aws-sdk', 
      'nock', 
      '@mapbox/node-pre-gyp', 
      'bcrypt', 
      'jsonwebtoken',
      'prisma'
    ]
  },
  assetsInclude: ['**/*.html'],
  define: {
    global: 'globalThis'
  }
}));
