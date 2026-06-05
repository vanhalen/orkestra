<script setup lang="ts">
import { ref } from "vue";
import { useApiKey } from "../composables/useApiKey";
import InfoTooltip from "./InfoTooltip.vue";

const { key, hasKey, save, forget } = useApiKey();
const draft = ref(key.value);

function onSave() {
    save(draft.value);
}
function onForget() {
    forget();
    draft.value = "";
}
</script>

<template>
    <section class="rounded-2xl border border-line bg-card p-4 shadow-sm sm:p-5">
        <div class="mb-2 flex items-center gap-2">
            <span class="kicker">API key do OpenRouter</span>
            <InfoTooltip
                text="BYOK (Bring Your Own Key): sua chave fica só neste navegador e é usada apenas para falar com o OpenRouter. O Orkestra nunca a armazena."
                label="O que é BYOK"
            />
            <span
                class="ml-auto inline-flex items-center gap-1.5 font-mono text-[11px]"
                :class="hasKey ? 'text-green-700' : 'text-soft'"
            >
                <span
                    class="h-1.5 w-1.5 rounded-full"
                    :class="hasKey ? 'bg-green-600' : 'bg-soft/50'"
                ></span>
                {{ hasKey ? "key ativa" : "sem key" }}
            </span>
        </div>
        <div class="flex flex-col gap-2 sm:flex-row">
            <input
                v-model="draft"
                type="password"
                placeholder="sk-or-..."
                autocomplete="off"
                class="flex-1 rounded-xl border border-line bg-paper px-3.5 py-2.5 font-mono text-sm text-ink outline-none placeholder:text-soft/60 focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <button
                class="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-deep active:scale-[.98]"
                @click="onSave"
            >
                Salvar
            </button>
            <button
                v-if="hasKey"
                class="rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-soft transition hover:border-soft hover:text-ink"
                @click="onForget"
            >
                Esquecer
            </button>
        </div>
        <p class="mt-2 text-xs text-soft">
            Necessária para <b class="font-medium text-ink">executar</b> e
            <b class="font-medium text-ink">comparar</b>. Recomendar funciona sem key (a
            validação opcional usa a key).
        </p>
    </section>
</template>
