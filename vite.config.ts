import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Chrome QA profiles contain locked cache files and are not app sources.
    watch: { ignored: /(?:^|[/\\])[^/\\]+\.local(?:[/\\]|$)/ },
  },
})
