import { OpenRouter } from "@openrouter/sdk";
import type { ChatGenerationTokenUsage } from "@openrouter/sdk/models";
import { config, ModelConfig, SortStrategy } from "./config";

const ROUTING_MODELS_LIMIT = 3;

/** (1) O que o OpenRouter recomendou para cada critério. */
export type RecommendationResult = {
    sortBy: SortStrategy;
    model: string;
    content: string | null;
    error: string | null;
    latencyMs: number;
    usage?: ChatGenerationTokenUsage;
};

/** (2) Resposta de cada modelo que você escolheu comparar. */
export type ModelCompareResult = {
    model: string;
    content: string | null;
    error: string | null;
    latencyMs: number;
    usage?: ChatGenerationTokenUsage;
};

export class OpenRouterService {
    private config: ModelConfig;
    private client: OpenRouter;

    constructor(configOverride?: ModelConfig) {
        this.config = configOverride ?? config;

        this.client = new OpenRouter({
            apiKey: this.config.openRouterApiKey,
            httpReferer: this.config.httpReferer,
            xTitle: this.config.xTitle,
        });
    }

    /**
     * (1) Recomendação do OpenRouter.
     * Mesmos candidatos + mesmo prompt; varia só o critério (preço, throughput, latência).
     */
    async recommend(
        prompt: string,
        options?: { sorts?: SortStrategy[]; candidates?: string[] },
    ) {
        const sorts = options?.sorts ?? this.config.recommendSorts;
        const candidates = (options?.candidates ?? this.config.routingCandidates).slice(
            0,
            ROUTING_MODELS_LIMIT,
        );
        const skipped = (options?.candidates ?? this.config.routingCandidates).slice(
            ROUTING_MODELS_LIMIT,
        );
        const messages = this.buildMessages(prompt);

        const recommendations = await Promise.all(
            sorts.map((sortBy) => this.runRoutingRequest(candidates, messages, sortBy)),
        );

        return { candidates, candidatesSkipped: skipped, recommendations };
    }

    /**
     * (2) Comparativo manual — roda cada modelo que você listou (seu teste A/B).
     */
    async compareModels(
        prompt: string,
        models?: string[],
    ): Promise<{ models: string[]; results: ModelCompareResult[] }> {
        const list = models ?? this.config.compareModels;
        const messages = this.buildMessages(prompt);

        const results = await Promise.all(
            list.map((modelId) => this.runFixedModelRequest(modelId, messages)),
        );

        return { models: list, results };
    }

    private buildMessages(prompt: string) {
        return [
            { role: "system" as const, content: this.config.systemPrompt },
            { role: "user" as const, content: prompt },
        ];
    }

    private providerForSort(sortBy: SortStrategy) {
        const base = this.config.provider;
        const sort = base.sort;

        if (typeof sort === "string") {
            return { ...base, sort: sortBy };
        }

        return {
            ...base,
            sort: { ...sort, by: sortBy },
        };
    }

    private async runRoutingRequest(
        candidates: string[],
        messages: ReturnType<OpenRouterService["buildMessages"]>,
        sortBy: SortStrategy,
    ): Promise<RecommendationResult> {
        const start = Date.now();

        try {
            const response = await this.client.chat.send({
                models: candidates,
                messages,
                stream: false,
                temperature: this.config.temperature,
                maxTokens: this.config.maxTokens,
                provider: this.providerForSort(sortBy),
            });

            return {
                sortBy,
                model: response.model ?? "desconhecido",
                content: String(response.choices.at(0)?.message.content ?? ""),
                error: null,
                latencyMs: Date.now() - start,
                usage: response.usage,
            };
        } catch (e: unknown) {
            return {
                sortBy,
                model: "—",
                content: null,
                error: this.extractError(e),
                latencyMs: Date.now() - start,
            };
        }
    }

    private async runFixedModelRequest(
        modelId: string,
        messages: ReturnType<OpenRouterService["buildMessages"]>,
    ): Promise<ModelCompareResult> {
        const start = Date.now();

        try {
            const response = await this.client.chat.send({
                model: modelId,
                messages,
                stream: false,
                temperature: this.config.temperature,
                maxTokens: this.config.maxTokens,
            });

            return {
                model: response.model ?? modelId,
                content: String(response.choices.at(0)?.message.content ?? ""),
                error: null,
                latencyMs: Date.now() - start,
                usage: response.usage,
            };
        } catch (e: unknown) {
            return {
                model: modelId,
                content: null,
                error: this.extractError(e),
                latencyMs: Date.now() - start,
            };
        }
    }

    private extractError(e: unknown): string {
        const err = e as {
            message?: string;
            body?: { error?: { message?: string } };
        };
        return err.body?.error?.message ?? err.message ?? "Erro desconhecido";
    }
}
