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

  /* ----------------------------- UI state --------------------------------- */
  let showSplash = false;
  let isPWA = false;
  let uaDisplay = "";

  /* -------------------------- Client-only setup --------------------------- */
  onMount(() => {
    if (!browser) return;

    uaDisplay = parseUserAgent(window.navigator.userAgent);
    isPWA = isInstalledAsPWA();

    // Only show splash when installed as PWA
    showSplash = isPWA;
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
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="max-w-md mx-auto overflow-x-hidden">
  <Header />

  <div class="flex flex-col overflow-x-hidden">
    {#if showSplash}
      <Splash onDone={handleSplashDone} />
    {/if}

    <div class="flex-1 w-full mx-auto px-4 sm:px-0">
      <slot />
    </div>
  </div>
</div>
