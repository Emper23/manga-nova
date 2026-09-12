import { defineConfig, type ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'

const createBullyProxy = (): ProxyOptions => ({
  target: 'https://mangablackcat.com',
  changeOrigin: true,
  rewrite: (path: string) => path.replace(/^\/blackcat/, ''),
  configure: (proxy) => {
    proxy.on('proxyReq', (proxyReq) => {
      proxyReq.removeHeader('origin')
      proxyReq.removeHeader('referer')
    })
  },
})

const createNekoProxy = (): ProxyOptions => ({
  target: 'https://miku-doujin.com',
  changeOrigin: true,
  rewrite: (path: string) => path.replace(/^\/neko/, '') || '/',
  headers: {
    'accept-language': 'th-TH,th;q=0.9,en;q=0.8',
    referer: 'https://miku-doujin.com/',
  },
  configure: (proxy) => {
    proxy.on('proxyReq', (proxyReq) => {
      proxyReq.removeHeader('origin')
      proxyReq.setHeader('user-agent', 'MANGA-NOVA-demo/1.0')
    })
  },
})

const createDevilProxy = (): ProxyOptions => ({
  target: 'https://www.devil69porn.tv',
  changeOrigin: true,
  rewrite: (path: string) => path.replace(/^\/devil/, '') || '/',
  headers: {
    'accept-language': 'th-TH,th;q=0.9,en;q=0.8',
    referer: 'https://www.devil69porn.tv/',
  },
  configure: (proxy) => {
    proxy.on('proxyReq', (proxyReq) => {
      proxyReq.removeHeader('origin')
      proxyReq.setHeader('user-agent', 'MANGA-NOVA-demo/1.0')
    })
    proxy.on('proxyRes', (proxyRes) => {
      // the player is embedded on our own origin
      delete proxyRes.headers['x-frame-options']
      delete proxyRes.headers['content-security-policy']
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // mangablackcat.com blocks requests that carry an Origin header
      // ("unauthorized origin"). The Vite dev proxy strips it, so the
      // browser can read pages through /blackcat/... during dev.
      '/blackcat': createBullyProxy(),
      '/neko': createNekoProxy(),
      '/devil': createDevilProxy(),
    },
  },
  preview: {
    proxy: {
      '/blackcat': createBullyProxy(),
      '/neko': createNekoProxy(),
      '/devil': createDevilProxy(),
    },
  },
})
