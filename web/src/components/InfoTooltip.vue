<script setup lang="ts">
defineProps<{ text: string; label?: string }>();
</script>

<template>
    <span class="group relative inline-flex align-middle">
        <button
            type="button"
            :aria-label="label ?? 'Mais informação'"
            class="grid h-4 w-4 cursor-help place-items-center rounded-full border border-soft/40 font-mono text-[10px] leading-none text-soft transition hover:border-brand hover:text-brand focus:ring-2 focus:ring-brand/40 focus:outline-none"
        >
            i
        </button>
        <span
            role="tooltip"
            class="pointer-events-none invisible absolute bottom-full left-1/2 z-30 mb-2 w-60 max-w-[70vw] -translate-x-1/2 rounded-xl border border-ink/10 bg-ink px-3 py-2 text-xs leading-relaxed text-white opacity-0 shadow-xl transition duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
        >
            {{ text }}
        </span>
    </span>
</template>
