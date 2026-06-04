<script lang="ts">
    export let color: string = "currentColor";
    export let size: number = 12;
    export let up: boolean = false;
</script>

<svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    class="mr-0"
    style="transform: rotate({up
        ? 0
        : 180}deg); transition: transform 0.3s ease;"
>
    <path
        fill={color}
        d="M17 3.34A10 10 0 1 1 2 12l.005-.324A10 10 0 0 1 17 3.34m-4.293 5.953a1 1 0 0 0-1.414 0l-3 3A1 1 0 0 0 9 14h6c.217 0 .433-.07.613-.21l.094-.083a1 1 0 0 0 0-1.414z"
    />
</svg>
