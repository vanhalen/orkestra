<script setup lang="ts">
import { computed } from "vue";
import type { OrkModel } from "../../api";
import { CAPABILITIES } from "../../capabilities";

const props = defineProps<{ model: OrkModel }>();

const isFree = computed(
    () => props.model.pricing.prompt === 0 && props.model.pricing.completion === 0,
);
const caps = computed(() => CAPABILITIES.filter((c) => props.model.capabilities[c.key]));
</script>

<template>
    <div class="flex flex-wrap gap-1">
        <span
            v-if="isFree"
            class="rounded-md bg-accent/15 px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-[#8a6a14]"
        >
            grátis
        </span>
        <span
            v-for="c in caps"
            :key="c.key"
            class="rounded-md bg-brand/8 px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-brand"
        >
            {{ c.short }}
        </span>
    </div>
</template>
