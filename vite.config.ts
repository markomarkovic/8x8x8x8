import { execSync } from 'child_process'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

const getGitCommitHash = () => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return 'unknown'
  }
}

const getGitVersion = () => {
  try {
    // Try to get the latest tag
    const tag = execSync('git describe --tags --abbrev=0').toString().trim()
    return tag
  } catch {
    // If no tags exist, fall back to commit count
    try {
      const count = execSync('git rev-list --count HEAD').toString().trim()
      return `0.0.${count}`
    } catch {
      return 'dev'
    }
  }
}

export default defineConfig({
  plugins: [viteSingleFile()],
  define: {
    __GIT_COMMIT_HASH__: JSON.stringify(getGitCommitHash()),
    __PACKAGE_VERSION__: JSON.stringify(getGitVersion()),
  },
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
