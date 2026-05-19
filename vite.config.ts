import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', ['VITE_', 'HA_']);
  const haBaseUrl = env.VITE_HA_BASE_URL?.replace(/\/$/, '');
  const haToken = env.HA_TOKEN;

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: haBaseUrl
        ? {
            '/ha-api': {
              target: haBaseUrl,
              changeOrigin: true,
              secure: false,
              rewrite: (path) => path.replace(/^\/ha-api/, ''),
              configure: (proxy) => {
                proxy.on('proxyReq', (proxyReq) => {
                  if (haToken) {
                    proxyReq.setHeader('Authorization', `Bearer ${haToken}`);
                  }
                });
              }
            }
          }
        : undefined
    }
  };
});
