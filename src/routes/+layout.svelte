<script lang="ts">
    /* ----------------------------- Global styles ---------------------------- */
    import "../app.css";
    import favicon from "$lib/assets/HEAR-Journal.ico";

    /* ----------------------------- Components ------------------------------- */
    import Header from "$lib/components/Header.svelte";
    import Splash from "$lib/components/SplashScreen.svelte";

    /* ------------------------------ Svelte ---------------------------------- */
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import { page } from "$app/stores";

    /* ------------------------------ Utils ----------------------------------- */
    import { parseUserAgent } from "$lib/utils/userAgentParser";
    import { isInstalledAsPWA } from "$lib/utils/pwaModeDetect";
    import { registerSW } from "virtual:pwa-register";

    // ✅ add this import
    import { recordAppOpenOncePerDay } from "$lib/utils/engagement";

    /* ----------------------------- UI state --------------------------------- */
    let showSplash = false;
    let isPWA = false;
    let uaDisplay = "";
    $: isPhilosophyPage = $page.url.pathname === "/philosophy";

    /* -------------------------- Client-only setup --------------------------- */
    onMount(() => {
        if (!browser) return;

        // ✅ count unique day open on initial mount
        recordAppOpenOncePerDay();

        // ✅ optional: count again when returning to the app (background -> foreground)
        const onVis = () => {
            if (document.visibilityState === "visible") {
                recordAppOpenOncePerDay();
            }
        };
        document.addEventListener("visibilitychange", onVis);

        uaDisplay = parseUserAgent(window.navigator.userAgent);
        isPWA = isInstalledAsPWA();

        // Only show splash when installed as PWA
        showSplash = isPWA;

        // cleanup
        return () => {
            document.removeEventListener("visibilitychange", onVis);
        };
    });

    /* -------------------------- Service Worker ------------------------------ */
    const updateSW = registerSW({
        immediate: true,
        onNeedRefresh() {
            if (confirm("New content available. Reload?")) {
                updateSW(true);
            }
        },
        onOfflineReady() {
            console.log("App ready to work offline");
        },
    });

    /* --------------------------- Event handlers ----------------------------- */
    function handleSplashDone() {
        showSplash = false;
    }

    let currentYear: number = new Date().getFullYear();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen" class:bg-white={isPhilosophyPage}>
    <div class="sticky top-0 z-50 border-b border-black/5 bg-white">
        <Header />
    </div>

    <div class="flex flex-col">
        {#if showSplash}
            <Splash onDone={handleSplashDone} />
        {/if}

        <div class="flex-1 w-full mx-auto overflow-x-hidden">
            <slot />
        </div>
    </div>
    <footer
        class={isPhilosophyPage
            ? "w-full border-t border-black/5 bg-white px-6 py-8 text-center text-sm text-black/70"
            : "mx-auto mb-0 max-w-6xl text-center text-sm text-black/70 py-6 px-6 bg-neutral-200 md:mb-8 md:rounded-[28px] md:border md:border-black/5 md:bg-white/75 md:shadow-sm"}
    >
        <p class="text-black/90 font-manrope font-semibold">
            HEAR Journal &copy; {currentYear}
        </p>
        <hr class="mb-4 mt-3 border-t border-neutral-300 text-serif" />
        <p class="mx-auto max-w-2xl px-4">
            HEAR Journal is an independent companion app for the HEAR Journaling
            method. HEAR Journaling is a teaching framework developed by
            Replicate Ministries. This tool is not affiliated with, endorsed by,
            or officially connected to Replicate Ministries.
        </p>
        <p class="mx-auto mt-4 max-w-2xl px-4 text-xs leading-5 text-black/55">
            This app uses zero cookies and collects no data!
            <br />
            It even works offline <span>—</span> everything is saved only on your
            device.
        </p>
        {#if !isPhilosophyPage}
            <a
                href="/philosophy"
                class="mx-auto mt-2 flex w-fit font-manrope text-xs font-semibold transition text-black/60 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-green)] focus-visible:ring-offset-4"
            >
                Our philosophy →
            </a>
        {/if}
        <a
            href="https://github.com/AbreuOliver"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-5 inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 font-manrope text-xs font-medium text-black/60 transition hover:bg-black/5 hover:text-black/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-green)]"
            aria-label="View creator on GitHub"
        >
            <span>made with</span>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
            >
                <path d="M3 19h18" />
                <path d="M5 6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v9H5z" />
            </svg>
            <span>in Raleigh, NC</span>
        </a>
    </footer>
</div>
