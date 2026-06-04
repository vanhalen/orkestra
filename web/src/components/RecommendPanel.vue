<script setup lang="ts">
import { reactive, ref } from "vue";
import { api, hasKey, type RecommendResult, type RunResult } from "../api";
import ModelBadges from "./ModelBadges.vue";

const form = reactive({
    task: "",
    priority: "cheapest",
    pdf: false,
    image: false,
    wantJson: false,
    tools: false,
    web: false,
    free: false,
    maxPrice: "",
    minContext: "",
    validate: false,
});

const loading = ref(false);
const error = ref("");
const result = ref<RecommendResult | null>(null);

const running = ref(false);
const runError = ref("");
const runResult = ref<RunResult | null>(null);

function buildBody() {
    const inputs: string[] = [];
    if (form.pdf) inputs.push("pdf");
    if (form.image) inputs.push("image");
    const requirements: Record<string, unknown> = {};
    if (inputs.length) requirements.inputs = inputs;
    if (form.wantJson) requirements.wantJson = true;
    if (form.tools) requirements.tools = true;
    if (form.web) requirements.web = true;
    if (form.minContext) requirements.minContext = Number(form.minContext);
    const filters: Record<string, unknown> = {};
    if (form.free) filters.free = true;
    if (form.maxPrice) filters.maxPrice = Number(form.maxPrice);

    return {
        task: form.task,
        priority: form.priority,
        requirements: Object.keys(requirements).length ? requirements : undefined,
        filters: Object.keys(filters).length ? filters : undefined,
        validate: form.validate || undefined,
    };
}

async function recommend() {
    error.value = "";
    runResult.value = null;
    if (!form.task.trim()) {
        error.value = "Descreva a tarefa.";
        return;
    }
    loading.value = true;
    result.value = null;
    try {
        result.value = await api.recommend(buildBody());
    } catch (e) {
        error.value = (e as Error).message;
    } finally {
        loading.value = false;
    }
}

async function runBest() {
    if (!result.value) return;
    runError.value = "";
    if (!hasKey()) {
        runError.value = "Defina sua API key para executar.";
        return;
    }
    running.value = true;
    runResult.value = null;
    try {
        runResult.value = await api.run({
            prompt: form.task,
            models: [result.value.best.id],
        });
    } catch (e) {
        runError.value = (e as Error).message;
    } finally {
        running.value = false;
    }
}
</script>

<template>
    <div class="grid gap-6 lg:grid-cols-2">
        <div class="space-y-3 rounded-xl border border-slate-700 bg-slate-800/50 p-4">
            <textarea
                v-model="form.task"
                rows="3"
                placeholder="Descreva a tarefa (ex.: extrair campos de uma nota fiscal em PDF)"
                class="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-indigo-500"
            ></textarea>

            <div class="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                <label class="flex items-center gap-1">
                    Prioridade
                    <select
                        v-model="form.priority"
                        class="rounded border border-slate-700 bg-slate-900 px-2 py-1"
                    >
                        <option value="cheapest">mais barato</option>
                        <option value="fastest">mais rápido</option>
                        <option value="largest_context">maior contexto</option>
                        <option value="balanced">equilibrado</option>
                    </select>
                </label>
            </div>

            <div class="flex flex-wrap gap-3 text-sm text-slate-300">
                <label class="flex items-center gap-1"><input v-model="form.pdf" type="checkbox" /> lê PDF</label>
                <label class="flex items-center gap-1"><input v-model="form.image" type="checkbox" /> imagem</label>
                <label class="flex items-center gap-1"><input v-model="form.wantJson" type="checkbox" /> JSON</label>
                <label class="flex items-center gap-1"><input v-model="form.tools" type="checkbox" /> tools</label>
                <label class="flex items-center gap-1"><input v-model="form.web" type="checkbox" /> web</label>
                <label class="flex items-center gap-1"><input v-model="form.free" type="checkbox" /> só grátis</label>
            </div>

            <div class="flex flex-wrap gap-3 text-sm text-slate-300">
                <label class="flex items-center gap-1">
                    contexto mín.
                    <input v-model="form.minContext" type="number" class="w-28 rounded border border-slate-700 bg-slate-900 px-2 py-1" />
                </label>
                <label class="flex items-center gap-1">
                    <input v-model="form.validate" type="checkbox" /> validar (roda probe, usa key)
                </label>
            </div>

            <button
                class="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                :disabled="loading"
                @click="recommend"
            >
                {{ loading ? "Recomendando…" : "Recomendar modelo" }}
            </button>
            <p v-if="error" class="text-sm text-rose-400">{{ error }}</p>
        </div>

        <div class="space-y-3">
            <div v-if="result" class="rounded-xl border border-indigo-700 bg-indigo-950/40 p-4">
                <div class="text-xs uppercase tracking-wide text-indigo-300">Recomendado</div>
                <div class="text-lg font-semibold text-slate-100">{{ result.best.name }}</div>
                <div class="text-xs text-slate-400">{{ result.best.id }}</div>
                <ModelBadges :model="result.best" class="mt-2" />
                <p class="mt-2 text-sm text-slate-300">{{ result.rationale }}</p>
                <span
                    v-if="result.validated"
                    class="mt-2 inline-block rounded bg-emerald-900/60 px-2 py-0.5 text-xs text-emerald-300"
                    >validado por probe</span
                >
                <button
                    class="mt-3 w-full rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
                    :disabled="running"
                    @click="runBest"
                >
                    {{ running ? "Executando…" : "Executar a tarefa com este modelo" }}
                </button>
                <p v-if="runError" class="mt-2 text-sm text-rose-400">{{ runError }}</p>
            </div>

            <div v-if="result?.shortlist.length" class="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                <div class="mb-2 text-xs uppercase tracking-wide text-slate-400">Shortlist</div>
                <ul class="space-y-2">
                    <li v-for="s in result.shortlist" :key="s.model.id" class="text-sm">
                        <span class="font-medium text-slate-200">{{ s.model.name }}</span>
                        <span class="text-slate-500"> — {{ s.reason }}</span>
                    </li>
                </ul>
            </div>

            <div v-if="runResult" class="rounded-xl border border-emerald-800 bg-emerald-950/30 p-4">
                <div class="text-xs uppercase tracking-wide text-emerald-300">
                    Resposta — {{ runResult.modelUsed }} ({{ runResult.latencyMs }}ms · ${{
                        runResult.costUsd.toFixed(6)
                    }})
                </div>
                <pre class="mt-2 whitespace-pre-wrap text-sm text-slate-200">{{ runResult.answer }}</pre>
            </div>
        </div>
    </div>
</template>
