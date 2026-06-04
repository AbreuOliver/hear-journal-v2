<script lang="ts">
  import MemoryVerse from "$lib/components/MemoryVerse.svelte";
  import CalendarCard from "$lib/components/CalendarCard.svelte";
  import ReadingPlan from "$lib/components/ReadingPlan.svelte";
</script>

<main class="mx-auto grid max-w-md gap-4 overflow-x-hidden px-4 pb-8 pt-0 md:max-w-6xl md:grid-cols-[minmax(20rem,0.85fr)_minmax(24rem,1.15fr)] md:gap-6 md:px-6 md:py-8 lg:px-8">
  <div class="md:col-span-2">
    <CalendarCard />
  </div>
  <div class="md:sticky md:top-28 md:self-start">
    <MemoryVerse />
  </div>
  <div>
    <ReadingPlan />
  </div>
  <!-- <AdditionalReading /> -->
</main>
