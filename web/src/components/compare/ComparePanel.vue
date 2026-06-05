<script setup lang="ts">
import { ref } from "vue";
import { api, hasKey, type CompareResult } from "../../api";
import ModelList from "../model/ModelList.vue";
import CompareResults from "./CompareResults.vue";

const question = ref("");
const selected = ref<string[]>([]);
const loading = ref(false);
const error = ref("");
const result = ref<CompareResult | null>(null);

async function compare() {
    error.value = "";
    if (!hasKey()) {
        error.value = "Defina sua API key (acima) para comparar.";
        return;
    }
    if (!question.value.trim()) {
        error.value = "Escreva uma pergunta.";
        return;
    }
    if (!selected.value.length) {
        error.value = "Selecione ao menos um modelo no catálogo.";
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
    <div class="grid gap-5 lg:grid-cols-2">
        <section class="space-y-4 rounded-2xl border border-line bg-card p-5 shadow-sm">
            <div>
                <label class="kicker mb-1.5 block">Pergunta (mesma para todos)</label>
                <textarea
                    v-model="question"
                    rows="3"
                    placeholder="ex.: qual a melhor estratégia de cache para uma API REST?"
                    class="w-full resize-y rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-soft/70 focus:border-brand focus:ring-2 focus:ring-brand/20"
                ></textarea>
            </div>
            <div>
                <label class="kicker mb-1.5 block">Modelos a comparar</label>
                <ModelList v-model:selected="selected" selectable />
            </div>
            <button
                :disabled="loading"
                class="w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-deep active:scale-[.99] disabled:opacity-50"
                @click="compare"
            >
                {{ loading ? "Comparando…" : "Comparar respostas" }}
            </button>
            <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        </section>

        <CompareResults :result="result" :loading="loading" />
    </div>
</template>
