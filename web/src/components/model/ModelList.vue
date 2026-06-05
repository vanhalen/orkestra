<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useCatalog } from "../../composables/useCatalog";
import { emptyFilter, type CapKey, type CatalogFilterState } from "../../capabilities";
import { sortPrice } from "../../price";
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
        if (!f.includeSpecialized && !m.general) return false;
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

const sorted = computed(() => {
    const list = [...filtered.value];
    switch (filter.value.sort) {
        case "name":
            return list.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
        case "context":
            return list.sort((a, b) => (b.contextLength ?? 0) - (a.contextLength ?? 0));
        case "expensive":
            return list.sort((a, b) => {
                const pa = sortPrice(a);
                const pb = sortPrice(b);
                const fa = Number.isFinite(pa);
                const fb = Number.isFinite(pb);
                if (fa !== fb) return fa ? -1 : 1; // "variável" por último
                return pb - pa;
            });
        case "cheapest":
        default:
            return list.sort(
                (a, b) =>
                    sortPrice(a) - sortPrice(b) || a.name.localeCompare(b.name, "pt-BR"),
            );
    }
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
                {{ sorted.length }} / {{ models.length }} modelos
            </p>
            <p v-if="selectable && selected.length" class="kicker text-amber-700">
                {{ selected.length }} selecionado(s)
            </p>
        </div>

        <p v-if="loading" class="text-sm text-soft">Carregando catálogo…</p>
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <ul class="scroll-soft max-h-[28rem] space-y-2 overflow-y-auto pr-1">
            <li
                v-for="m in sorted"
                :key="m.id"
                class="lift overflow-hidden rounded-xl border bg-card px-3.5 py-3"
                :class="[
                    selectable ? 'cursor-pointer' : '',
                    selected.includes(m.id)
                        ? 'border-gold ring-1 ring-gold/40'
                        : 'border-line hover:border-gold/50',
                ]"
                @click="toggle(m.id)"
            >
                <div class="flex min-w-0 items-center gap-3">
                    <input
                        v-if="selectable"
                        type="checkbox"
                        class="shrink-0 accent-gold"
                        :checked="selected.includes(m.id)"
                        @click.stop="toggle(m.id)"
                    />
                    <ModelCard :model="m" class="min-w-0 flex-1" />
                </div>
            </li>
        </ul>
    </div>
</template>
