<script setup lang="ts">
import { ref } from "vue";
import ApiKeyForm from "./components/ApiKeyForm.vue";
import RecommendPanel from "./components/RecommendPanel.vue";
import ComparePanel from "./components/ComparePanel.vue";
import ModelPicker from "./components/ModelPicker.vue";

type Tab = "recommend" | "compare" | "catalog";
const tab = ref<Tab>("recommend");
const tabs: Array<{ id: Tab; label: string }> = [
    { id: "recommend", label: "Recomendar / Executar" },
    { id: "compare", label: "Comparar" },
    { id: "catalog", label: "Catálogo" },
];
</script>

<template>
    <div class="min-h-screen bg-slate-950 text-slate-100">
        <div class="mx-auto max-w-5xl px-4 py-8">
            <header class="mb-6">
                <h1 class="text-3xl font-bold tracking-tight">
                    🎻 Orkestra
                </h1>
                <p class="mt-1 text-slate-400">
                    Selecione, compare e recomende LLMs via OpenRouter — você traz sua key.
                </p>
            </header>

            <ApiKeyForm class="mb-6" />

            <nav class="mb-6 flex gap-2 border-b border-slate-800">
                <button
                    v-for="t in tabs"
                    :key="t.id"
                    class="-mb-px border-b-2 px-3 py-2 text-sm font-medium"
                    :class="
                        tab === t.id
                            ? 'border-indigo-500 text-indigo-300'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                    "
                    @click="tab = t.id"
                >
                    {{ t.label }}
                </button>
            </nav>

            <RecommendPanel v-if="tab === 'recommend'" />
            <ComparePanel v-else-if="tab === 'compare'" />
            <div v-else class="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                <ModelPicker />
            </div>

            <footer class="mt-10 text-center text-xs text-slate-600">
                Orkestra · API em <code>/docs</code> · sua key nunca é armazenada no servidor
            </footer>
        </div>
    </div>
</template>
