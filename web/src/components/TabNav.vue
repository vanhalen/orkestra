<script setup lang="ts">
import type { TabId } from "../tabs";

defineProps<{ tabs: Array<{ id: TabId; label: string }> }>();
const active = defineModel<TabId>({ required: true });
</script>

<template>
    <nav
        class="inline-flex gap-1 rounded-2xl border border-line bg-card p-1 shadow-sm"
        role="tablist"
    >
        <button
            v-for="t in tabs"
            :key="t.id"
            role="tab"
            :aria-selected="active === t.id"
            class="rounded-xl px-3.5 py-2 text-sm font-medium transition sm:px-4"
            :class="
                active === t.id
                    ? 'bg-brand text-white shadow-sm'
                    : 'text-soft hover:bg-paper hover:text-ink'
            "
            @click="active = t.id"
        >
            {{ t.label }}
        </button>
    </nav>
</template>
