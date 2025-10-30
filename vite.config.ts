import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { viteSourceLocator } from "@metagptx/vite-plugin-source-locator";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Base path for GitHub Pages (set to '/' for root domain or custom domain)
  // For GitHub Pages: use '/repository-name/' format
  base: process.env.VITE_BASE_PATH || '/',
  
  plugins: [
    viteSourceLocator({
      prefix: "mgx",
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // Optimize build for production
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Add hash to filenames for cache busting
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        // Add hash to chunk filenames
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
}));
