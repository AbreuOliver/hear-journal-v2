// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	interface Window {
		umami?: {
			track: (
				eventName: string,
				eventData?: Record<string, string | number | boolean | null | undefined>
			) => void;
		};
	}

	namespace App {
		// interface Error {}
		interface Locals {
			deviceInfo: string;
			themeColor: string;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
