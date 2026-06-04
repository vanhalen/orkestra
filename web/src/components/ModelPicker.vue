<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { api, type OrkModel } from "../api";
import ModelBadges from "./ModelBadges.vue";

const props = defineProps<{
    /** se true, permite selecionar modelos (checkbox) */
    selectable?: boolean;
    modelValue?: string[];
}>();
const emit = defineEmits<{ "update:modelValue": [string[]] }>();

const all = ref<OrkModel[]>([]);
const loading = ref(false);
const error = ref("");
const search = ref("");
const onlyFree = ref(false);
const needFile = ref(false);
const needJson = ref(false);

async function load() {
    loading.value = true;
    error.value = "";
    try {
        const res = await api.models();
        all.value = res.models;
    } catch (e) {
        error.value = (e as Error).message;
    } finally {
        loading.value = false;
    }
}
onMounted(load);

const filtered = computed(() =>
    all.value.filter((m) => {
        if (onlyFree.value && (m.pricing.prompt !== 0 || m.pricing.completion !== 0))
            return false;
        if (needFile.value && !m.capabilities.file) return false;
        if (needJson.value && !m.capabilities.json) return false;
        const q = search.value.toLowerCase();
        if (q && !`${m.id} ${m.name}`.toLowerCase().includes(q)) return false;
        return true;
    }),
);

function toggle(id: string) {
    if (!props.selectable) return;
    const set = new Set(props.modelValue ?? []);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    emit("update:modelValue", [...set]);
}
function isSelected(id: string) {
    return (props.modelValue ?? []).includes(id);
}
</script>

<template>
    <div class="space-y-3">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
                v-model="search"
                placeholder="Buscar modelo..."
                class="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-indigo-500"
            />
            <label class="flex items-center gap-1 text-sm text-slate-300">
                <input v-model="onlyFree" type="checkbox" /> grátis
            </label>
            <label class="flex items-center gap-1 text-sm text-slate-300">
                <input v-model="needFile" type="checkbox" /> PDF
            </label>
            <label class="flex items-center gap-1 text-sm text-slate-300">
                <input v-model="needJson" type="checkbox" /> JSON
            </label>
        </div>

        <p v-if="loading" class="text-sm text-slate-400">Carregando catálogo…</p>
        <p v-if="error" class="text-sm text-rose-400">{{ error }}</p>
        <p v-if="!loading && !error" class="text-xs text-slate-500">
            {{ filtered.length }} de {{ all.length }} modelos
        </p>

        <ul class="max-h-96 space-y-1 overflow-y-auto pr-1">
            <li
                v-for="m in filtered"
                :key="m.id"
                class="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2"
                :class="{
                    'cursor-pointer hover:border-indigo-600': selectable,
                    'border-indigo-500': isSelected(m.id),
                }"
                @click="toggle(m.id)"
            >
                <div class="min-w-0">
                    <div class="flex items-center gap-2">
                        <input
                            v-if="selectable"
                            type="checkbox"
                            :checked="isSelected(m.id)"
                            @click.stop="toggle(m.id)"
                        />
                        <span class="truncate text-sm font-medium text-slate-200">{{
                            m.name
                        }}</span>
                    </div>
                    <div class="truncate text-xs text-slate-500">{{ m.id }}</div>
                    <ModelBadges :model="m" class="mt-1" />
                </div>
                <div class="shrink-0 text-right text-xs text-slate-400">
                    <div>{{ m.contextLength?.toLocaleString() ?? "?" }} ctx</div>
                    <div>${{ (m.pricing.prompt * 1_000_000).toFixed(3) }}/Mtok</div>
                </div>
            </li>
        </ul>
    </div>
</template>
