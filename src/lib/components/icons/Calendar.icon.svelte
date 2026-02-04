<!-- src/lib/ui/icons/Calendar.icon.svelte -->
<script lang="ts">
	/**
	 * Calendar Icon
	 *
	 * Displays a calendar outline with an optional day-of-month number.
	 */
	export let size = 24;
	export let day: number | null = null;
	export let className = '';
</script>



<svg
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="0.25"
	stroke-linecap="round"
	stroke-linejoin="round"
	class={className}
	aria-hidden="true"
>
	<g fill="currentColor">
		<path
			d="M16 2a1 1 0 0 1 .993.883L17 3v1h1a3 3 0 0 1 2.995 2.824L21 7v12a3 3 0 0 1-2.824 2.995L18 22H6a3 3 0 0 1-2.995-2.824L3 19V7a3 3 0 0 1 2.824-2.995L6 4h1V3a1 1 0 0 1 1.993-.117L9 3v1h6V3a1 1 0 0 1 1-1m3 7H5v9.625c0 .705.386 1.286.883 1.366L6 20h12c.513 0 .936-.53.993-1.215l.007-.16z"
		/>
		<!-- <path d="M12 12a1 1 0 0 1 .993.883L13 13v3a1 1 0 0 1-1.993.117L11 16v-2a1 1 0 0 1-.117-1.993L11 12z" /> -->
		{#if day !== null}
			<text
				x="12"
				y="17.5"
				text-anchor="middle"
				class="text-[.5rem]"
				font-weight="600"
				fill="currentColor"
				style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto;"
			>
				{day}
			</text>
		{/if}
	</g>
</svg>
