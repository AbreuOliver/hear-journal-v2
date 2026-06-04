<script lang="ts">
    import { onMount } from "svelte";
    import { engagement } from "$lib/stores/engagement.store";
    import { engagementMetrics } from "$lib/stores/engagementMetrics.store";
    import { fade, fly, scale } from "svelte/transition";
    import { elasticOut, cubicOut, cubicIn } from "svelte/easing";
    import { browser } from "$app/environment";

    // ✅ NOT a streak — just cumulative unique days opened
    $: daysOpened = $engagement.totalOpenDays;

    // ✅ plan days completed (as you already have it)
    $: planDaysCompleted = $engagementMetrics.totalDaysCompleted;

    let menuOpen = false;
    let engagementModalOpen = false;

    // iOS detection (Safari + iOS PWA)
    let isIOS = false;

    function toggleMenu() {
        menuOpen = !menuOpen;
        if (!menuOpen) return;
        engagementModalOpen = false;
    }

    function closeMenu() {
        menuOpen = false;
    }

    function toggleEngagementModal() {
        engagementModalOpen = !engagementModalOpen;
        if (engagementModalOpen) menuOpen = false;
    }

    function handleWindowKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            menuOpen = false;
            engagementModalOpen = false;
        }
    }

    const AVATAR_KEY = "hearjournal.avatar.dataurl";

    const fallbackAvatar =
        "https://ik.imagekit.io/bip1v395ybp/image%203_nuLAwU-HR.png";

    let avatarSrc: string = fallbackAvatar;

    onMount(() => {
        const saved = localStorage.getItem(AVATAR_KEY);
        if (saved) avatarSrc = saved;

        if (browser) {
            const ua = navigator.userAgent || "";
            const isAppleMobile = /iPad|iPhone|iPod/.test(ua);
            const isIPadOS =
                navigator.platform === "MacIntel" &&
                navigator.maxTouchPoints > 1;
            isIOS = isAppleMobile || isIPadOS;
        }
    });

    async function onAvatarPicked(e: Event) {
        const input = e.currentTarget as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) return;
        if (file.size > 2_000_000) return;

        const dataUrl = await readAsDataUrl(file);
        avatarSrc = dataUrl;
        localStorage.setItem(AVATAR_KEY, dataUrl);

        input.value = "";
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

<svelte:window on:keydown={handleWindowKeydown} />

<header class="min-h-16 flex h-full w-full items-center">
    <div
        class="flex h-full w-full max-w-6xl px-4 md:px-6 lg:px-8 mx-auto items-center"
    >
        <!-- Left: Menu Button -->
        <button
            type="button"
            on:click={toggleMenu}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            class="p-2 rounded-full hover:bg-neutral-100 transition md:border md:border-neutral-200 md:bg-white"
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
        <h1
            class="font-manrope text-[1.35rem] md:text-[1.5rem] ml-1.5 font-bold text-[var(--color-primary-green)] select-none cursor-default"
        >
            <span class="tracking-normal">HEAR</span> Journal
        </h1>

        <!-- Right: Days Opened + Avatar -->
        <div class="ml-auto flex items-center gap-4 md:mr-0 select-none">
            <!-- Engagement Button (clickable) -->
            <button
                type="button"
                on:click={toggleEngagementModal}
                class="flex justify-center items-center gap-1 text-sm font-semibold text-neutral-700 p-2 rounded-full hover:bg-neutral-100 transition cursor-pointer"
                aria-label="View progress"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="text-neutral-400 p-0.25 mt-0.75"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                >
                    <path
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-miterlimit="10"
                        stroke-width="2"
                        d="m12.667 10.5l1.25-7.5L6 13h5l-1.25 7.5l7.917-10z"
                        clip-rule="evenodd"
                    />
                </svg>
                <span
                    class="text-neutral-400 font-manrope tracking-wide text-base font-medium pr-1"
                >
                    {Math.max(1, daysOpened)}
                </span>
            </button>

            <!-- Avatar (click to change) -->
            <div class="relative">
                <input
                    id="avatarPicker"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    on:change={onAvatarPicked}
                />

                <button
                    type="button"
                    class="h-9 w-9 rounded-full bg-[var(--color-primary-green)] flex items-center justify-center overflow-hidden"
                    aria-label="Change user avatar"
                    on:click={() =>
                        document.getElementById("avatarPicker")?.click()}
                >
                    <img
                        src={avatarSrc}
                        alt="User Avatar"
                        class="h-7 w-auto"
                        draggable="false"
                    />
                </button>

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

{#if menuOpen}
    <button
        type="button"
        class="fixed inset-0 z-[60] bg-black/45"
        on:click={closeMenu}
        aria-label="Close menu"
        transition:fade={{ duration: 160 }}
    ></button>

    <div
        class="fixed left-0 top-0 z-[70] flex h-[100dvh] w-[86vw] max-w-sm flex-col bg-white text-[var(--color-text-primary)] shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
        transition:fly={{ x: -320, duration: 240, easing: cubicOut }}
    >
        <div
            class="flex items-center gap-3 border-b border-neutral-200 px-5 py-5"
        >
            <div
                class="h-11 w-11 rounded-full bg-[var(--color-primary-green)] flex items-center justify-center overflow-hidden"
            >
                <img
                    src={avatarSrc}
                    alt="User Avatar"
                    class="h-9 w-auto"
                    draggable="false"
                />
            </div>
            <div>
                <p
                    class="font-manrope text-lg font-bold text-[var(--color-primary-green)]"
                >
                    HEAR Journal
                </p>
                <p class="font-inter text-sm text-neutral-500">New Testament</p>
            </div>
            <button
                type="button"
                class="ml-auto rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
                on:click={closeMenu}
                aria-label="Close menu"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>
        </div>

        <div class="flex-1 overflow-y-auto px-5 py-5">
            <section class="rounded-3xl bg-neutral-100 p-4">
                <p
                    class="font-inter text-xs uppercase tracking-wide text-neutral-500"
                >
                    My Rhythm
                </p>
                <div class="mt-3 grid grid-cols-2 gap-3">
                    <div class="rounded-2xl bg-white p-4 shadow-sm">
                        <p
                            class="text-3xl font-semibold leading-none text-neutral-900"
                        >
                            {Math.max(1, daysOpened)}
                        </p>
                        <p class="mt-1 text-xs text-neutral-500">days opened</p>
                    </div>
                    <div class="rounded-2xl bg-white p-4 shadow-sm">
                        <p
                            class="text-3xl font-semibold leading-none text-neutral-900"
                        >
                            {planDaysCompleted}
                        </p>
                        <p class="mt-1 text-xs text-neutral-500">days read</p>
                    </div>
                </div>
            </section>

            <nav class="mt-6 space-y-2" aria-label="Menu">
                <button
                    type="button"
                    class="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left font-manrope text-neutral-800 transition hover:bg-neutral-100"
                    on:click={toggleEngagementModal}
                >
                    <span>View rhythm details</span>
                    <span class="text-neutral-400">›</span>
                </button>
                <button
                    type="button"
                    class="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left font-manrope text-neutral-800 transition hover:bg-neutral-100"
                    on:click={() =>
                        document.getElementById("avatarPicker")?.click()}
                >
                    <span>Change avatar</span>
                    <span class="text-neutral-400">›</span>
                </button>
                <button
                    type="button"
                    class="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left font-manrope text-neutral-800 transition hover:bg-neutral-100"
                    on:click={resetAvatar}
                >
                    <span>Reset avatar</span>
                    <span class="text-neutral-400">↺</span>
                </button>
            </nav>
        </div>

        <div class="border-t border-neutral-200 px-5 py-4">
            <p class="text-xs leading-5 text-neutral-500">
                More settings can live here later: reading plan, meeting day,
                theme color, and data controls.
            </p>
        </div>
    </div>
{/if}

{#if engagementModalOpen}
    <!-- Backdrop -->
    {#if isIOS}
        <button
            type="button"
            class="fixed inset-0 z-[60] bg-black/55"
            on:click={toggleEngagementModal}
            aria-label="Close rhythm modal"
            in:fade={{ duration: 120 }}
            out:fade={{ duration: 120 }}
        ></button>
    {:else}
        <button
            type="button"
            transition:fade={{ duration: 160 }}
            class="fixed inset-0 z-[60] bg-black/55 backdrop-blur-[4px]"
            on:click={toggleEngagementModal}
            aria-label="Close rhythm modal"
        ></button>
    {/if}

    <!-- Modal -->
    {#if isIOS}
        <div
            class="fixed top-[50vh] left-[50vw] -translate-x-1/2 -translate-y-1/2 z-[70]
             w-[92vw] max-w-md rounded-3xl shadow-2xl
             max-h-[calc(100vh-2rem)] overflow-y-auto bg-[#1e1e1e] text-white p-6
             transform-gpu will-change-transform will-change-opacity"
            in:scale={{
                start: 0.98,
                duration: 140,
                easing: cubicOut,
                opacity: 0,
            }}
            out:scale={{
                start: 0.98,
                duration: 120,
                easing: cubicIn,
                opacity: 0,
            }}
        >
            <!-- Header row -->
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-4">
                    <h2
                        class="text-xl font-semibold font-manrope text-[var(--color-primary-green)]"
                    >
                        My Rhythm
                    </h2>
                    <div
                        class="h-9 w-9 rounded-full bg-neutral-400 flex items-center justify-center overflow-hidden"
                    >
                        <img
                            src={avatarSrc}
                            alt="User Avatar"
                            class="h-7 w-auto object-fill"
                            draggable="false"
                        />
                    </div>
                </div>

                <button
                    on:click={toggleEngagementModal}
                    class="p-2 rounded-full hover:bg-white/10 transition"
                    aria-label="Close"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 text-white/70"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>

            <!-- Cards -->
            <div class="grid grid-cols-2 gap-3">
                <!-- Days checked in (cumulative) -->
                <div class="rounded-2xl p-4 bg-white/5">
                    <div class="flex items-center gap-2 mb-2">
                        <p
                            class="text-[11px] uppercase tracking-wider text-white/55"
                        >
                            Days checked in
                        </p>
                    </div>
                    <div class="flex items-center gap-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-6 w-auto text-[var(--color-primary-green)]"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                        >
                            <path
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-miterlimit="10"
                                stroke-width="1.5"
                                d="m12.667 10.5l1.25-7.5L6 13h5l-1.25 7.5l7.917-10z"
                                clip-rule="evenodd"
                            />
                        </svg>
                        <div
                            class="text-4xl leading-none font-semibold text-white"
                        >
                            {Math.max(1, daysOpened)}
                        </div>
                    </div>
                    <p class="text-xs text-white/50 mt-1">
                        total unique days opened
                    </p>
                </div>

                <!-- Plan days completed -->
                <div class="rounded-2xl p-4 bg-white/5">
                    <div class="flex items-center gap-2 mb-2">
                        <p
                            class="text-[11px] uppercase tracking-wider text-white/55"
                        >
                            Plan days read
                        </p>
                    </div>
                    <div class="flex items-center gap-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-6 w-auto text-[var(--color-primary-green)]"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                        >
                            <path
                                fill="currentColor"
                                fill-rule="evenodd"
                                d="M14.243 2.514c.215.28.257.587.257.794c0 2.296.608 4.377 2.096 5.88a29 29 0 0 0 .827.802c.774.727 1.774 1.667 2.223 2.94c.23.654.354 1.35.354 2.07c0 4.005-3.732 7-8 7c-3.148 0-5.946-1.6-7.247-4.028A6.3 6.3 0 0 1 4 14.999v-.863c0-1.515.229-3.022.679-4.47c.097-.318.237-.702.485-.979c.141-.157.39-.362.757-.407c.377-.046.674.1.852.232c.299.221.48.559.576.746c.118.233.234.51.342.778c.117.289.284.565.492.823c.124.153.226.282.319.399l.19.239a1.16 1.16 0 0 0 .2-.548l.196-2.183c.102-1.143.312-2.41.784-3.552c.476-1.151 1.241-2.232 2.478-2.892c.22-.117.621-.308 1.061-.264c.271.027.596.15.832.456m-1.68 2.124c-.346.356-.622.806-.842 1.34c-.361.874-.547 1.913-.642 2.966l-.195 2.183c-.04.446-.175.878-.395 1.268c-.28.498-.743.96-1.358 1.131c-.692.192-1.395-.042-1.877-.628c-.098-.12-.217-.269-.339-.422l-.287-.36a6 6 0 0 1-.377-.526A13 13 0 0 0 6 14.136V15c0 .72.182 1.405.516 2.029C7.428 18.73 9.498 20 12 20c3.464 0 6-2.378 6-5c0-.489-.084-.96-.24-1.405c-.28-.79-.915-1.395-1.76-2.196l-.195-.187q-.307-.291-.63-.617c-1.643-1.66-2.403-3.78-2.613-5.957Z"
                                clip-rule="evenodd"
                            />
                            <path
                                fill="currentColor"
                                fill-rule="evenodd"
                                d="m13.073 15.351l.936 1.366l.015.02c.586.811.374 1.955-.439 2.492a1.62 1.62 0 0 1-1.798 0m1.286-3.878l-.027.053l-.018.035a3.95 3.95 0 0 1-1.286 1.471l-.143.098c-.296.204-.428.355-.48.475c-.147.334-.148.634-.055.9c.096.274.318.578.723.846m-.442-4.903c.034-.142.063-.326.098-.543q.03-.2.07-.432c.03-.166.07-.382.127-.554c.015-.048.039-.112.072-.181c.027-.057.092-.184.213-.307a1.027 1.027 0 0 1 1.586.144l2.141 3.123c1.235 1.72.806 4.152-.965 5.322a3.62 3.62 0 0 1-4.002 0c-.706-.466-1.244-1.1-1.509-1.855c-.268-.764-.23-1.588.11-2.363c.281-.64.792-1.053 1.18-1.32l.143-.098c.269-.185.487-.435.634-.726l.053-.103l.033-.07z"
                                clip-rule="evenodd"
                            />
                        </svg>
                        <div
                            class="text-4xl leading-none font-semibold text-white"
                        >
                            {planDaysCompleted}
                        </div>
                    </div>
                    <p class="text-xs text-white/50 mt-1">
                        days marked complete
                    </p>
                </div>
            </div>

            <!-- Footer note -->
            <div class="mt-4 p-3">
                <p class="text-xs text-white/55 mt-0.5">
                    Check-ins never reset • Plan days come from your daily plans
                    marked as completed
                </p>
            </div>
        </div>
    {:else}
        <div
            transition:fly={{
                y: -16,
                duration: 360,
                opacity: 0,
                easing: elasticOut,
            }}
            class="fixed top-[50vh] left-[50vw] -translate-x-1/2 -translate-y-1/2 z-70
             w-[92vw] max-w-md rounded-3xl shadow-2xl
             max-h-[calc(100vh-2rem)] overflow-y-auto bg-[#1e1e1e] backdrop-blur-xl text-white p-6"
        >
            <!-- Header row -->
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-4">
                    <h2
                        class="text-xl font-semibold font-manrope text-[var(--color-primary-green)]"
                    >
                        My Rhythm
                    </h2>
                    <div
                        class="h-9 w-9 rounded-full bg-neutral-400 flex items-center justify-center overflow-hidden"
                    >
                        <img
                            src={avatarSrc}
                            alt="User Avatar"
                            class="h-7 w-auto object-fill"
                            draggable="false"
                        />
                    </div>
                </div>

                <button
                    on:click={toggleEngagementModal}
                    class="p-2 rounded-full hover:bg-white/10 transition"
                    aria-label="Close"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 text-white/70"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>

            <!-- Cards -->
            <div class="grid grid-cols-2 gap-3">
                <!-- Days checked in (cumulative) -->
                <div class="rounded-2xl p-4 bg-white/5">
                    <div class="flex items-center gap-2 mb-2">
                        <p
                            class="text-[11px] uppercase tracking-wider text-white/55"
                        >
                            Days checked in
                        </p>
                    </div>
                    <div class="flex items-center gap-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-6 w-auto text-[var(--color-primary-green)]"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                        >
                            <path
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-miterlimit="10"
                                stroke-width="1.5"
                                d="m12.667 10.5l1.25-7.5L6 13h5l-1.25 7.5l7.917-10z"
                                clip-rule="evenodd"
                            />
                        </svg>
                        <div
                            class="text-4xl leading-none font-semibold text-white"
                        >
                            {daysOpened}
                        </div>
                    </div>
                    <p class="text-xs text-white/50 mt-1">
                        total unique days opened
                    </p>
                </div>

                <!-- Plan days completed -->
                <div class="rounded-2xl p-4 bg-white/5">
                    <div class="flex items-center gap-2 mb-2">
                        <p
                            class="text-[11px] uppercase tracking-wider text-white/55"
                        >
                            Plan days read
                        </p>
                    </div>
                    <div class="flex items-center gap-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-6 w-auto text-[var(--color-primary-green)]"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                        >
                            <path
                                fill="currentColor"
                                fill-rule="evenodd"
                                d="M14.243 2.514c.215.28.257.587.257.794c0 2.296.608 4.377 2.096 5.88a29 29 0 0 0 .827.802c.774.727 1.774 1.667 2.223 2.94c.23.654.354 1.35.354 2.07c0 4.005-3.732 7-8 7c-3.148 0-5.946-1.6-7.247-4.028A6.3 6.3 0 0 1 4 14.999v-.863c0-1.515.229-3.022.679-4.47c.097-.318.237-.702.485-.979c.141-.157.39-.362.757-.407c.377-.046.674.1.852.232c.299.221.48.559.576.746c.118.233.234.51.342.778c.117.289.284.565.492.823c.124.153.226.282.319.399l.19.239a1.16 1.16 0 0 0 .2-.548l.196-2.183c.102-1.143.312-2.41.784-3.552c.476-1.151 1.241-2.232 2.478-2.892c.22-.117.621-.308 1.061-.264c.271.027.596.15.832.456m-1.68 2.124c-.346.356-.622.806-.842 1.34c-.361.874-.547 1.913-.642 2.966l-.195 2.183c-.04.446-.175.878-.395 1.268c-.28.498-.743.96-1.358 1.131c-.692.192-1.395-.042-1.877-.628c-.098-.12-.217-.269-.339 - .422l-.287 - .36a6 6 0 0 1-.377 - .526A13 13 0 0 0 6 14.136V15c0 .72.182 1.405.516 2.029C7.428 18.73 9.498 20 12 20c3.464 0 6 - 2.378 6 - 5c0 - .489 - .084 - .96 - .24 - 1.405c - .28 - .79 - .915 - 1.395 - 1.76 - 2.196l - .195 - .187q - .307 - .291 - .63 - .617c - 1.643 - 1.66 - 2.403 - 3.78 - 2.613 - 5.957Z"
                                clip-rule="evenodd"
                            />
                            <path
                                fill="currentColor"
                                fill-rule="evenodd"
                                d="m13.073 15.351l.936 1.366l.015.02c.586.811.374 1.955-.439 2.492a1.62 1.62 0 0 1-1.798 0m1.286-3.878l-.027.053l-.018.035a3.95 3.95 0 0 1-1.286 1.471l-.143.098c-.296.204-.428.355-.48.475c-.147.334-.148.634-.055.9c.096.274.318.578.723.846m-.442-4.903c.034-.142.063-.326.098-.543q.03-.2.07-.432c.03-.166.07-.382.127-.554c.015-.048.039-.112.072-.181c.027-.057.092-.184.213-.307a1.027 1.027 0 0 1 1.586.144l2.141 3.123c1.235 1.72.806 4.152-.965 5.322a3.62 3.62 0 0 1-4.002 0c-.706-.466-1.244-1.1-1.509-1.855c-.268-.764-.23-1.588.11-2.363c.281-.64.792-1.053 1.18-1.32l.143-.098c.269-.185.487-.435.634-.726l.053-.103l.033-.07z"
                                clip-rule="evenodd"
                            />
                        </svg>
                        <div
                            class="text-4xl leading-none font-semibold text-white"
                        >
                            {planDaysCompleted}
                        </div>
                    </div>
                    <p class="text-xs text-white/50 mt-1">
                        days marked complete
                    </p>
                </div>
            </div>

            <!-- Footer note -->
            <div class="mt-4 p-3">
                <p class="text-xs text-white/55 mt-0.5">
                    Check-ins never reset • Plan days come from your daily plans
                    marked as completed
                </p>
            </div>
        </div>
    {/if}
{/if}
