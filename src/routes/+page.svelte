<script lang="ts">
  import MemoryVerse from "$lib/components/MemoryVerse.svelte";
  import CalendarCard from "$lib/components/CalendarCard.svelte";
  import ReadingPlan from "$lib/components/ReadingPlan.svelte";
    import AdditionalReading from "$lib/components/AdditionalReading.svelte";
</script>

<main class="space-y-4">
  <CalendarCard />
  <MemoryVerse />
  <ReadingPlan />
  <AdditionalReading />
</main>
