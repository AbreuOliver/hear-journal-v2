<script lang="ts">
  type PaddingSize = "none" | "sm" | "md" | "lg";

  export let bgColor: string = "#1E1E1E";
  export let padding: PaddingSize = "md";

  const paddingClasses: Record<PaddingSize, string> = {
    none: "0rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
  };
</script>

<div
  class="rounded-[20px] flex-col shadow-sm ring-1 ring-white/10 md:rounded-[28px] md:shadow-xl md:shadow-black/10"
  style={`background-color: ${bgColor}; padding: ${paddingClasses[padding]}`}
>
  <slot />
</div>
