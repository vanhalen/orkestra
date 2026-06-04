import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import type { Catalog } from "../core/catalog";
import { selectModel } from "../core/selector";
import { ApiError } from "../core/errors";
import { recommendBodySchema } from "../schemas/recommend";

/**
 * `POST /v1/recommend` — escolhe o melhor modelo para a tarefa (heurística sobre
 * o catálogo). Não executa a tarefa nem gasta tokens. Não exige API key.
 */
export function recommendRoutes(catalog: Catalog) {
    return async function (fastify: FastifyInstance) {
        const app = fastify.withTypeProvider<ZodTypeProvider>();

        app.post(
            "/v1/recommend",
            { schema: { body: recommendBodySchema } },
            async (request) => {
                const models = await catalog.getModels();
                const result = selectModel(models, request.body);

                if (!result.best) {
                    throw new ApiError(
                        404,
                        "no_model",
                        "Nenhum modelo atende aos requisitos informados. Afrouxe os filtros.",
                    );
                }

                return { ...result, validated: false };
            },
        );
    };
}
