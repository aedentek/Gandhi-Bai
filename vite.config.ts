import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/' : '/',
  server: {
    host: "::",
    port: 8080,
    strictPort: true, // Force port 8080, fail if not available
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      },
      '/Photos': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      external: (id) => {
        // Exclude specific test files from production build, but NOT lucide-react icons or pages
        if (id.includes('lucide-react') || id.includes('src/pages/')) {
          return false; // Don't exclude lucide-react icons or page components
        }
        return id.includes('debug-') || 
               id.includes('upload-test') ||
               id.includes('quick-test') ||
               id.includes('direct-api-test') ||
               id.includes('direct-upload-test') ||
               id.includes('null-values-test') ||
               id.includes('photo-upload-fix-test') ||
               id.includes('test-patient-attendance-crud') ||
               id.includes('test-photo-url-fix');
      }
    }
  }
}));
