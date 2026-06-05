<script setup lang="ts">
import type { RecommendResult, RunResult } from "../../api";
import ModelBadges from "../model/ModelBadges.vue";

defineProps<{
    result: RecommendResult | null;
    error: string;
    running: boolean;
    runResult: RunResult | null;
    runError: string;
}>();
defineEmits<{ run: [] }>();
</script>

<template>
    <div class="space-y-4">
        <p v-if="error" class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {{ error }}
        </p>

        <div
            v-if="!result && !error"
            class="grid place-items-center rounded-2xl border border-dashed border-line bg-card/50 p-10 text-center"
        >
            <img src="/orkestra-emblem.svg" alt="" class="mb-3 h-10 w-10 opacity-30" />
            <p class="text-sm text-soft">
                Descreva a tarefa e o Orkestra aponta o melhor modelo.
            </p>
        </div>

        <template v-if="result">
            <article
                class="rise overflow-hidden rounded-2xl border border-brand/30 bg-card shadow-sm"
            >
                <div class="bg-gradient-to-br from-brand to-brand-deep px-5 py-4 text-white">
                    <div class="flex items-center justify-between">
                        <span class="font-mono text-[11px] tracking-wider uppercase opacity-80">
                            Recomendado
                        </span>
                        <span
                            v-if="result.validated"
                            class="rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] text-ink"
                        >
                            validado
                        </span>
                    </div>
                    <h3 class="mt-1 text-lg font-semibold">{{ result.best.name }}</h3>
                    <p class="font-mono text-xs opacity-80">{{ result.best.id }}</p>
                </div>
                <div class="space-y-3 px-5 py-4">
                    <ModelBadges :model="result.best" />
                    <p class="text-sm leading-relaxed text-soft">{{ result.rationale }}</p>
                    <button
                        :disabled="running"
                        class="w-full rounded-xl border border-brand bg-brand/5 px-4 py-2.5 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white disabled:opacity-50"
                        @click="$emit('run')"
                    >
                        {{ running ? "Executando…" : "Executar a tarefa com este modelo →" }}
                    </button>
                    <p v-if="runError" class="text-sm text-red-600">{{ runError }}</p>
                </div>
            </article>

            <div
                v-if="result.shortlist.length > 1"
                class="rounded-2xl border border-line bg-card p-4 shadow-sm"
            >
                <p class="kicker mb-2">Outros candidatos</p>
                <ul class="space-y-2">
                    <li
                        v-for="s in result.shortlist.slice(1)"
                        :key="s.model.id"
                        class="text-sm"
                    >
                        <span class="font-medium text-ink">{{ s.model.name }}</span>
                        <span class="text-soft"> — {{ s.reason }}</span>
                    </li>
                </ul>
            </div>

            <article
                v-if="runResult"
                class="rise rounded-2xl border border-accent/40 bg-card p-5 shadow-sm"
            >
                <div class="mb-2 flex flex-wrap items-center gap-2">
                    <span class="kicker">Resposta</span>
                    <span class="font-mono text-[11px] text-soft">
                        {{ runResult.modelUsed }} · {{ runResult.latencyMs }}ms · US$
                        {{ runResult.costUsd.toFixed(6) }}
                    </span>
                </div>
                <pre
                    class="font-display text-sm leading-relaxed whitespace-pre-wrap text-ink"
                    >{{ runResult.answer }}</pre
                >
            </article>
        </template>
    </div>
</template>
