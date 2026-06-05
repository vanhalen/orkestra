<script setup lang="ts">
import { computed } from "vue";
import type { OrkModel } from "../../api";
import { isFree, priceLabel } from "../../price";
import ModelBadges from "./ModelBadges.vue";

const props = defineProps<{ model: OrkModel }>();

const free = computed(() => isFree(props.model));
const price = computed(() => priceLabel(props.model));
const context = computed(() => props.model.contextLength?.toLocaleString("pt-BR") ?? "?");
</script>

<template>
    <div class="flex min-w-0 items-start justify-between gap-3">
        <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-ink">{{ model.name }}</p>
            <p class="truncate font-mono text-[11px] text-soft">{{ model.id }}</p>
            <ModelBadges :model="model" class="mt-1.5" />
        </div>
        <div class="shrink-0 text-right">
            <p
                class="font-mono text-sm font-semibold"
                :class="free ? 'text-emerald-700' : 'text-ink'"
            >
                {{ price }}
            </p>
            <p v-if="!free" class="font-mono text-[10px] text-soft">/ M tokens</p>
            <p class="mt-1 font-mono text-[10px] text-soft">{{ context }} ctx</p>
        </div>
    </div>
</template>
