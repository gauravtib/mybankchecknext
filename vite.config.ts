import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'admin.html'
      }
    }
  },
  server: {
    // Handle admin routing properly
    middlewareMode: false,
    // Custom middleware to handle /admin route
    configureServer(server) {
      server.middlewares.use('/admin', (req, res, next) => {
        // Serve admin.html for /admin requests
        req.url = '/admin.html';
        next();
      });
    }
  }
});