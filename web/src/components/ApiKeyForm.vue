<script setup lang="ts">
import { ref } from "vue";
import { getKey, setKey, clearKey } from "../api";

const emit = defineEmits<{ change: [] }>();
const key = ref(getKey());
const saved = ref(Boolean(getKey()));

function save() {
    setKey(key.value.trim());
    saved.value = key.value.trim().length > 0;
    emit("change");
}
function forget() {
    clearKey();
    key.value = "";
    saved.value = false;
    emit("change");
}
</script>

<template>
    <div class="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
        <label class="mb-1 block text-sm font-medium text-slate-300">
            API key do OpenRouter (BYOK)
        </label>
        <div class="flex flex-col gap-2 sm:flex-row">
            <input
                v-model="key"
                type="password"
                placeholder="sk-or-..."
                class="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-indigo-500"
            />
            <button
                class="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500"
                @click="save"
            >
                Salvar
            </button>
            <button
                v-if="saved"
                class="rounded-lg bg-slate-700 px-4 py-2 text-slate-200 hover:bg-slate-600"
                @click="forget"
            >
                Esquecer
            </button>
        </div>
        <p class="mt-2 text-xs" :class="saved ? 'text-emerald-400' : 'text-slate-400'">
            {{
                saved
                    ? "Key salva apenas nesta sessão do navegador. O Orkestra só a repassa ao OpenRouter."
                    : "Sua key fica só no navegador (sessionStorage). Necessária para executar e comparar."
            }}
        </p>
    </div>
</template>
