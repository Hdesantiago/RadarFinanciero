import { defineConfig } from 'vite';

// base './' genera rutas relativas: la aplicación funciona en cualquier
// subdirectorio de GitHub Pages (https://usuario.github.io/repositorio/)
// sin configuración adicional ni dominio propio.
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  server: {
    port: 5173,
    open: false
  }
});
