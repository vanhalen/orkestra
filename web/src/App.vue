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
const meta = computed(() => TABS.find((t) => t.id === tab.value)!);
</script>

<template>
    <div class="min-h-screen overflow-x-clip">
        <div class="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-12">
            <AppHeader class="mb-7 sm:mb-9" />
            <ApiKeyBar class="rise rise-2 mb-7" />
            <TabNav v-model="tab" :tabs="TABS" class="rise rise-3 mb-6" />

            <div class="mb-5 flex items-center gap-3">
                <span class="movement">{{ meta.roman }}</span>
                <span class="kicker">{{ meta.subtitle }}</span>
                <span class="h-px flex-1 bg-line"></span>
            </div>

            <Transition name="fade" mode="out-in">
                <KeepAlive>
                    <component :is="current" :key="tab" />
                </KeepAlive>
            </Transition>

            <footer
                class="mt-14 flex flex-col items-center gap-2 border-t border-line pt-7 text-center"
            >
                <img src="/orkestra-emblem.svg" alt="" class="h-6 w-6 opacity-40" />
                <p class="kicker">Sua key nunca é armazenada no servidor · BYOK</p>
            </footer>
        </div>
    </div>
</template>
