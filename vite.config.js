import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://www.npmjs.com/package/vite-plugin-node-polyfills
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(), 
    nodePolyfills({
            //only include specific nodejs modules to be polyfilled. Exclude this to polyfill everything 
            //include: ['fs', 'buffer', 'events'],
            overrides: {
                // Since `fs` is not supported in browsers, we can use the `memfs` package to polyfill it.
                fs: 'memfs',
            },
            // Whether to polyfill `node:` protocol imports.
            //protocolImports: true,
        }
    )],
    base: "./",
})
