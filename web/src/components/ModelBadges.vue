<script setup lang="ts">
import type { OrkModel } from "../api";

defineProps<{ model: OrkModel }>();

const CAPS: Array<{ key: string; label: string }> = [
    { key: "file", label: "PDF" },
    { key: "image", label: "imagem" },
    { key: "json", label: "JSON" },
    { key: "tools", label: "tools" },
    { key: "web", label: "web" },
];
</script>

<template>
    <div class="flex flex-wrap gap-1">
        <span
            v-if="model.pricing.prompt === 0 && model.pricing.completion === 0"
            class="rounded bg-emerald-900/60 px-1.5 py-0.5 text-xs text-emerald-300"
        >
            grátis
        </span>
        <span
            v-for="c in CAPS.filter((c) => model.capabilities[c.key])"
            :key="c.key"
            class="rounded bg-slate-700 px-1.5 py-0.5 text-xs text-slate-300"
        >
            {{ c.label }}
        </span>
    </div>
</template>
