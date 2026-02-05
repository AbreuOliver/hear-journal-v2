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

<div class="max-w-md mx-auto">
  <div class="sticky top-0 z-50 bg-white">
    <Header />
  </div>

  <div class="flex flex-col">
    {#if showSplash}
      <Splash onDone={handleSplashDone} />
    {/if}

    <div class="flex-1 w-full mx-auto sm:px-0 overflow-x-hidden">
      <slot />
    </div>
  </div>
  <footer class="text-center text-sm text-black/70 py-6 px-4 bg-neutral-200">
    <p class="text-black/90 font-manrope font-semibold">HEAR Journal &copy; {currentYear}</p>
    <hr class="mb-4 mt-3 border-t border-neutral-300 text-serif" />
    <p class="px-4">HEAR Journal is an independent companion app for the HEAR Journaling method.
      HEAR Journaling is a teaching framework developed by Replicate Ministries.
      This tool is not affiliated with, endorsed by, or officially connected to Replicate Ministries.
    </p>
  </footer>
</div>
