import type { ChatGenerationParamsProvider } from "@openrouter/sdk/models";

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(
            `Variável ${name} não definida. Crie o arquivo .env (veja .env.example) ou use --env-file=.env no script/debug.`,
        );
    }
    return value;
}

/** Critério de roteamento: o que o OpenRouter prioriza ao "recomendar". */
export type SortStrategy = "price" | "throughput" | "latency";

export type ModelConfig = {
    openRouterApiKey: string;
    httpReferer: string;
    xTitle: string;
    port: number;
    /**
     * (1) Recomendação — candidatos para o router escolher (máx. 3 por requisição).
     * `partition: "none"` + `sort.by` → OpenRouter indica o melhor endpoint por critério.
     */
    routingCandidates: string[];
    /**
     * (2) Comparativo manual — você define os modelos e roda todos em paralelo.
     * Uma requisição por modelo (`model`), sem limite de 3.
     */
    compareModels: string[];
    /** Critérios de recomendação a testar (uma chamada por critério). */
    recommendSorts: SortStrategy[];
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
    provider: ChatGenerationParamsProvider;
};

export const config: ModelConfig = {
    openRouterApiKey: requireEnv("OPENROUTER_API_KEY"),
    httpReferer: requireEnv("HTTP_REFERER"),
    xTitle: requireEnv("TITLE"),
    port: Number(requireEnv("PORT")),
    routingCandidates: [
        "google/gemma-4-31b-it:free",
        "nvidia/nemotron-3-ultra-550b-a55b:free",
        "openrouter/owl-alpha",
    ],
    compareModels: [
        "google/gemma-4-31b-it:free",
        "nvidia/nemotron-3-ultra-550b-a55b:free",
        "openrouter/owl-alpha",
        "moonshotai/kimi-k2.6:free",
    ],
    recommendSorts: ["price", "throughput", "latency"],
    temperature: 0.2,
    maxTokens: 50,
    systemPrompt:
        "Você é um assistente de IA que responde perguntas de forma concisa e objetiva.",
    provider: {
        sort: {
            by: "price",
            partition: "none",
        },
    },
};
