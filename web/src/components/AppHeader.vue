<script setup lang="ts">
// herói com o lockup da marca embutido (usa a fonte Space Grotesk carregada)
import { API_BASE } from "../api";

const docsUrl = `${API_BASE}/docs`;
const repoUrl = "https://github.com/vanhalen/orkestra";
</script>

<template>
    <header
        class="rise relative isolate overflow-hidden rounded-3xl border border-line bg-card/70 px-5 py-7 shadow-sm backdrop-blur-sm sm:px-9 sm:py-10"
    >
        <div class="staff pointer-events-none absolute inset-0 -z-10 opacity-50"></div>
        <div
            class="pointer-events-none absolute -top-12 -right-12 -z-10 h-52 w-52 rounded-full bg-gradient-to-br from-brand/20 to-accent/25 blur-3xl"
        ></div>

        <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
            <span class="kicker flex items-center gap-2.5">
                <span class="h-px w-8 bg-accent"></span>
                Maestro de LLMs · OpenRouter
            </span>
            <div class="flex items-center gap-2">
                <a
                    :href="docsUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card/60 px-2.5 py-1.5 text-xs font-medium text-soft transition hover:border-gold hover:text-amber-700"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                        class="h-3.5 w-3.5"
                    >
                        <path
                            d="M8 4H7a2 2 0 0 0-2 2v3a2 2 0 0 1-2 2 2 2 0 0 1 2 2v3a2 2 0 0 0 2 2h1M16 4h1a2 2 0 0 1 2 2v3a2 2 0 0 1 2 2 2 2 0 0 1-2 2v3a2 2 0 0 1-2 2h-1"
                        />
                    </svg>
                    <span class="hidden sm:inline">Documentação</span>
                    <span class="sm:hidden">Docs</span>
                </a>
                <a
                    :href="repoUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card/60 px-2.5 py-1.5 text-xs font-medium text-soft transition hover:border-gold hover:text-amber-700"
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" class="h-3.5 w-3.5">
                        <path
                            d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.12-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.23 0 4.63-2.81 5.65-5.49 5.95.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z"
                        />
                    </svg>
                    GitHub
                </a>
            </div>
        </div>

        <svg
            role="img"
            aria-label="Orkestra"
            viewBox="0 0 520 130"
            class="h-14 w-auto sm:h-[4.5rem]"
        >
            <g transform="translate(10,15)">
                <circle cx="50" cy="50" r="43" fill="none" stroke="#18142A" stroke-width="9" />
                <path
                    d="M32 32 Q50 14 68 32"
                    fill="none"
                    stroke="#18142A"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    opacity="0.5"
                />
                <path d="M45.5 55 L54.5 55 L57 80 L43 80 Z" fill="#18142A" />
                <path
                    d="M46 57 Q38 47 32 32"
                    fill="none"
                    stroke="#18142A"
                    stroke-width="5.5"
                    stroke-linecap="round"
                />
                <path
                    d="M54 57 Q62 47 68 32"
                    fill="none"
                    stroke="#18142A"
                    stroke-width="5.5"
                    stroke-linecap="round"
                />
                <circle cx="50" cy="47" r="8.5" fill="#18142A" />
                <circle cx="32" cy="32" r="3.6" fill="#18142A" />
                <circle cx="68" cy="32" r="3.6" fill="#18142A" />
                <circle cx="41" cy="25.25" r="3.6" fill="#18142A" />
                <circle cx="50" cy="23" r="4.6" fill="#E7B24A" />
                <circle cx="59" cy="25.25" r="3.6" fill="#18142A" />
            </g>
            <text
                x="116"
                y="90"
                font-family="'Space Grotesk', system-ui, sans-serif"
                font-weight="600"
                font-size="82"
                letter-spacing="-2"
                fill="#18142A"
            >
                r<tspan fill="#E7B24A">k</tspan>estra
            </text>
        </svg>

        <p class="mt-5 max-w-2xl text-base leading-relaxed text-soft sm:text-lg">
            Diga o que você precisa e o Orkestra rege os modelos do OpenRouter: aponta o
            melhor para a tarefa, executa e compara respostas lado a lado.
            <span class="font-medium text-ink">Você traz a sua própria key.</span>
        </p>
    </header>
</template>
