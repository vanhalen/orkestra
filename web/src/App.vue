<script setup lang="ts">
import { computed, shallowRef } from "vue";
import { TABS, type TabId } from "./tabs";
import AppHeader from "./components/AppHeader.vue";
import ApiKeyBar from "./components/ApiKeyBar.vue";
import TabNav from "./components/TabNav.vue";
import RecommendPanel from "./components/recommend/RecommendPanel.vue";
import ComparePanel from "./components/compare/ComparePanel.vue";
import CatalogPanel from "./components/catalog/CatalogPanel.vue";

const tab = shallowRef<TabId>("recommend");

const panels = {
    recommend: RecommendPanel,
    compare: ComparePanel,
    catalog: CatalogPanel,
};
const current = computed(() => panels[tab.value]);
</script>

<template>
    <div class="min-h-screen">
        <div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
            <AppHeader class="mb-8" />
            <ApiKeyBar class="mb-8" />
            <TabNav v-model="tab" :tabs="TABS" class="mb-6" />

            <Transition name="fade" mode="out-in">
                <KeepAlive>
                    <component :is="current" :key="tab" />
                </KeepAlive>
            </Transition>

            <footer
                class="mt-12 flex flex-col items-center gap-2 border-t border-line pt-6 text-center"
            >
                <img src="/orkestra-emblem.svg" alt="" class="h-6 w-6 opacity-40" />
                <p class="kicker">Sua key nunca é armazenada no servidor · BYOK</p>
            </footer>
        </div>
    </div>
</template>
