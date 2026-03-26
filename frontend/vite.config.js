import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // Uses jsdom to simulate the browser
    globals: true,        // Allows using describe/it/expect without importing them
    setupFiles: './src/setupTests.js', // Runs this file before every test
  }
})
