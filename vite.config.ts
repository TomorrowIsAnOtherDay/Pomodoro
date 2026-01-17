import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Plugin to display debug mode info on server start
const debugModePlugin = () => {
  return {
    name: 'debug-mode-info',
    configureServer(server: any) {
      server.httpServer?.once('listening', () => {
        const address = server.httpServer?.address();
        if (address && typeof address === 'object') {
          const port = address.port;
          const localUrl = `http://localhost:${port}`;
          const debugUrl = `${localUrl}?debug=true`;
          
          console.log('\n');
          console.log('  🍅 Pomodoro Timer - Debug Mode');
          console.log('  ──────────────────────────────');
          console.log(`  Normal:  ${localUrl}`);
          console.log(`  Debug:   ${debugUrl}`);
          console.log('  ──────────────────────────────');
          console.log('  💡 Add ?debug=true to enable 5-second test mode\n');
        }
      });
    }
  };
};

export default defineConfig(() => {
  return {
    server: {
      port: 5173,
      host: '127.0.0.1',
      strictPort: true
    },
    plugins: [
      react(),
      debugModePlugin()
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.')
      }
    }
  };
});
