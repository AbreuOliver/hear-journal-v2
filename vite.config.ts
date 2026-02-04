import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			manifest: {
				name: 'HEAR Journal',
				short_name: 'HEAR',
				start_url: '/',
				scope: '/',
				display: 'standalone',
				background_color: '#000000',
				theme_color: '#32cd32',
				icons: [
					{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
					{ src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
				]
			},
			workbox: {
				maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MiB
				globPatterns: ['**/*.{js,css,html,ico,png,svg}']
			}
		})
	],
});
