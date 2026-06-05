<script setup lang="ts">
import type { TabId, TabMeta } from "../tabs";

defineProps<{ tabs: TabMeta[] }>();
const active = defineModel<TabId>({ required: true });
</script>

<template>
    <nav
        class="flex w-full gap-1 rounded-2xl border border-line bg-card p-1 shadow-sm"
        role="tablist"
    >
        <button
            v-for="t in tabs"
            :key="t.id"
            role="tab"
            :aria-selected="active === t.id"
            class="flex-1 rounded-xl px-2 py-2.5 text-center text-sm font-medium whitespace-nowrap transition"
            :class="
                active === t.id
                    ? 'bg-gold text-ink shadow-sm'
                    : 'text-soft hover:bg-paper hover:text-ink'
            "
            @click="active = t.id"
        >
            {{ t.label }}
        </button>
    </nav>
</template>
