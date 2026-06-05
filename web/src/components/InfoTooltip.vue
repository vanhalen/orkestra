<script setup lang="ts">
import { ref, useTemplateRef } from "vue";

defineProps<{ text: string; label?: string }>();

const open = ref(false);
const pos = ref({ top: 0, left: 0 });
const trigger = useTemplateRef<HTMLButtonElement>("trigger");

const TOOLTIP_HALF = 128; // metade da largura (w-64 = 256px) para clamp nas bordas

function show() {
    const el = trigger.value;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const left = Math.min(
        Math.max(r.left + r.width / 2, TOOLTIP_HALF + 8),
        window.innerWidth - TOOLTIP_HALF - 8,
    );
    pos.value = { top: r.top - 8, left };
    open.value = true;
}
function hide() {
    open.value = false;
}
</script>

<template>
    <span class="inline-flex align-middle">
        <button
            ref="trigger"
            type="button"
            :aria-label="label ?? 'Mais informação'"
            class="grid h-4 w-4 cursor-help place-items-center rounded-full border border-soft/40 font-mono text-[10px] leading-none text-soft transition hover:border-gold hover:text-amber-700 focus:ring-2 focus:ring-gold/40 focus:outline-none"
            @mouseenter="show"
            @mouseleave="hide"
            @focus="show"
            @blur="hide"
        >
            i
        </button>

        <Teleport to="body">
            <Transition name="fade">
                <span
                    v-if="open"
                    role="tooltip"
                    class="pointer-events-none fixed z-50 w-64 max-w-[calc(100vw-1.5rem)] -translate-x-1/2 -translate-y-full rounded-xl border border-white/10 bg-ink px-3 py-2 text-xs leading-relaxed text-white shadow-2xl"
                    :style="{ top: `${pos.top}px`, left: `${pos.left}px` }"
                >
                    {{ text }}
                </span>
            </Transition>
        </Teleport>
    </span>
</template>
