<script lang="ts">
  import { onMount } from "svelte";
  export let onDone: () => void;

  let visible = true;
  let animateOut = false;

  onMount(() => {
    // Lock scrolling more comprehensively
    const html = document.documentElement;
    const body = document.body;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    // Show splash for 2 seconds
    const timer = setTimeout(() => {
      animateOut = true; // start exit animation
      // Wait for animation to finish before removing element
      setTimeout(() => {
        visible = false;
        // Unlock scrolling
        html.style.overflow = "";
        body.style.overflow = "";
        onDone();
      }, 800); // slightly longer to match smoother animation
    }, 2000);

    return () => {
      clearTimeout(timer);
      // Cleanup
      html.style.overflow = "";
      body.style.overflow = "";
    };
  });
</script>

{#if visible}
  <div
    class="fixed min-h-screen inset-0 flex items-center justify-center bg-[var(--color-text-primary)] text-white z-50 text-center transition-all duration-500 ease-out"
    class:animate-out={animateOut}
  >
    <h1 class="mx-auto w-full font-manrope text-5xl font-bold tracking-tight">
      <span class="tracking-tighter text-[var(--color-primary-green)] pr-1"
        >HEAR</span
      > Journal
    </h1>
  </div>
{/if}

<style>
  .animate-out {
    animation: fadeScaleBlur 0.8s ease-out forwards;
  }

  @keyframes fadeScaleBlur {
    0% {
      opacity: 1;
      transform: scale(1);
      filter: blur(0px);
    }
    70% {
      opacity: 0.3;
      transform: scale(0.98);
      filter: blur(1px);
    }
    100% {
      opacity: 0;
      transform: scale(0.95);
      filter: blur(4px);
    }
  }
</style>
