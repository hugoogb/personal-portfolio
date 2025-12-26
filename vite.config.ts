import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 3000,
        open: true,
    },
    build: {
        outDir: 'dist',
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) return undefined
                    if (id.includes('/react-dom/') || id.includes('/react/')) return 'react-vendor'
                    if (id.includes('/motion/')) return 'motion-vendor'
                    if (id.includes('/@tabler/icons-react/')) return 'icons-vendor'
                    if (id.includes('/react-icons/')) return 'icons-vendor'
                    if (id.includes('/@vercel/analytics/') || id.includes('/@vercel/speed-insights/'))
                        return 'vercel-vendor'
                    return undefined
                },
            },
        },
    },
})

