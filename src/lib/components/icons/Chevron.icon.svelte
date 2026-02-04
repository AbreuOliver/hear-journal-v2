<script lang="ts">
	/**
	 * Chevron Icon
	 *
	 * Displays a calendar outline with an optional day-of-month number.
	 */
	export let size = 24;
	export let className = '';
    export let up: boolean = false;
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="0.5"
	stroke-linecap="round"
	stroke-linejoin="round"
	class={className}
      style="transform: rotate({up ? 270 : 90}deg); transition: transform 0.3s ease;"
	aria-hidden="true"
>
	<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 6l6 6l-6 6" />
</svg>