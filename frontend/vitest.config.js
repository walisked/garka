import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    deps: {
      inline: []
    },
    transformMode: {
      web: [ /\.[jt]sx?$/ ]
    },
    setupFiles: ['./src/test/vitest.setup.js']
  }
})
