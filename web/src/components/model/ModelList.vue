<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useCatalog } from "../../composables/useCatalog";
import { emptyFilter, type CapKey, type CatalogFilterState } from "../../capabilities";
import ModelFilters from "./ModelFilters.vue";
import ModelCard from "./ModelCard.vue";

const props = defineProps<{ selectable?: boolean }>();
const selected = defineModel<string[]>("selected", { default: () => [] });

const { models, loading, error, load } = useCatalog();
onMounted(() => load());

const filter = ref<CatalogFilterState>(emptyFilter());

const filtered = computed(() => {
    const f = filter.value;
    const q = f.q.toLowerCase().trim();
    const maxPrice = f.maxPriceMtok ? Number(f.maxPriceMtok) / 1_000_000 : undefined;
    const minCtx = f.minContext ? Number(f.minContext) : undefined;
    const reqCaps = (Object.keys(f.caps) as CapKey[]).filter((k) => f.caps[k]);

    return models.value.filter((m) => {
        if (f.free && (m.pricing.prompt !== 0 || m.pricing.completion !== 0)) return false;
        if (reqCaps.some((c) => !m.capabilities[c])) return false;
        if (
            maxPrice !== undefined &&
            m.pricing.prompt + m.pricing.completion > maxPrice
        )
            return false;
        if (minCtx !== undefined && (m.contextLength ?? 0) < minCtx) return false;
        if (q && !`${m.id} ${m.name}`.toLowerCase().includes(q)) return false;
        return true;
    });
});

function toggle(id: string) {
    if (!props.selectable) return;
    const set = new Set(selected.value);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    selected.value = [...set];
}
</script>

<template>
    <div class="space-y-4">
        <ModelFilters v-model="filter" />

        <div class="flex items-center justify-between">
            <p class="kicker">
                {{ filtered.length }} / {{ models.length }} modelos
            </p>
            <p v-if="selectable && selected.length" class="kicker text-brand">
                {{ selected.length }} selecionado(s)
            </p>
        </div>

        <p v-if="loading" class="text-sm text-soft">Carregando catálogo…</p>
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <ul class="scroll-soft max-h-[28rem] space-y-2 overflow-y-auto pr-1">
            <li
                v-for="m in filtered"
                :key="m.id"
                class="rounded-xl border bg-card px-3.5 py-3 transition"
                :class="[
                    selectable ? 'cursor-pointer hover:border-brand/60' : '',
                    selected.includes(m.id)
                        ? 'border-brand ring-1 ring-brand/30'
                        : 'border-line',
                ]"
                @click="toggle(m.id)"
            >
                <div class="flex items-center gap-3">
                    <input
                        v-if="selectable"
                        type="checkbox"
                        class="accent-brand"
                        :checked="selected.includes(m.id)"
                        @click.stop="toggle(m.id)"
                    />
                    <ModelCard :model="m" class="flex-1" :selected="selected.includes(m.id)" />
                </div>
            </li>
        </ul>
    </div>
</template>
