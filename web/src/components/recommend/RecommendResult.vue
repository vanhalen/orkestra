<script setup lang="ts">
import { computed } from "vue";
import type { RecommendResult, RunResult } from "../../api";
import { isFree, priceBreakdown, priceLabel } from "../../price";
import ModelBadges from "../model/ModelBadges.vue";

const props = defineProps<{
    result: RecommendResult | null;
    error: string;
    running: boolean;
    runResult: RunResult | null;
    runError: string;
}>();
defineEmits<{ run: [] }>();

const bestFree = computed(() => (props.result ? isFree(props.result.best) : false));
const bestPrice = computed(() => (props.result ? priceLabel(props.result.best) : ""));
const bestBreakdown = computed(() =>
    props.result ? priceBreakdown(props.result.best) : null,
);
const bestContext = computed(
    () => props.result?.best.contextLength?.toLocaleString("pt-BR") ?? "?",
);
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
                class="rise lift overflow-hidden rounded-2xl border border-gold/40 bg-card shadow-sm"
            >
                <!-- trilho dourado de destaque -->
                <div class="h-1.5 bg-gradient-to-r from-gold via-accent to-gold"></div>

                <div class="px-5 pt-4 pb-3">
                    <div class="flex items-center justify-between gap-2">
                        <span
                            class="font-mono text-[11px] font-medium tracking-[0.18em] text-amber-700 uppercase"
                        >
                            Recomendado
                        </span>
                        <span
                            v-if="result.validated"
                            class="rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-600/20"
                        >
                            validado
                        </span>
                    </div>
                    <h3 class="mt-1.5 text-xl font-bold text-ink">{{ result.best.name }}</h3>
                    <p class="truncate font-mono text-xs text-soft">{{ result.best.id }}</p>
                </div>

                <!-- custo em destaque: a informação principal -->
                <div class="flex items-stretch border-y border-line">
                    <div class="flex-1 px-5 py-3">
                        <p class="kicker mb-1">Custo / M tokens</p>
                        <p
                            class="text-2xl leading-none font-bold"
                            :class="bestFree ? 'text-emerald-700' : 'text-ink'"
                        >
                            {{ bestPrice }}
                        </p>
                        <p
                            v-if="bestBreakdown"
                            class="mt-1.5 font-mono text-[11px] text-soft"
                        >
                            entrada {{ bestBreakdown.input }} · saída {{ bestBreakdown.output }}
                        </p>
                    </div>
                    <div class="border-l border-line px-5 py-3 text-right">
                        <p class="kicker mb-1">Contexto</p>
                        <p class="text-lg leading-none font-semibold text-ink">
                            {{ bestContext }}
                        </p>
                        <p class="mt-1 font-mono text-[10px] text-soft">tokens</p>
                    </div>
                </div>

                <div class="space-y-3 px-5 py-4">
                    <ModelBadges :model="result.best" />
                    <p class="text-sm leading-relaxed text-soft">{{ result.rationale }}</p>
                    <button
                        :disabled="running"
                        class="w-full rounded-xl border border-action bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-action hover:text-white disabled:opacity-50"
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
                <p class="kicker mb-3">Outros candidatos</p>
                <ul class="space-y-3">
                    <li v-for="s in result.shortlist.slice(1)" :key="s.model.id">
                        <div class="flex items-baseline justify-between gap-3">
                            <span class="min-w-0 truncate text-sm font-medium text-ink">
                                {{ s.model.name }}
                            </span>
                            <span
                                class="shrink-0 font-mono text-sm font-semibold"
                                :class="isFree(s.model) ? 'text-emerald-700' : 'text-ink'"
                            >
                                {{ priceLabel(s.model) }}
                            </span>
                        </div>
                        <p class="truncate text-xs text-soft">{{ s.reason }}</p>
                    </li>
                </ul>
            </div>

            <article
                v-if="runResult"
                class="rise lift rounded-2xl border border-accent/40 bg-card p-5 shadow-sm"
            >
                <div class="mb-2 flex flex-wrap items-center gap-2">
                    <span class="kicker">Resposta</span>
                    <span class="font-mono text-[11px] text-soft">
                        {{ runResult.modelUsed }} · {{ runResult.latencyMs }}ms · US$
                        {{ runResult.costUsd.toFixed(6) }}
                    </span>
                </div>
                <pre
                    class="text-sm leading-relaxed break-words whitespace-pre-wrap text-ink"
                    >{{ runResult.answer }}</pre
                >
            </article>
        </template>
    </div>
</template>
