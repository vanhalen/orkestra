import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import type { Catalog } from "../core/catalog";
import type { ClientFactory } from "../server";
import { compareModels } from "../core/comparator";
import { computeCost } from "../core/metrics";
import { requireApiKey } from "../plugins/auth";
import { compareBodySchema } from "../schemas/run";

/**
 * `POST /v1/compare` — roda os modelos escolhidos em paralelo com a mesma
 * pergunta. A falha de um não derruba os outros. Exige API key.
 */
export function compareRoutes(catalog: Catalog, clientFactory: ClientFactory) {
    return async function (fastify: FastifyInstance) {
        const app = fastify.withTypeProvider<ZodTypeProvider>();

        app.post(
            "/v1/compare",
            { schema: { body: compareBodySchema }, preHandler: requireApiKey },
            async (request) => {
                const body = request.body;
                const client = clientFactory(request.openRouterKey as string);

                const items = await compareModels(client, {
                    prompt: body.question,
                    models: body.models,
                    temperature: body.temperature,
                    maxTokens: body.maxTokens,
                });

                const catalogModels = await catalog.getModels();
                const byId = new Map(catalogModels.map((m) => [m.id, m]));
                const results = items.map((item) => {
                    const model = byId.get(item.model);
                    return {
                        ...item,
                        costUsd: model ? computeCost(item.usage, model) : 0,
                    };
                });

                return { question: body.question, results };
            },
        );
    };
}
