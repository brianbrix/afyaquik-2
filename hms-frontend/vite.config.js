// Bridge JS config to TypeScript config to satisfy tooling that looks for vite.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
// Detect if we're running inside Docker (via env variable)
const isDocker = process.env.VITE_DOCKER === 'true'
export default defineConfig({
	plugins: [react()],
	base: isDocker ? '/hms/' : '/',
	server: { port: 5173, open: true },
	preview: { port: 4173 },
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: [],
		coverage: { provider: 'v8', reporter: ['text', 'html'] }
	}
});
