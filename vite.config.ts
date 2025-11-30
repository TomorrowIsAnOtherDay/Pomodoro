import path from 'path';
import { defineConfig, loadEnv } from 'vite';
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

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        debugModePlugin()
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
