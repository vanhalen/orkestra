import type { ChatUsage, OpenRouterClient } from "./openrouterClient";
import { buildMessages } from "./runner";

export type CompareItem = {
    model: string;
    content: string | null;
    error: string | null;
    latencyMs: number;
    usage?: ChatUsage;
};

export type CompareParams = {
    prompt: string;
    models: string[];
    temperature?: number;
    maxTokens?: number;
};

/**
 * Roda os modelos em paralelo com a mesma pergunta. A falha/timeout de um vira
 * um item com `error` — **sem derrubar os demais** (isolamento por modelo).
 */
export async function compareModels(
    client: OpenRouterClient,
    params: CompareParams,
    now: () => number = () => Date.now(),
): Promise<CompareItem[]> {
    const messages = buildMessages(params.prompt);

    const tasks = params.models.map(async (model): Promise<CompareItem> => {
        const start = now();
        try {
            const res = await client.chat({
                model,
                messages,
                temperature: params.temperature,
                maxTokens: params.maxTokens,
            });
            return {
                model,
                content: res.content,
                error: null,
                latencyMs: now() - start,
                usage: res.usage,
            };
        } catch (e) {
            return {
                model,
                content: null,
                error: e instanceof Error ? e.message : "erro desconhecido",
                latencyMs: now() - start,
            };
        }
    });

    const settled = await Promise.allSettled(tasks);
    return settled.map((s, i) =>
        s.status === "fulfilled"
            ? s.value
            : {
                  model: params.models[i],
                  content: null,
                  error: "erro inesperado",
                  latencyMs: 0,
              },
    );
}
