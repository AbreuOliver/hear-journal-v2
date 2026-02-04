<script lang="ts">
  import { onMount } from 'svelte';

  let streakCount = 34;
  let menuOpen = false;

  function toggleMenu() {
    menuOpen = !menuOpen;
  }

  const AVATAR_KEY = 'hearjournal.avatar.dataurl';

  // default/fallback avatar (your current remote image)
  const fallbackAvatar =
    'https://ik.imagekit.io/bip1v395ybp/image%203_nuLAwU-HR.png';

  let avatarSrc: string = fallbackAvatar;

  onMount(() => {
    const saved = localStorage.getItem(AVATAR_KEY);
    if (saved) avatarSrc = saved;
  });

  async function onAvatarPicked(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // basic guardrails
    if (!file.type.startsWith('image/')) return;
    // keep it reasonable; base64 inflates size ~33%
    if (file.size > 2_000_000) return;

    const dataUrl = await readAsDataUrl(file);
    avatarSrc = dataUrl;
    localStorage.setItem(AVATAR_KEY, dataUrl);

    // allow picking the same file again later (some browsers otherwise won't fire change)
    input.value = '';
  }

  function resetAvatar() {
    localStorage.removeItem(AVATAR_KEY);
    avatarSrc = fallbackAvatar;
  }

  function readAsDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(file);
    });
  }
</script>

<header class="sticky top-0 z-20 bg-white min-h-16 flex h-full w-full items-center">
  <div class="flex h-full w-full px-4 mx-auto items-center">
    <!-- Left: Menu Button -->
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

    <!-- Title -->
    <h1 class="font-manrope text-[1.35rem] font-semibold text-[var(--color-primary-green)] select-none cursor-default">
      <span class="tracking-normal">HEAR</span> Journal
    </h1>

    <!-- Right: Streak + Avatar -->
    <div class="ml-auto flex items-center gap-4 mr-4 select-none">
      <!-- Streak -->
      <div class="flex items-center gap-1 text-sm font-semibold text-neutral-700" aria-label="Reading streak">
        <!-- <span aria-hidden="true">🔥</span> -->
         <!-- <svg xmlns="http://www.w3.org/2000/svg" class="text-neutral-400" width="24" height="24" viewBox="0 0 24 24">
          <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0a5 5 0 0 1 1-3a1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" />
        </svg> -->
        <svg xmlns="http://www.w3.org/2000/svg" class="text-neutral-400"  width="24" height="24" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
            <path stroke-dasharray="60" d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9">
              <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="60;0" />
            </path>
            <g stroke-dasharray="4" stroke-dashoffset="4">
              <path d="M9 9v1">
                <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s" to="0" />
              </path>
              <path d="M14.5 9.5h1">
                <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.8s" dur="0.2s" to="0" />
              </path>
            </g>
            <path stroke-dasharray="14" stroke-dashoffset="14" d="M8 14c0.5 1.5 1.79 3 4 3c2.21 0 3.5 -1.5 4 -3">
              <animate fill="freeze" attributeName="stroke-dashoffset" begin="1s" dur="0.2s" to="0" />
            </path>
          </g>
        </svg>
        <span class="text-neutral-400 font-manrope tracking-wide text-lg font-medium">{streakCount}</span>
      </div>

      <!-- Avatar (click to change) -->
      <div class="relative">
        <!-- Hidden file input -->
        <input
          id="avatarPicker"
          type="file"
          accept="image/*"
          class="hidden"
          on:change={onAvatarPicked}
        />

        <!-- The avatar button opens the picker -->
        <button
          type="button"
          class="h-9 w-9 rounded-full bg-[var(--color-primary-green)] flex items-center justify-center overflow-hidden"
          aria-label="Change user avatar"
          on:click={() => document.getElementById('avatarPicker')?.click()}
        >
          <img
            src={avatarSrc}
            alt="User Avatar"
            class="h-7 w-auto"
            draggable="false"
          />
        </button>

        <!-- Optional: small reset action -->
        <button
          type="button"
          class="absolute -bottom-2 -right-2 h-5 w-5 rounded-full bg-white border border-neutral-200 text-[10px] leading-none flex items-center justify-center hover:bg-neutral-50"
          aria-label="Reset avatar"
          on:click={resetAvatar}
          title="Reset"
        >
          ↺
        </button>
      </div>
    </div>
  </div>
</header>
