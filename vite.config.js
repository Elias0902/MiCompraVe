import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Rutas relativas: funciona en GitHub Pages sin importar el nombre del repo
  // (usuario.github.io/MiCompraVE/) y tambien al compartir el enlace en el celular.
  base: './',
  plugins: [react()],
})
