import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = mode === 'production'
    ? (env.VITE_API_URL || '')
    : (env.VITE_API_URL || 'http://localhost:5000');

  return {
    define: {
      'process.env': env,
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl)
    },
    plugins: [react()],
  }
})

