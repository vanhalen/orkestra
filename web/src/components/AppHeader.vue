<script setup lang="ts">
// herói com o lockup da marca embutido (usa a fonte Space Grotesk carregada)
</script>

<template>
    <header
        class="rise relative isolate overflow-hidden rounded-3xl border border-line bg-card/70 px-5 py-7 shadow-sm backdrop-blur-sm sm:px-9 sm:py-10"
    >
        <div class="staff pointer-events-none absolute inset-0 -z-10 opacity-50"></div>
        <div
            class="pointer-events-none absolute -top-12 -right-12 -z-10 h-52 w-52 rounded-full bg-gradient-to-br from-brand/20 to-accent/25 blur-3xl"
        ></div>

        <p class="kicker mb-5 flex items-center gap-2.5">
            <span class="h-px w-8 bg-accent"></span>
            Maestro de LLMs · OpenRouter
        </p>

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
