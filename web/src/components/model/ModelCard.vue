<script setup lang="ts">
import { computed } from "vue";
import type { OrkModel } from "../../api";
import ModelBadges from "./ModelBadges.vue";

const props = defineProps<{ model: OrkModel; selected?: boolean }>();

const isFree = computed(
    () => props.model.pricing.prompt === 0 && props.model.pricing.completion === 0,
);
const pricePerMtok = computed(() =>
    ((props.model.pricing.prompt + props.model.pricing.completion) * 1_000_000).toFixed(2),
);
</script>

<template>
    <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
            <p class="truncate font-medium text-ink">{{ model.name }}</p>
            <p class="truncate font-mono text-[11px] text-soft">{{ model.id }}</p>
            <ModelBadges :model="model" class="mt-1.5" />
        </div>
        <div class="shrink-0 text-right">
            <p class="font-mono text-xs text-ink">
                {{ isFree ? "grátis" : `US$ ${pricePerMtok}` }}
            </p>
            <p class="font-mono text-[10px] text-soft">
                {{ isFree ? "" : "/ M tokens" }}
            </p>
            <p class="mt-1 font-mono text-[10px] text-soft">
                {{ model.contextLength?.toLocaleString("pt-BR") ?? "?" }} ctx
            </p>
        </div>
    </div>
</template>
