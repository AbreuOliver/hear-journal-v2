<script lang="ts">
  import SectionCard from "$lib/components/SectionCard.svelte";
  import EyeOpen from "./icons/EyeOpen.svelte";
  import EyeClosed from "./icons/EyeClosed.svelte";
  import { userPreferences } from "$lib/stores/userPreferences.store";
  import kjv from "$lib/data/kjv.json";
  import { getWeekOfYear } from "$lib/utils/calculateWeek";
  import { getReadingPlan } from "$lib/utils/getPlanData";

  let revealed = false;
  function toggleReveal() {
    revealed = !revealed;
  }

  // Read values directly from store
  $: selectedPlan = $userPreferences.readingPlan;
  $: meetingDay = $userPreferences.meetingDay;
  $: weekOffset = $userPreferences.weekOffset;

  // Compute currentWeek whenever meetingDay or weekOffset changes
  $: {
    const today = new Date();
    const displayDate = new Date(today);
    displayDate.setDate(displayDate.getDate() + weekOffset * 7);
    currentWeek = getWeekOfYear(displayDate, meetingDay);
  }

  let currentWeek: number;

  // Load reading plan data whenever currentWeek or selectedPlan changes
  $: readingPlanData = selectedPlan
    ? getReadingPlan(currentWeek, selectedPlan)
    : null;

  // Expand memory verses into displayable text
  function expandVerseRange(ref: string): string[] {
    const rangeRegex = /^(.+?) (\d+):(\d+)(-(\d+))?$/;
    const match = ref.match(rangeRegex);
    if (!match) return [ref];
    const book = match[1];
    const chapter = match[2];
    const startVerse = parseInt(match[3]);
    const endVerse = match[5] ? parseInt(match[5]) : startVerse;

    const verses = [];
    for (let v = startVerse; v <= endVerse; v++) {
      verses.push(`${book} ${chapter}:${v}`);
    }
    return verses;
  }

  function formatVerseText(refs: string | string[]): string {
    if (!refs) return "";
    const arrayRefs = Array.isArray(refs) ? refs : [refs];
    return arrayRefs
      .map((ref) => {
        const expanded = expandVerseRange(ref);
        return expanded
          .map((key) => kjv[key] ?? "")
          .filter(Boolean)
          .map((text) =>
            text.replace(/#/g, "\n").replace(/\[([^\]]+)\]/g, "$1")
          )
          .join(" ");
      })
      .filter(Boolean)
      .join(" ");
  }

  // Compute memory verses display whenever readingPlanData changes
  $: memoryVersesData = readingPlanData?.memoryVerses
    ? {
        refs: readingPlanData.memoryVerses,
        verseText: formatVerseText(readingPlanData.memoryVerses),
      }
    : { refs: "", verseText: "" };

  $: memoryVerseDisplay = memoryVersesData.refs;
  $: verseText = memoryVersesData.verseText;
</script>

<!-- <SectionCard padding="lg"> -->
 <SectionCard padding="none">
  <div class="flex flex-col items-start justify-start px-6 pt-6 pb-4">
    <h2
      class="pl-1 text-[13px] uppercase font-inter font-medium mb-0 text-[var(--color-text-muted)]"
    >
  <!-- <h2
    class="pl-1 text-[13px] uppercase font-inter font-medium mb-1 text-[var(--color-text-muted)]"
  > -->
    Memory Verse
  </h2>
  </div>
  <div class="px-6 pb-6 flex flex-col">
  <p class="font-manrope text-2xl grow-1 font-semibold text-white">
    {Array.isArray(memoryVerseDisplay)
      ? memoryVerseDisplay.join(", ")
      : memoryVerseDisplay}
  </p>

  <div class="min-h-10 pt-7 pb-8 relative">
    <p
      class="font-manrope text-lg/6 pl-0.5 text-[var(--color-text-muted)] transition-filter duration-300 whitespace-pre-line"
      class:blur-sm={!revealed}
      aria-label="Memory verse text"
    >
      {@html verseText || "No verse text available."}
    </p>
  </div>

  <button
    on:click={toggleReveal}
    class="flex items-center py-0.5 px-3 rounded-2xl min-h-9 cursor-pointer bg-[var(--color-primary-green)] mt-2 ml-auto"
    aria-pressed={revealed}
  >
    <div class="flex items-center mt-0.5">
      {#if revealed}
        <EyeClosed color="#1E1E1E" size={16} />
      {:else}
        <EyeOpen color="#1E1E1E" size={16} />
      {/if}
    </div>
    <p class="font-manrope text-sm pr-2 py-1">
      {revealed ? "Hide Verse" : "Show Verse"}
    </p>
  </button>
  </div>
</SectionCard>
