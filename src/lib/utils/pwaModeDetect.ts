export function isInstalledAsPWA(): boolean {
	// Prevent SSR errors
	if (typeof window === 'undefined') return false;

	return (
		window.matchMedia('(display-mode: standalone)').matches ||
		(window.navigator as any).standalone === true // iOS Safari
	);
}
