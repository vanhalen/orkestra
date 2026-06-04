<script setup lang="ts">
import { ref } from "vue";
import { api, hasKey, type CompareResult } from "../api";
import ModelPicker from "./ModelPicker.vue";

const question = ref("");
const selected = ref<string[]>([]);
const loading = ref(false);
const error = ref("");
const result = ref<CompareResult | null>(null);

async function compare() {
    error.value = "";
    if (!hasKey()) {
        error.value = "Defina sua API key para comparar.";
        return;
    }
    if (!question.value.trim()) {
        error.value = "Escreva uma pergunta.";
        return;
    }
    if (selected.value.length < 1) {
        error.value = "Selecione ao menos um modelo.";
        return;
    }
    loading.value = true;
    result.value = null;
    try {
        result.value = await api.compare({
            question: question.value,
            models: selected.value,
        });
    } catch (e) {
        error.value = (e as Error).message;
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div class="grid gap-6 lg:grid-cols-2">
        <div class="space-y-3 rounded-xl border border-slate-700 bg-slate-800/50 p-4">
            <textarea
                v-model="question"
                rows="3"
                placeholder="A mesma pergunta para todos os modelos..."
                class="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-indigo-500"
            ></textarea>
            <div class="text-xs text-slate-400">
                Selecionados: {{ selected.length }}
            </div>
            <ModelPicker v-model="selected" selectable />
            <button
                class="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                :disabled="loading"
                @click="compare"
            >
                {{ loading ? "Comparando…" : "Comparar" }}
            </button>
            <p v-if="error" class="text-sm text-rose-400">{{ error }}</p>
        </div>

        <div class="space-y-3">
            <p v-if="!result" class="text-sm text-slate-500">
                As respostas aparecem aqui, lado a lado.
            </p>
            <div
                v-for="r in result?.results"
                :key="r.model"
                class="rounded-xl border bg-slate-800/50 p-4"
                :class="r.error ? 'border-rose-800' : 'border-slate-700'"
            >
                <div class="flex items-center justify-between text-xs">
                    <span class="font-medium text-slate-300">{{ r.model }}</span>
                    <span class="text-slate-500">
                        {{ r.latencyMs }}ms · ${{ r.costUsd.toFixed(6) }}
                    </span>
                </div>
                <p v-if="r.error" class="mt-2 text-sm text-rose-400">⚠ {{ r.error }}</p>
                <pre v-else class="mt-2 whitespace-pre-wrap text-sm text-slate-200">{{ r.content }}</pre>
            </div>
        </div>
    </div>
</template>
