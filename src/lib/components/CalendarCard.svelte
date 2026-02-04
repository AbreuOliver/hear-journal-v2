<script lang="ts">
  /* ------------------------------ Svelte ---------------------------------- */
  import { slide } from "svelte/transition";

  /* ------------------------------ Stores ---------------------------------- */
  import {
    userPreferences,
    type MeetingDay,
  } from "$lib/stores/userPreferences.store";

  /* ------------------------------ Utils ----------------------------------- */
  import { getWeekOfYear, getWeekRange } from "$lib/utils/calculateWeek";
  import { getReadingPlan } from "$lib/utils/getPlanData";

  /* ---------------------------- Components -------------------------------- */
  import ArrowDown from "$lib/components/icons/ArrowDown.svelte";
  import Calendar from "./icons/Calendar.icon.svelte";
  import Chevron from "./icons/Chevron.icon.svelte";
  import NarrowArrow from "$lib/components/icons/NarrowArrow.svelte";

  /* ----------------------------- Constants -------------------------------- */
  const today = new Date();

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

  /* -------------------------- Store bindings ------------------------------ */
  $: selectedPlan = $userPreferences.readingPlan;
  $: meetingDay = $userPreferences.meetingDay;
  $: weekOffset = $userPreferences.weekOffset;

  /* ------------------------- Derived date logic ---------------------------- */
  $: displayDate = (() => {
    const d = new Date(today);
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  })();

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
  $: isCurrentWeek = weekOffset === 0;
  $: reading = getReadingPlan(currentWeek, selectedPlan);

  /* ------------------------------ UI state -------------------------------- */
  let cardExpanded = false;
  let meetingExpanded = false;

  /* ----------------------------- Handlers --------------------------------- */
  function toggleCardExpanded() {
    cardExpanded = !cardExpanded;
  }

  function toggleMeetingExpanded() {
    meetingExpanded = !meetingExpanded;
  }

  function changeMeetingDay(day: MeetingDay) {
    userPreferences.update((prefs) => ({
      ...prefs,
      meetingDay: day,
    }));
  }

  function changeWeek(delta: number) {
    userPreferences.update((prefs) => ({
      ...prefs,
      weekOffset: prefs.weekOffset + delta,
    }));
  }

  function goToCurrentWeek() {
    userPreferences.update((prefs) => ({
      ...prefs,
      weekOffset: 0,
    }));
  }

  function onHeaderKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleCardExpanded();
    }
  }
</script>



<!-- =========================
     Calendar Card Header
========================= -->
<div class="w-screen px-6 -mx-4 border-y-[2px] border-neutral-200/25 flex items-center justify-center py-2.5">
  <button
    class="flex items-center w-full cursor-pointer focus:outline-none"
    on:click={toggleCardExpanded}
    on:keydown={onHeaderKeydown}
    aria-expanded={cardExpanded}
    aria-controls={cardPanelId}
  >
    <!-- Left content -->
    <div class="flex items-center text-black/60 text-md text-left mr-6 py-2 gap-2">
      <Calendar
        size={24}
        className="pt-0 mr-2 text-[currentColor]"
      />
      <p class="font-manrope font-medium">
        Week {currentWeek} • {weekRangeString}
      </p>
    </div>

    <!-- Chevron -->
    <Chevron
      up={cardExpanded}
      size={16}
      className="text-zinc-500 mt-1 mr-auto"
    />
  </button>
</div>

<!-- =========================
     Expanded Card Body
========================= -->
{#if cardExpanded}
  <div
    id={cardPanelId}
    class="w-screen -mx-4 -mt-4 px-6 py-8 border-b-2 border-neutral-200/25 bg-neutral-200/10"
    transition:slide={{ duration: 300 }}
  >
    <!-- =====================
         Week Context + Nav
    ====================== -->
    <div class="flex w-full items-center mb-2">
      <h2 class="pl-1 text-xs uppercase font-inter font-medium text-[var(--color-text-secondary)]">
        Viewing<br />

        {#if isCurrentWeek}
          Current Week
        {:else if weekOffset < 0}
          {Math.abs(weekOffset)} Week{Math.abs(weekOffset) !== 1 ? "s" : ""} Ago
        {:else}
          {weekOffset} Week{weekOffset !== 1 ? "s" : ""} Ahead
        {/if}
      </h2>

      <!-- Navigation -->
      <div class="flex items-center gap-1 ml-auto">
        {#if !isCurrentWeek}
          <button
            on:click={goToCurrentWeek}
            class="flex items-center px-3 py-1.5 text-xs rounded-2xl bg-[var(--color-primary-green)] text-white hover:opacity-80 transition-opacity"
            aria-label="Go to Current Week"
          >
            Back to Current Week
          </button>
        {/if}

        <div class="flex items-center border border-neutral-300 rounded-2xl">
          <button
            on:click={() => changeWeek(-1)}
            class="p-1 rounded hover:text-[var(--color-primary-green)] transition-colors"
            aria-label="Previous Week"
          >
            <NarrowArrow
              direction="right"
              size={24}
              color="var(--color-text-muted)"
            />
          </button>

          <button
            on:click={() => changeWeek(1)}
            class="p-1 rounded hover:text-[var(--color-primary-green)] transition-colors"
            aria-label="Next Week"
          >
            <NarrowArrow
              direction="left"
              size={24}
              color="var(--color-text-muted)"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- =====================
         Meeting Day Section
    ====================== -->
    <div class="flex flex-col min-h-10 p-2.5 border border-[#CDCFCE] rounded-[13px]">
      <!-- Accordion trigger -->
      <button
        on:click={toggleMeetingExpanded}
        class="flex items-center w-full min-h-6.5 bg-transparent cursor-pointer"
        aria-expanded={meetingExpanded}
        aria-controls="calendar-edit"
      >
        <p class="font-manrope font-semibold text-[var(--color-text-primary)] text-left">
          Current Meeting Day:
          <span class="ml-2 text-[var(--color-primary-green)]">
            {daysOfWeek.find((d) => d.value === meetingDay)?.label}
          </span>
        </p>

        <div class="flex items-center ml-auto">
          <ArrowDown
            up={meetingExpanded}
            size={28}
            color={meetingExpanded
              ? "var(--color-primary-green)"
              : "var(--color-text-muted)"}
          />
        </div>
      </button>

      <!-- Accordion panel -->
      {#if meetingExpanded}
        <div
          id="calendar-edit"
          class="mt-3 p-3 rounded-[13px] bg-neutral-100"
          transition:slide={{ duration: 300 }}
        >
          <p class="mb-3 font-inter font-medium tracking-tight text-[var(--color-text-muted)] text-sm">
            Select Meeting Day
          </p>

          <fieldset
            class="-ml-2 flex justify-between"
            aria-label="Select Meeting Day"
          >
            {#each daysOfWeek as day}
              <label
                class="flex-1 max-w-[calc(100%/7)] h-11 px-2 py-1 rounded-[3rem] border text-sm font-medium flex items-center justify-center cursor-pointer select-none transition
                {meetingDay === day.value
                  ? 'border-[var(--color-primary-green)] bg-[var(--color-primary-green)] text-[var(--color-text-primary)]'
                  : 'border-transparent text-[var(--color-text-secondary)] hover:border-[var(--color-text-muted)]'}"
              >
                <input
                  type="radio"
                  name="meetingDay"
                  checked={meetingDay === day.value}
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
  /* Optional: focus ring for header/meeting buttons */
  button:focus-visible {
    outline: 2px solid var(--color-primary-green);
    outline-offset: 2px;
  }
</style>
