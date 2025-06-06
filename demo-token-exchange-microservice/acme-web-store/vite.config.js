import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['VITE_OKTA_DOMAIN', 'VITE_OKTA_AUTH_SERVER_ID', 'VITE_OKTA_CLIENT_ID'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Set ${missingEnvVars.join(', ')} in .env`);
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      'react-router-dom': path.resolve(__dirname, 'node_modules/react-router-dom')
    },
    proxy: {
      '/api': {
        target: process.env.VITE_STORE_SERVICE_URL || 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  define: {
    'process.env': {
      VITE_OKTA_DOMAIN: JSON.stringify(process.env.VITE_OKTA_DOMAIN),
      VITE_OKTA_AUTH_SERVER_ID: JSON.stringify(process.env.VITE_OKTA_AUTH_SERVER_ID),
      VITE_OKTA_CLIENT_ID: JSON.stringify(process.env.VITE_OKTA_CLIENT_ID),
      VITE_STORE_SERVICE_URL: JSON.stringify(process.env.VITE_STORE_SERVICE_URL || 'http://localhost:3001'),
      VITE_PAYMENT_SERVICE_URL: JSON.stringify(process.env.VITE_PAYMENT_SERVICE_URL || 'http://localhost:3002')
    }
  },
  server: {
    port: 3000
  },
  test: {
    environment: 'jsdom',
    globals: true
  }  
})
