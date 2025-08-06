import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,          // exposes to LAN
    port: 5173,          // can be any free port
    historyApiFallback: true, // for React Router
  },
})
