<script lang="ts">
    import { onMount } from "svelte";
    import { engagement } from "$lib/stores/engagement.store";
    import { engagementMetrics } from "$lib/stores/engagementMetrics.store";
    import { fade, fly, scale } from "svelte/transition";
    import { elasticOut, cubicOut, cubicIn } from "svelte/easing";
    import { browser } from "$app/environment";
    import { trackEvent } from "$lib/utils/analytics";

    // ✅ NOT a streak — just cumulative unique days opened
    $: daysOpened = $engagement.totalOpenDays;

    // ✅ plan days completed (as you already have it)
    $: planDaysCompleted = $engagementMetrics.totalDaysCompleted;

    let engagementModalOpen = false;
    let avatarModalOpen = false;
    let avatarVisible = true;

    // iOS detection (Safari + iOS PWA)
    let isIOS = false;

    function toggleEngagementModal() {
        const willOpen = !engagementModalOpen;
        engagementModalOpen = willOpen;
        if (willOpen) avatarModalOpen = false;
        trackEvent(willOpen ? "rhythm-modal-open" : "rhythm-modal-close", {
            days_opened: Math.max(1, daysOpened),
            plan_days_completed: planDaysCompleted,
        });
    }

    function toggleAvatarModal() {
        const willOpen = !avatarModalOpen;
        avatarModalOpen = willOpen;
        if (willOpen) engagementModalOpen = false;
        trackEvent(willOpen ? "avatar-modal-open" : "avatar-modal-close", {
            avatar_visible: avatarVisible,
            custom_avatar: avatarSrc !== fallbackAvatar,
        });
    }

    function closeAvatarModal() {
        avatarModalOpen = false;
    }

    function handleWindowKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            engagementModalOpen = false;
            avatarModalOpen = false;
        }
    }

    const AVATAR_KEY = "hearjournal.avatar.dataurl";
    const AVATAR_VISIBLE_KEY = "hearjournal.avatar.visible";

    const fallbackAvatar =
        "https://ik.imagekit.io/bip1v395ybp/oliver-memoji_RMppMBYW_.png?updatedAt=1770330181441";

    let avatarSrc: string = fallbackAvatar;

    onMount(() => {
        const saved = localStorage.getItem(AVATAR_KEY);
        if (saved) avatarSrc = saved;
        avatarVisible = localStorage.getItem(AVATAR_VISIBLE_KEY) !== "false";

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
        avatarVisible = true;
        localStorage.setItem(AVATAR_VISIBLE_KEY, "true");
        avatarModalOpen = false;
        trackEvent("avatar-change");
    }

    function resetAvatar() {
        localStorage.removeItem(AVATAR_KEY);
        avatarSrc = fallbackAvatar;
        avatarVisible = true;
        localStorage.setItem(AVATAR_VISIBLE_KEY, "true");
        trackEvent("avatar-reset");
    }

    function openAvatarPicker() {
        trackEvent("avatar-picker-open");
        document.getElementById("avatarPicker")?.click();
    }

    function hideAvatar() {
        avatarVisible = false;
        localStorage.setItem(AVATAR_VISIBLE_KEY, "false");
        avatarModalOpen = false;
        trackEvent("avatar-hide");
    }

    function showAvatar() {
        avatarVisible = true;
        localStorage.setItem(AVATAR_VISIBLE_KEY, "true");
        avatarModalOpen = false;
        trackEvent("avatar-show");
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
        <!-- Title -->
        <h1
            class="font-manrope text-[1.35rem] md:text-[1.5rem] font-bold text-[var(--color-primary-green)] select-none cursor-default"
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

            <!-- Avatar settings -->
            <div class="relative">
                <input
                    id="avatarPicker"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    on:change={onAvatarPicked}
                />

                {#if avatarVisible}
                    <button
                        type="button"
                        class="relative h-9 w-9 rounded-full bg-[var(--color-primary-green)] flex items-center justify-center overflow-visible"
                        aria-label="Open avatar settings"
                        on:click={toggleAvatarModal}
                    >
                        <span
                            class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full"
                        >
                            <img
                                src={avatarSrc}
                                alt="User Avatar"
                                class={avatarSrc === fallbackAvatar
                                    ? "h-7 w-auto"
                                    : "h-full w-full object-cover"}
                                draggable="false"
                            />
                        </span>

                        {#if avatarSrc === fallbackAvatar}
                            <span
                                class="absolute -bottom-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-sm"
                                aria-hidden="true"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-3.5 w-3.5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <path
                                        d="M14.5 4h-5L8 6H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3z"
                                    />
                                    <circle cx="12" cy="13" r="3" />
                                </svg>
                            </span>
                        {/if}
                    </button>
                {:else}
                    <button
                        type="button"
                        class="grid h-9 w-9 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-800"
                        aria-label="Open avatar settings"
                        on:click={toggleAvatarModal}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            aria-hidden="true"
                        >
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 21a8 8 0 0 1 16 0" />
                        </svg>
                    </button>
                {/if}
            </div>
        </div>
    </div>
</header>

{#if avatarModalOpen}
    {#if isIOS}
        <button
            type="button"
            class="fixed inset-0 z-60 bg-black/55"
            on:click={closeAvatarModal}
            aria-label="Close avatar modal"
            in:fade={{ duration: 120 }}
            out:fade={{ duration: 120 }}
        ></button>
    {:else}
        <button
            type="button"
            transition:fade={{ duration: 160 }}
            class="fixed inset-0 z-[60] bg-black/55 backdrop-blur-[4px]"
            on:click={closeAvatarModal}
            aria-label="Close avatar modal"
        ></button>
    {/if}

    <div
        class="fixed top-[50vh] left-[50vw] -translate-x-1/2 -translate-y-1/2 z-[70]
             w-[92vw] max-w-md rounded-3xl shadow-2xl
             max-h-[calc(100vh-2rem)] overflow-y-auto bg-[#1e1e1e] text-white p-6"
        in:scale={{ start: 0.98, duration: 140, easing: cubicOut, opacity: 0 }}
        out:scale={{ start: 0.98, duration: 120, easing: cubicIn, opacity: 0 }}
    >
        <div class="mb-6 flex items-center justify-between">
            <div class="flex items-center gap-4">
                <h2
                    class="text-xl font-semibold font-manrope text-[var(--color-primary-green)]"
                >
                    Avatar
                </h2>
                <div
                    class="h-12 w-12 rounded-full bg-[var(--color-primary-green)] flex items-center justify-center overflow-hidden"
                    class:bg-neutral-700={!avatarVisible}
                >
                    {#if avatarVisible}
                        <img
                            src={avatarSrc}
                            alt="User Avatar"
                            class={avatarSrc === fallbackAvatar
                                ? "h-10 w-auto"
                                : "h-full w-full object-cover"}
                            draggable="false"
                        />
                    {:else}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-7 w-7 text-white/70"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            aria-hidden="true"
                        >
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 21a8 8 0 0 1 16 0" />
                        </svg>
                    {/if}
                </div>
            </div>

            <button
                on:click={closeAvatarModal}
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

        <div class="space-y-3">
            <button
                type="button"
                class="flex w-full items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-left font-manrope text-white transition hover:bg-white/10"
                on:click={openAvatarPicker}
            >
                <span>Upload picture</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-[var(--color-primary-green)]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                >
                    <path
                        d="M14.5 4h-5L8 6H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3z"
                    />
                    <circle cx="12" cy="13" r="3" />
                </svg>
            </button>

            <button
                type="button"
                class="flex w-full items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-left font-manrope text-white transition hover:bg-white/10"
                on:click={resetAvatar}
            >
                <span>Reset to default</span>
                <span class="text-lg leading-none text-white/55">↺</span>
            </button>

            {#if avatarVisible}
                <button
                    type="button"
                    class="flex w-full items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-left font-manrope text-white transition hover:bg-white/10"
                    on:click={hideAvatar}
                >
                    <span>Hide avatar</span>
                    <span class="text-white/55">−</span>
                </button>
            {:else}
                <button
                    type="button"
                    class="flex w-full items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-left font-manrope text-white transition hover:bg-white/10"
                    on:click={showAvatar}
                >
                    <span>Show avatar</span>
                    <span class="text-[var(--color-primary-green)]">+</span>
                </button>
            {/if}
        </div>
    </div>
{/if}

{#if engagementModalOpen}
    <!-- Backdrop -->
    {#if isIOS}
        <button
            type="button"
            class="fixed inset-0 z-60 bg-black/55"
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
                            class={avatarSrc === fallbackAvatar
                                ? "h-7 w-auto"
                                : "h-full w-full object-cover"}
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
                                d="M12.1 22c-4.1 0-7.1-2.8-7.1-6.8c0-2.7 1.5-5.2 3.3-7.2c.2-.2.6-.1.7.2c.3 1.2.9 2.2 1.8 2.8c-.1-2.8 1.2-5.8 4.3-8.7c.2-.2.6-.1.7.2c.5 2.2 1.6 3.8 3 5.4c1.3 1.5 2.2 3.4 2.2 5.7c0 4.9-3.8 8.4-8.9 8.4Zm.3-2.1c2 0 3.6-1.4 3.6-3.4c0-1.5-.8-2.6-1.8-3.5c-.2 1.2-.8 2.1-1.7 2.8c-.2-1.5-.9-2.8-2-3.8c-.9 1.2-1.5 2.6-1.5 4c0 2.3 1.5 3.9 3.4 3.9Z"
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
                            class={avatarSrc === fallbackAvatar
                                ? "h-7 w-auto"
                                : "h-full w-full object-cover"}
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
                                d="M12.1 22c-4.1 0-7.1-2.8-7.1-6.8c0-2.7 1.5-5.2 3.3-7.2c.2-.2.6-.1.7.2c.3 1.2.9 2.2 1.8 2.8c-.1-2.8 1.2-5.8 4.3-8.7c.2-.2.6-.1.7.2c.5 2.2 1.6 3.8 3 5.4c1.3 1.5 2.2 3.4 2.2 5.7c0 4.9-3.8 8.4-8.9 8.4Zm.3-2.1c2 0 3.6-1.4 3.6-3.4c0-1.5-.8-2.6-1.8-3.5c-.2 1.2-.8 2.1-1.7 2.8c-.2-1.5-.9-2.8-2-3.8c-.9 1.2-1.5 2.6-1.5 4c0 2.3 1.5 3.9 3.4 3.9Z"
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
