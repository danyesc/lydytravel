import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173, // Puerto en el que se ejecuta tu frontend (opcional)
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // La URL de tu servidor backend
        changeOrigin: true, // Necesario para CORS
        secure: false, // Si tu backend NO usa HTTPS, pon `secure: false`
      },
    },
  },
});