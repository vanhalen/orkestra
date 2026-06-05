<script setup lang="ts">
import { ref } from "vue";
import { api, hasKey, type RecommendResult as RecResult, type RunResult } from "../../api";
import RecommendForm from "./RecommendForm.vue";
import RecommendResult from "./RecommendResult.vue";

const loading = ref(false);
const error = ref("");
const result = ref<RecResult | null>(null);
const lastTask = ref("");

const running = ref(false);
const runError = ref("");
const runResult = ref<RunResult | null>(null);

async function onSubmit(body: Record<string, unknown>, task: string) {
    error.value = "";
    runResult.value = null;
    runError.value = "";
    if (!task.trim()) {
        error.value = "Descreva a tarefa.";
        return;
    }
    lastTask.value = task;
    loading.value = true;
    result.value = null;
    try {
        result.value = await api.recommend(body);
    } catch (e) {
        error.value = (e as Error).message;
    } finally {
        loading.value = false;
    }
}

async function onRun() {
    if (!result.value) return;
    runError.value = "";
    if (!hasKey()) {
        runError.value = "Defina sua API key (acima) para executar.";
        return;
    }
    running.value = true;
    runResult.value = null;
    try {
        runResult.value = await api.run({
            prompt: lastTask.value,
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
    <div class="grid gap-5 lg:grid-cols-2">
        <RecommendForm :loading="loading" class="min-w-0" @submit="onSubmit" />
        <RecommendResult
            :result="result"
            :error="error"
            :running="running"
            :run-result="runResult"
            :run-error="runError"
            class="min-w-0"
            @run="onRun"
        />
    </div>
</template>
