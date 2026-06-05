<script setup lang="ts">
import ModelList from "../model/ModelList.vue";
</script>

<template>
    <section class="rounded-2xl border border-line bg-card p-5 shadow-sm">
        <div class="mb-4">
            <p class="kicker">Catálogo OpenRouter</p>
            <p class="mt-1 text-sm text-soft">
                Explore todos os modelos e filtre por preço, contexto e capacidades.
            </p>
        </div>
        <ModelList />
    </section>
</template>
