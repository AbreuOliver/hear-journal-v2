<script lang="ts">
  let streakCount = 34;
  let menuOpen = false;

  function toggleMenu() {
    menuOpen = !menuOpen;
  }
</script>

<!-- <header
  class="flex items-center min-h-16 sticky top-0 z-10 w-full px-8 sm:px-6 default-header bg-white">
  <h1
    class="max-w-[30ch] py-3 mx-auto w-full font-manrope text-2xl font-semibold tracking-normal text-[var(--color-primary-green)]"
  >
    <span class="tracking-normal">HEAR</span> Journal
  </h1>
</header> -->


<header class="sticky top-0 z-20 bg-white min-h-16 flex h-full w-full items-center">
  <div class="flex  h-full w-full px-4 mx-auto items-center">
    <!-- =====================
         Left: Menu Button
    ====================== -->
    <button
      on:click={toggleMenu}
      aria-label="Open menu"
      aria-expanded={menuOpen}
      class="p-2 rounded-lg hover:bg-neutral-100 transition"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6 text-neutral-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>

    <!-- =====================
         Title (left-aligned)
    ====================== -->
    <h1
      class="font-manrope text-[1.35rem] font-semibold text-[var(--color-primary-green)] select-none cursor-default"
    >
      <span class="tracking-normal">HEAR</span> Journal
    </h1>

    <!-- =====================
         Right: Streak + Avatar
    ====================== -->
    <div class="ml-auto flex items-center gap-4 mr-4 select-none cursor-default">
      <!-- Streak -->
      <div
        class="flex items-center gap-1 text-sm font-semibold text-neutral-700"
        aria-label="Reading streak"
      >
        <span aria-hidden="true">🔥</span>
        <span class="text-neutral-400 font-manrope tracking-wide text-lg font-medium">{streakCount}</span>
      </div>

      <!-- Avatar -->
      <button
        class="h-9 w-9 rounded-full bg-[var(--color-primary-green)] flex items-center justify-center text-sm font-semibold text-neutral-700"
        aria-label="User profile"
      >
        <img src="https://ik.imagekit.io/bip1v395ybp/image%203_nuLAwU-HR.png" alt="User Avatar" class="h-7 w-auto" />
        <!-- <img src="https://ik.imagekit.io/bip1v395ybp/momoji-girl-Photoroom_JpHFUihNWy.png" alt="User Avatar" class="h-7 w-auto" /> -->
      </button>
    </div>
  </div>
</header>