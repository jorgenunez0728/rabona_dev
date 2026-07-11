import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { defineConfig } from 'vite'
import path from 'path'

// Standalone build: produces a single self-contained HTML file (all JS, CSS
// and image assets inlined as base64) that can be opened directly via file://
// without a web server. Music tracks (public/music) are NOT inlined and will
// be silently unavailable; Tone.js SFX still work.
//
// Usage: npm run build:standalone  →  dist-standalone/index.html
export default defineConfig({
  logLevel: 'error',
  define: {
    'import.meta.env.VITE_STANDALONE': JSON.stringify('1'),
  },
  plugins: [
    base44({
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: false,
      navigationNotifier: false,
      analyticsTracker: false,
      visualEditAgent: false,
    }),
    react(),
    viteSingleFile({ removeViteModuleLoader: true }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist-standalone',
    // Inline every imported asset (sprites, stadiums, icons) as base64
    assetsInlineLimit: 100 * 1024 * 1024,
    chunkSizeWarningLimit: 100 * 1024,
  },
});
