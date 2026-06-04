<script lang="ts">
  import { slide } from "svelte/transition";
  import { userPreferences, type MeetingDay } from "$lib/stores/userPreferences.store";
  import { weekData } from "$lib/stores/weekData.store";
  
  import Calendar from "./icons/Calendar.icon.svelte";
  import Chevron from "./icons/Chevron.icon.svelte";
  import NarrowArrow from "$lib/components/icons/NarrowArrow.svelte";

  const daysOfWeek = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
  ];

  const cardPanelId = "plan-week-panel";
  
  let cardExpanded = false;
  let meetingExpanded = false;

  function toggleCardExpanded() {
    cardExpanded = !cardExpanded;
  }

  function toggleMeetingExpanded() {
    meetingExpanded = !meetingExpanded;
  }

  function changeMeetingDay(day: MeetingDay) {
    userPreferences.update((prefs) => ({ ...prefs, meetingDay: day }));
  }

  function changeWeek(delta: number) {
    userPreferences.update((prefs) => ({ 
      ...prefs, 
      weekOffset: prefs.weekOffset + delta 
    }));
  }

  function goToCurrentWeek() {
    userPreferences.update((prefs) => ({ ...prefs, weekOffset: 0 }));
  }

  function onHeaderKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleCardExpanded();
    }
  }
</script>

<!-- Calendar Card Header -->
<div class="w-screen px-6 -mx-4 border-y border-neutral-200 bg-white shadow-sm transition-colors flex items-center justify-center py-2.5 hover:bg-neutral-50 md:w-full md:mx-0 md:rounded-2xl md:border md:border-black/5 md:bg-white md:px-5 md:shadow-sm md:hover:rounded-2xl">
  <button
    class="flex items-center w-full cursor-pointer focus:outline-none"
    on:click={toggleCardExpanded}
    on:keydown={onHeaderKeydown}
    aria-expanded={cardExpanded}
    aria-controls={cardPanelId}
  >
    <div class="flex min-w-0 items-center text-black/60 text-md text-left py-2 gap-2 md:text-base">
      <Calendar size={24} className="pt-0 mr-1 text-[currentColor]" />
      <p class="font-manrope truncate">
        <span class="font-semibold text-black/70">Week {$weekData.currentWeek}</span>
        <span class="font-medium text-black/55"> • {$weekData.weekRangeString}</span>
      </p>
    </div>

    <Chevron up={cardExpanded} size={16} className="text-zinc-500 mt-1 ml-auto shrink-0" />
  </button>
</div>

<!-- Expanded Card Body -->
{#if cardExpanded}
  <div
    id={cardPanelId}
    class="w-screen -mx-4 -mt-4 px-6 py-8 border-b-2 border-neutral-200/25 bg-neutral-200/10 md:w-full md:mx-0 md:mt-3 md:rounded-3xl md:border md:border-black/5 md:bg-white/85 md:shadow-sm"
    transition:slide={{ duration: 300 }}
  >
    <div class="mb-3 grid w-full grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2">
      <button
        on:click={() => changeWeek(-1)}
        class="grid h-9 w-10 place-items-center rounded-2xl border border-neutral-300 bg-white/70 text-neutral-500 transition-colors hover:text-neutral-800"
        aria-label="Previous Week"
      >
        <NarrowArrow direction="right" size={24} color="currentColor" />
      </button>

      <h2 class="text-center text-[11px] uppercase font-inter font-semibold tracking-wide text-neutral-500">
        Viewing
        <span class="block">
          {#if $weekData.isCurrentWeek}
            Current Week
          {:else if $userPreferences.weekOffset < 0}
            {Math.abs($userPreferences.weekOffset)} Week{Math.abs($userPreferences.weekOffset) !== 1 ? "s" : ""} Ago
          {:else}
            {$userPreferences.weekOffset} Week{$userPreferences.weekOffset !== 1 ? "s" : ""} Ahead
          {/if}
        </span>
      </h2>

      <button
        on:click={() => changeWeek(1)}
        class="grid h-9 w-10 place-items-center rounded-2xl border border-neutral-300 bg-white/70 text-neutral-500 transition-colors hover:text-neutral-800"
        aria-label="Next Week"
      >
        <NarrowArrow direction="left" size={24} color="currentColor" />
      </button>
    </div>

    {#if !$weekData.isCurrentWeek}
      <button
        on:click={goToCurrentWeek}
        class="mx-auto mb-3 flex items-center px-3 py-1.5 text-xs rounded-2xl bg-[var(--color-primary-green)] text-white hover:opacity-80 transition-opacity"
        aria-label="Go to Current Week"
      >
        Back to Current Week
      </button>
    {/if}

    <!-- Meeting Day Section -->
    <div class="flex flex-col min-h-10 p-2.5 border border-neutral-300 rounded-[13px] bg-white/40">
      <button
        on:click={toggleMeetingExpanded}
        class="flex items-center w-full min-h-6.5 bg-transparent cursor-pointer"
        aria-expanded={meetingExpanded}
        aria-controls="calendar-edit"
      >
        <p class="font-manrope font-medium text-neutral-800 text-left">
          Current Meeting Day:
          <span class="ml-2 font-semibold text-[var(--color-primary-green)]">
            {daysOfWeek.find((d) => d.value === $userPreferences.meetingDay)?.label}
          </span>
        </p>

        <div class="ml-auto flex items-center">
          <Chevron
            up={meetingExpanded}
            size={16}
            className="text-zinc-500"
          />
        </div>
      </button>

      {#if meetingExpanded}
        <div
          id="calendar-edit"
          class="mt-3 p-3 rounded-[13px] bg-white/60"
          transition:slide={{ duration: 300 }}
        >
          <p class="mb-3 font-inter text-xs font-medium text-neutral-500">
            Select Meeting Day
          </p>

          <fieldset class="flex justify-between gap-1" aria-label="Select Meeting Day">
            {#each daysOfWeek as day}
              <label
                class="h-11 w-11 rounded-full border text-sm font-medium flex items-center justify-center cursor-pointer select-none transition
                {$userPreferences.meetingDay === day.value
                  ? 'border-[var(--color-primary-green)] bg-[var(--color-primary-green)] font-semibold text-[var(--color-text-primary)]'
                  : 'border-transparent text-neutral-600 hover:border-neutral-300 hover:text-neutral-900'}"
              >
                <input
                  type="radio"
                  name="meetingDay"
                  checked={$userPreferences.meetingDay === day.value}
                  class="sr-only"
                  on:change={() => changeMeetingDay(day.value as MeetingDay)}
                />
                {day.label.slice(0, 3)}
              </label>
            {/each}
          </fieldset>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  button:focus-visible {
    outline: 2px solid var(--color-primary-green);
    outline-offset: 2px;
  }
</style>
