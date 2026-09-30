import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        dashboard: resolve(process.cwd(), 'dashboard.html'),
        policies: resolve(process.cwd(), 'policies.html'),
        checkProposal: resolve(process.cwd(), 'check-proposal.html'),
        decisionLog: resolve(process.cwd(), 'decision-log.html'),
      },
    },
  },
});
