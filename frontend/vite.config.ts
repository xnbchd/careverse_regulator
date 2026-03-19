import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'
import proxyOptions from './proxyOptions';

const dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
	plugins: [react()],
	// Allow for hot reloading in development
	// Developmnet (npm run dev) : /compliance-360/
	// Production (npm run build) : /assets/careverse_regulator/compliance-360/
	base: command === 'serve' ? '/compliance-360/' : '/assets/careverse_regulator/compliance-360/',
	server: {
		port: 8080,
		host: '0.0.0.0',
		proxy: proxyOptions,
		allowedHosts: [
			'regulators.local',
			'localhost',
			'.local'
		]
	},
	resolve: {
		alias: {
			'@': path.resolve(dirname, 'src')
		}
	},
	build: {
		outDir: '../careverse_regulator/public/compliance-360',
		emptyOutDir: true,
		target: 'es2015',
		manifest: true,
		sourcemap: true,
		rollupOptions: {
			input: path.resolve(dirname, 'src/main.tsx'),
			output: {
				manualChunks: undefined,
			},
		},
	},
}));
