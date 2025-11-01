import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [viteSingleFile()],
  server: {
    proxy: {
      '/gifs': {
        target: 'http://127.0.0.1:5001/eightxeightxeightxeight/us-central1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gifs/, '/serveGif/gifs'),
      },
    },
  },
})
