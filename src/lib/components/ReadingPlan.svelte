<script lang="ts">
    import { onMount } from "svelte";
    import { userPreferences } from "$lib/stores/userPreferences.store";
    import { getWeekOfYear, getWeekRange } from "$lib/utils/calculateWeek";
    import { getReadingPlan } from "$lib/utils/getPlanData";
    import { toBibleLink } from "$lib/utils/youVersionBibleLinkCreator";
    import SectionCard from "$lib/components/SectionCard.svelte";

    const today = new Date();

    // Store subscriptions - now including weekOffset
    $: meetingDay = $userPreferences.meetingDay;
    $: selectedPlan = $userPreferences.readingPlan;
    $: weekOffset = $userPreferences.weekOffset;

    // Calculate displayDate based on weekOffset
    $: {
        const d = new Date(today);
        d.setDate(d.getDate() + weekOffset * 7);
        displayDate = d;
    }
    let displayDate: Date;

    // Week calculation using displayDate instead of today
    $: currentWeek = getWeekOfYear(displayDate, meetingDay);
    $: ({ start, end } = getWeekRange(displayDate, meetingDay));

    function formatDate(date: Date) {
        return date.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    }

    $: weekRangeString = `${formatDate(start)} - ${formatDate(end)}`;

    // Load reading plan for the displayed week
    $: reading = getReadingPlan(currentWeek, selectedPlan);

    // Check if we're viewing the current week
    $: isCurrentWeek = weekOffset === 0;

    // Completion array stored locally after mount
    let allCompleted: boolean[] = [];

    function storageKey() {
        return `plan:${selectedPlan}:week:${currentWeek}`;
    }

    // Load completed days from localStorage (only client)
    function loadCompletedDays() {
        if (typeof localStorage === "undefined") {
            // Not in browser, return default
            return Array(reading?.plan?.length || 0).fill(false);
        }
        const key = storageKey();
        const stored = localStorage.getItem(key);
        if (stored) {
            return JSON.parse(stored);
        }
        return Array(reading?.plan?.length || 0).fill(false);
    }

    // Save completed days to localStorage (only client)
    function saveCompletedDays() {
        if (typeof localStorage === "undefined") return;
        const key = storageKey();
        localStorage.setItem(key, JSON.stringify(allCompleted));
    }

    function toggleDayCompletion(index: number) {
        allCompleted[index] = !allCompleted[index];
        saveCompletedDays();

        userPreferences.update((prefs) => {
            const weekKey = `Week ${currentWeek}, Day ${index + 1}, Plan ${selectedPlan}`;
            const exists = prefs.completedDays.includes(weekKey);
            return {
                ...prefs,
                completedDays: exists
                    ? prefs.completedDays.filter((d) => d !== weekKey)
                    : [...prefs.completedDays, weekKey],
            };
        });
    }

    // Load completion data only on client mount
    onMount(() => {
        allCompleted = loadCompletedDays();
    });

    // When week or plan changes, reload completion data (only client)
    $: if (reading?.plan && typeof localStorage !== "undefined") {
        allCompleted = loadCompletedDays();
    }

    // Completion percentage (0–1)
    $: completionPercent = reading?.plan?.length
        ? allCompleted.filter(Boolean).length / reading.plan.length
        : 0;

    // Circle geometry
    const radius = 10;
    const circumference = 2 * Math.PI * radius;

    $: dashOffset = circumference * (1 - completionPercent);

    // Precompute 5-day grouped passages
    $: groupedPassages = reading?.plan
        ? Array.from({ length: 5 }, (_, dayIndex) => {
              const chunkSize = Math.ceil(reading.plan.length / 5);
              const start = dayIndex * chunkSize;
              return reading.plan.slice(start, start + chunkSize);
          })
        : [];

    // Ensure completion state matches grouped days
    $: if (
        groupedPassages.length > 0 &&
        allCompleted.length !== groupedPassages.length
    ) {
        allCompleted = Array(groupedPassages.length).fill(false);
    }

    $: nextReadingIndex = allCompleted.findIndex((completed) => !completed);
</script>

<SectionCard padding="none">
    <div class="flex items-center justify-between p-6">
        <h2
            class="pl-1 text-[13px] uppercase font-inter font-medium mb-0 text-[var(--color-text-muted)]"
        >
            Bible Reading
        </h2>
        <div class="flex">
            <p class="text-[var(--color-text-secondary)] pr-2">
                <span
                    class:text-[var(--color-primary-green)]={completionPercent ===
                        1}
                >
                    {completionPercent * 100}%
                </span>
            </p>

            <!-- Animated circular progress -->
            <svg class="w-6 h-6" viewBox="0 0 24 24">
                <!-- Background track -->
                <circle
                    cx="12"
                    cy="12"
                    r={radius}
                    stroke="var(--color-text-muted)"
                    stroke-width="2"
                    fill="none"
                    opacity="0.3"
                />
                <!-- Foreground progress -->
                <circle
                    cx="12"
                    cy="12"
                    r={radius}
                    stroke="var(--color-primary-green)"
                    stroke-width="2"
                    fill="none"
                    stroke-linecap="round"
                    stroke-dasharray={circumference}
                    stroke-dashoffset={dashOffset}
                    style="transition: stroke-dashoffset 0.4s ease;"
                />
            </svg>
        </div>
    </div>
    <div class="px-6">
        <p
            class="font-manrope text-2xl text-left font-semibold text-white mb-3"
        >
            {#if isCurrentWeek}
                Today <span class="text-[var(--color-text-muted)]">•</span>
            {:else}
                Viewing <span class="text-[var(--color-primary-green)]"
                    >Week {currentWeek}</span
                >
            {/if}

            <span class="date text-[var(--color-text-muted)]">
                {isCurrentWeek ? formatDate(new Date()) : weekRangeString}
            </span>
        </p>
    </div>
    <div
        class="w-full flex items-center justify-center bg-(--color-text-secondary) h-0.5 my-6"
    ></div>
    <div class="min-h-10 flex-col justify-start text-left px-4 space-y-4 pb-6">
        {#if groupedPassages.length}
            {#each groupedPassages as passages, dayIndex}
                <div
                    class={`flex items-center gap-2 w-full flex-1 rounded-full px-2 py-1 transition-colors md:hover:bg-white/5 ${
                        dayIndex === nextReadingIndex ? "bg-white/5" : ""
                    }`}
                >
                    <div
                        class={`flex flex-col items-center justify-center w-14 h-14 rounded-full bg-[#252525] transition-opacity ${
                            allCompleted[dayIndex] ? "opacity-45" : ""
                        }`}
                    >
                        <span class="text-[12px] font-inter text-neutral-400"
                            >Day</span
                        >
                        <span
                            class="text-md font-inter font-normal text-neutral-50"
                        >
                            {dayIndex + 1}
                        </span>
                    </div>
                    <p
                        class="font-app-sans text-lg leading-7 flex-1 pl-2 transition-colors"
                    >
                        <!-- {#each passages as passage, i}
              {passage}
              {#if i < passages.length - 1}
                <span class="text-[var(--color-primary-green)] pl-1 pr-2"
                  >&amp;</span
                >
              {/if}
            {/each} -->
                        {#each passages as passage, i}
                            <a
                                href={toBibleLink(passage)}
                                target="_blank"
                                rel="noopener noreferrer"
                                class={`inline-flex items-center gap-1 rounded-sm transition-colors hover:text-[var(--color-primary-green)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-green)] ${
                                    dayIndex === nextReadingIndex
                                        ? "text-[var(--color-primary-green)]"
                                        : allCompleted[dayIndex]
                                          ? "text-neutral-600"
                                          : "text-[var(--color-text-muted)]"
                                }`}
                                aria-label={`Open ${passage} on bible.com (opens in new tab)`}
                                title={`Open ${passage} on bible.com`}
                            >
                                <span>{passage}</span>
                                <!-- external icon -->
                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                    class="w-4 h-4 opacity-70 group-hover:opacity-100"
                                >
                                    <path
                                        fill="currentColor"
                                        d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3ZM5 5h6v2H7v10h10v-4h2v6H5V5Z"
                                    />
                                </svg>
                            </a>

                            {#if i < passages.length - 1}
                                <span
                                    class={`px-2 ${
                                        dayIndex === nextReadingIndex
                                            ? "text-[var(--color-primary-green)]"
                                            : allCompleted[dayIndex]
                                              ? "text-neutral-700"
                                              : "text-[var(--color-text-muted)]"
                                    }`}>&amp;</span
                                >
                            {/if}
                        {/each}
                    </p>

                    {#if allCompleted[dayIndex]}
                        <button
                            on:click={() => toggleDayCompletion(dayIndex)}
                            aria-label={`Mark Week ${currentWeek} Day ${dayIndex + 1} as incomplete`}
                            class="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-primary-green)] border-[var(--color-primary-green)] text-white"
                        >
                            <svg
                                viewBox="0 0 20 20"
                                class="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <path
                                    d="M4 10l3 3 9-9"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>
                        </button>
                    {:else}
                        <button
                            on:click={() => toggleDayCompletion(dayIndex)}
                            aria-label={`Mark Week ${currentWeek} Day ${dayIndex + 1} as complete`}
                            class="flex items-center justify-center w-12 h-12 rounded-full border border-[var(--color-primary-green)]/50 bg-transparent"
                        >
                        </button>
                    {/if}
                </div>
            {/each}
        {:else}
            <p class="font-manrope text-[var(--color-text-muted)]">
                No reading plan available.
            </p>
        {/if}
    </div>
</SectionCard>

<style>
    span.date {
        display: inline-block;
        margin-left: 0px;
    }
</style>
