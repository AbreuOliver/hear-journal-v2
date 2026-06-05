import { browser } from "$app/environment";

type EventData = Record<string, string | number | boolean | null | undefined>;

export function trackEvent(eventName: string, eventData?: EventData) {
    if (!browser || !window.umami) return;

    window.umami.track(eventName, eventData);
}
