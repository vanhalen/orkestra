<script setup lang="ts">
import type { CompareResult } from "../../api";

defineProps<{ result: CompareResult | null; loading: boolean }>();
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

        <article
            v-for="r in result?.results"
            :key="r.model"
            class="rise rounded-2xl border bg-card p-4 shadow-sm"
            :class="r.error ? 'border-red-200' : 'border-line'"
        >
            <div class="mb-2 flex items-center justify-between gap-2">
                <span class="truncate font-mono text-xs font-medium text-ink">{{
                    r.model
                }}</span>
                <span class="shrink-0 font-mono text-[11px] text-soft">
                    {{ r.latencyMs }}ms · US$ {{ r.costUsd.toFixed(6) }}
                </span>
            </div>
            <p v-if="r.error" class="text-sm text-red-600">⚠ {{ r.error }}</p>
            <pre
                v-else
                class="font-display text-sm leading-relaxed whitespace-pre-wrap text-ink"
                >{{ r.content }}</pre
            >
        </article>
    </div>
</template>
