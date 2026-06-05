<script setup lang="ts">
import { computed, ref } from "vue";
import type { CompareResult } from "../../api";

const props = defineProps<{ result: CompareResult | null; loading: boolean }>();

type SortBy = "latency" | "cost" | "default";
const sortBy = ref<SortBy>("latency");

const ordered = computed(() => {
    const items = props.result?.results ?? [];
    if (sortBy.value === "default") return items;
    return [...items].sort((a, b) => {
        // respostas com erro sempre por último
        const ae = a.error ? 1 : 0;
        const be = b.error ? 1 : 0;
        if (ae !== be) return ae - be;
        if (sortBy.value === "cost") return a.costUsd - b.costUsd;
        return a.latencyMs - b.latencyMs;
    });
});
</script>

<template>
    <div class="space-y-3">
        <p v-if="loading" class="text-sm text-soft">Consultando os modelos em paralelo…</p>

        <div
            v-if="!result && !loading"
            class="grid place-items-center rounded-2xl border border-dashed border-line bg-card/50 p-10 text-center"
        >
            <img src="/orkestra-emblem.svg" alt="" class="mb-3 h-10 w-10 opacity-30" />
            <p class="text-sm text-soft">
                As respostas aparecem aqui, lado a lado, com latência e custo.
            </p>
        </div>

        <div v-if="result" class="flex items-center justify-between">
            <p class="kicker">{{ ordered.length }} respostas</p>
            <label class="flex items-center gap-1.5">
                <span class="kicker">ordenar</span>
                <select
                    v-model="sortBy"
                    class="rounded-lg border border-line bg-paper px-2 py-1 text-xs text-ink outline-none focus:border-gold"
                >
                    <option value="latency">mais rápido</option>
                    <option value="cost">mais barato</option>
                    <option value="default">ordem de seleção</option>
                </select>
            </label>
        </div>

        <article
            v-for="r in ordered"
            :key="r.model"
            class="rise lift rounded-2xl border bg-card p-4 shadow-sm"
            :class="r.error ? 'border-red-200' : 'border-line'"
        >
            <div class="mb-2 flex min-w-0 items-center justify-between gap-2">
                <span class="min-w-0 truncate font-mono text-xs font-medium text-ink">{{
                    r.model
                }}</span>
                <span class="shrink-0 font-mono text-[11px] text-soft">
                    {{ r.latencyMs }}ms · US$ {{ r.costUsd.toFixed(6) }}
                </span>
            </div>
            <p v-if="r.error" class="text-sm break-words text-red-600">⚠ {{ r.error }}</p>
            <pre
                v-else
                class="text-sm leading-relaxed break-words whitespace-pre-wrap text-ink"
                >{{ r.content }}</pre
            >
        </article>
    </div>
</template>
