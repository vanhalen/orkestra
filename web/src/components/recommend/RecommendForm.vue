<script setup lang="ts">
import { reactive } from "vue";
import { CAPABILITIES, type CapKey } from "../../capabilities";
import InfoTooltip from "../InfoTooltip.vue";

defineProps<{ loading?: boolean }>();
const emit = defineEmits<{ submit: [body: Record<string, unknown>, task: string] }>();

const PRIORITIES = [
    { value: "cheapest", label: "mais barato" },
    { value: "fastest", label: "mais rápido" },
    { value: "largest_context", label: "maior contexto" },
    { value: "balanced", label: "equilibrado" },
];

const form = reactive({
    task: "",
    priority: "cheapest",
    caps: { file: false, image: false, json: false, tools: false, web: false } as Record<
        CapKey,
        boolean
    >,
    free: false,
    maxPriceMtok: "",
    minContext: "",
    validate: false,
});

function buildBody() {
    const inputs: string[] = [];
    if (form.caps.file) inputs.push("pdf");
    if (form.caps.image) inputs.push("image");

    const requirements: Record<string, unknown> = {};
    if (inputs.length) requirements.inputs = inputs;
    if (form.caps.json) requirements.wantJson = true;
    if (form.caps.tools) requirements.tools = true;
    if (form.caps.web) requirements.web = true;
    if (form.minContext) requirements.minContext = Number(form.minContext);

    const filters: Record<string, unknown> = {};
    if (form.free) filters.free = true;
    if (form.maxPriceMtok) filters.maxPrice = Number(form.maxPriceMtok) / 1_000_000;

    return {
        task: form.task,
        priority: form.priority,
        requirements: Object.keys(requirements).length ? requirements : undefined,
        filters: Object.keys(filters).length ? filters : undefined,
        validate: form.validate || undefined,
    };
}

function submit() {
    emit("submit", buildBody(), form.task);
}
</script>

<template>
    <form
        class="space-y-4 rounded-2xl border border-line bg-card p-5 shadow-sm"
        @submit.prevent="submit"
    >
        <div>
            <label class="kicker mb-1.5 block">Sua tarefa</label>
            <textarea
                v-model="form.task"
                rows="3"
                placeholder="ex.: extrair os itens e valores de uma nota fiscal em PDF e devolver em JSON"
                class="w-full resize-y rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-soft/70 focus:border-brand focus:ring-2 focus:ring-brand/20"
            ></textarea>
        </div>

        <div>
            <label class="kicker mb-1.5 flex items-center gap-1">
                Prioridade
                <InfoTooltip
                    text="Como ordenar os candidatos: mais barato (menor custo), mais rápido (prioriza velocidade na execução), maior contexto (janela maior) ou equilibrado."
                />
            </label>
            <div class="flex flex-wrap gap-2">
                <button
                    v-for="p in PRIORITIES"
                    :key="p.value"
                    type="button"
                    class="rounded-full border px-3.5 py-1.5 text-xs font-medium transition"
                    :class="
                        form.priority === p.value
                            ? 'border-brand bg-brand text-white'
                            : 'border-line text-soft hover:border-brand/50 hover:text-brand'
                    "
                    @click="form.priority = p.value"
                >
                    {{ p.label }}
                </button>
            </div>
        </div>

        <div>
            <label class="kicker mb-1.5 flex items-center gap-1">
                A tarefa precisa de…
                <InfoTooltip
                    text="Capacidades obrigatórias. O Orkestra só considera modelos que tenham todas as marcadas (ex.: ler PDF e devolver JSON)."
                />
            </label>
            <div class="flex flex-wrap gap-2">
                <button
                    v-for="c in CAPABILITIES"
                    :key="c.key"
                    type="button"
                    :title="c.help"
                    class="rounded-full border px-3.5 py-1.5 text-xs font-medium transition"
                    :class="
                        form.caps[c.key]
                            ? 'border-brand bg-brand text-white'
                            : 'border-line text-soft hover:border-brand/50 hover:text-brand'
                    "
                    @click="form.caps[c.key] = !form.caps[c.key]"
                >
                    {{ c.label }}
                </button>
            </div>
        </div>

        <div class="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-soft">
            <button
                type="button"
                class="rounded-full border px-3 py-1.5 font-medium transition"
                :class="
                    form.free
                        ? 'border-accent bg-accent/15 text-[#8a6a14]'
                        : 'border-line hover:border-soft'
                "
                @click="form.free = !form.free"
            >
                só grátis
            </button>
            <label class="flex items-center gap-1.5">
                <span class="inline-flex items-center gap-1">
                    custo máx.
                    <InfoTooltip
                        text="Teto em dólares por milhão de tokens (entrada + saída). Vazio = sem teto."
                    />
                </span>
                <input
                    v-model="form.maxPriceMtok"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="US$/M"
                    class="w-24 rounded-lg border border-line bg-paper px-2 py-1 text-ink outline-none focus:border-brand"
                />
            </label>
            <label class="flex items-center gap-1.5">
                <span class="inline-flex items-center gap-1">
                    contexto mín.
                    <InfoTooltip
                        text="Janela de contexto mínima em tokens (≈ 4 caracteres por token). Útil para documentos grandes."
                    />
                </span>
                <input
                    v-model="form.minContext"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="tokens"
                    class="w-28 rounded-lg border border-line bg-paper px-2 py-1 text-ink outline-none focus:border-brand"
                />
            </label>
        </div>

        <label
            class="flex items-center gap-2 rounded-xl bg-paper px-3 py-2.5 text-sm text-ink"
        >
            <input v-model="form.validate" type="checkbox" class="accent-brand" />
            <span class="inline-flex items-center gap-1">
                Validar antes de recomendar
                <InfoTooltip
                    text="Roda um teste-relâmpago nos finalistas usando sua API key, para confirmar latência e disponibilidade reais. Consome poucos tokens e exige a key."
                />
            </span>
        </label>

        <button
            type="submit"
            :disabled="loading"
            class="w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-deep active:scale-[.99] disabled:opacity-50"
        >
            {{ loading ? "Regendo…" : "Recomendar modelo" }}
        </button>
    </form>
</template>
