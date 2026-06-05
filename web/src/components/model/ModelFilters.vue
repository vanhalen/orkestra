<script setup lang="ts">
import { CAPABILITIES, type CapKey, type CatalogFilterState } from "../../capabilities";
import InfoTooltip from "../InfoTooltip.vue";

const filter = defineModel<CatalogFilterState>({ required: true });

function toggleCap(key: CapKey) {
    filter.value.caps[key] = !filter.value.caps[key];
}
</script>

<template>
    <div class="space-y-3">
        <input
            v-model="filter.q"
            type="search"
            placeholder="Buscar por nome ou id…"
            class="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-soft/70 focus:border-brand focus:ring-2 focus:ring-brand/20"
        />

        <div class="flex flex-wrap gap-2">
            <button
                type="button"
                class="rounded-full border px-3 py-1 text-xs font-medium transition"
                :class="
                    filter.free
                        ? 'border-accent bg-accent/15 text-[#8a6a14]'
                        : 'border-line text-soft hover:border-soft'
                "
                @click="filter.free = !filter.free"
            >
                grátis
            </button>
            <button
                v-for="c in CAPABILITIES"
                :key="c.key"
                type="button"
                :title="c.help"
                class="rounded-full border px-3 py-1 text-xs font-medium transition"
                :class="
                    filter.caps[c.key]
                        ? 'border-brand bg-brand text-white'
                        : 'border-line text-soft hover:border-brand/50 hover:text-brand'
                "
                @click="toggleCap(c.key)"
            >
                {{ c.short }}
            </button>
        </div>

        <div class="flex flex-wrap gap-x-5 gap-y-2 text-xs text-soft">
            <label class="flex items-center gap-1.5">
                <span class="inline-flex items-center gap-1">
                    custo máx.
                    <InfoTooltip
                        text="Teto de custo, em dólares por milhão de tokens (entrada + saída somados). Deixe vazio para qualquer preço."
                    />
                </span>
                <input
                    v-model="filter.maxPriceMtok"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="US$/M"
                    class="w-24 rounded-lg border border-line bg-paper px-2 py-1 text-ink outline-none focus:border-brand"
                />
            </label>
            <label class="flex items-center gap-1.5">
                <span class="inline-flex items-center gap-1">
                    contexto mín.
                    <InfoTooltip
                        text="Janela de contexto mínima, em tokens (≈ 4 caracteres por token). Use para tarefas com documentos grandes."
                    />
                </span>
                <input
                    v-model="filter.minContext"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="tokens"
                    class="w-28 rounded-lg border border-line bg-paper px-2 py-1 text-ink outline-none focus:border-brand"
                />
            </label>
        </div>
    </div>
</template>
