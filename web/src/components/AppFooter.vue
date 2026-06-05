<script setup lang="ts">
import { computed } from "vue";

const social = [
    {
        name: "LinkedIn",
        href: "https://www.linkedin.com/in/rodrigo-chagas-98792199",
        path: "M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8h4V24h-4V8zm7.5 0h3.8v2.2h.05c.53-1 1.83-2.2 3.77-2.2 4.03 0 4.78 2.65 4.78 6.1V24h-4v-7.1c0-1.7-.03-3.9-2.38-3.9-2.38 0-2.74 1.86-2.74 3.78V24h-4V8z",
    },
    {
        name: "GitHub",
        href: "https://github.com/vanhalen",
        path: "M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.12-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.23 0 4.63-2.81 5.65-5.49 5.95.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z",
    },
];

const START_YEAR = 2026;
const years = computed(() => {
    const now = new Date().getFullYear();
    return now > START_YEAR ? `${START_YEAR}–${now}` : `${START_YEAR}`;
});
</script>

<template>
    <footer class="mt-12 border-t border-line pt-6">
        <div class="flex flex-col items-center gap-3 text-center">
            <!-- contato + redes na mesma faixa -->
            <div class="flex flex-wrap items-center justify-center gap-2.5">
                <a
                    v-for="s in social"
                    :key="s.name"
                    :href="s.href"
                    target="_blank"
                    rel="noopener noreferrer"
                    :aria-label="s.name"
                    class="grid h-9 w-9 place-items-center rounded-lg border border-line text-soft transition hover:border-gold hover:bg-paper hover:text-amber-700"
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
                        <path :d="s.path" />
                    </svg>
                </a>
                <a
                    href="mailto:contato@rodrigorchagas.com.br"
                    class="inline-flex items-center gap-2 px-1 text-sm text-soft transition hover:text-ink"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                        class="h-4 w-4 text-amber-700"
                    >
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <path d="m3 7 9 6 9-6" />
                    </svg>
                    contato@rodrigorchagas.com.br
                </a>
                <a
                    href="https://rodrigorchagas.com.br/contato"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center rounded-full border border-gold px-3.5 py-1 text-sm font-medium text-amber-700 transition hover:bg-gold hover:text-ink"
                >
                    Entre em contato
                </a>
            </div>

            <!-- assinatura + direitos, bem juntos -->
            <div class="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                <img src="/orkestra-emblem.svg" alt="" class="h-4 w-4 opacity-60" />
                <span class="kicker">Sua key nunca é armazenada · BYOK</span>
                <span class="text-soft/40">·</span>
                <a
                    href="https://rodrigorchagas.com.br"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="kicker transition hover:text-ink"
                >
                    Rodrigo Chagas © {{ years }} · Todos os direitos reservados
                </a>
            </div>
        </div>
    </footer>
</template>
