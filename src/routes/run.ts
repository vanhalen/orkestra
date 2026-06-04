import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import type { Catalog } from "../core/catalog";
import type { ClientFactory } from "../server";
import { selectModel } from "../core/selector";
import { runChain } from "../core/runner";
import { computeCost } from "../core/metrics";
import { ApiError } from "../core/errors";
import { requireApiKey } from "../plugins/auth";
import { runBodySchema } from "../schemas/run";

/**
 * `POST /v1/run` — executa a tarefa e devolve a resposta + o modelo que
 * respondeu. Aceita uma cadeia `models` (fallback) ou `auto` (recomenda
 * internamente). Confiável: fallback + timeout, nunca trava. Exige API key.
 */
export function runRoutes(catalog: Catalog, clientFactory: ClientFactory) {
    return async function (fastify: FastifyInstance) {
        const app = fastify.withTypeProvider<ZodTypeProvider>();

        app.post(
            "/v1/run",
            { schema: { body: runBodySchema }, preHandler: requireApiKey },
            async (request, reply) => {
                const body = request.body;
                const client = clientFactory(request.openRouterKey as string);
                const models = await catalog.getModels();

                let chain: string[];
                if (body.models?.length) {
                    chain = body.models;
                } else {
                    const result = selectModel(models, {
                        task: body.prompt,
                        ...body.auto,
                    });
                    chain = result.shortlist.map((s) => s.model.id);
                    if (!chain.length) {
                        throw new ApiError(
                            404,
                            "no_model",
                            "Nenhum modelo atende aos requisitos informados.",
                        );
                    }
                }

                const run = await runChain(client, {
                    prompt: body.prompt,
                    models: chain,
                    files: body.files,
                    responseFormat: body.responseFormat,
                    temperature: body.temperature,
                    maxTokens: body.maxTokens,
                });

                if (!run.ok) {
                    return reply.status(502).send({
                        error: {
                            code: "all_models_failed",
                            message: "Nenhum modelo da cadeia respondeu.",
                        },
                        attempts: run.attempts,
                    });
                }

                const used = models.find((m) => m.id === run.modelUsed);
                const costUsd = used ? computeCost(run.usage, used) : 0;

                return {
                    answer: run.answer,
                    modelUsed: run.modelUsed,
                    usage: run.usage,
                    costUsd,
                    latencyMs: run.latencyMs,
                    attempts: run.attempts,
                };
            },
        );
    };
}
