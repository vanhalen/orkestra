import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import type { Catalog } from "../core/catalog";
import type { ClientFactory } from "../server";
import { selectModel, type ScoredModel } from "../core/selector";
import { probeModels } from "../core/runner";
import { ApiError } from "../core/errors";
import { recommendBodySchema } from "../schemas/recommend";

/**
 * `POST /v1/recommend` — escolhe o melhor modelo para a tarefa (heurística sobre
 * o catálogo). Com `validate: true`, roda um probe curto nos finalistas para
 * confirmar latência/sucesso reais (exige API key e gasta poucos tokens).
 */
export function recommendRoutes(catalog: Catalog, clientFactory: ClientFactory) {
    return async function (fastify: FastifyInstance) {
        const app = fastify.withTypeProvider<ZodTypeProvider>();

        app.post(
            "/v1/recommend",
            { schema: { body: recommendBodySchema } },
            async (request) => {
                const body = request.body;
                const models = await catalog.getModels();
                const result = selectModel(models, body);

                if (!result.best) {
                    throw new ApiError(
                        404,
                        "no_model",
                        "Nenhum modelo atende aos requisitos informados. Afrouxe os filtros.",
                    );
                }

                if (!body.validate) {
                    return { ...result, validated: false };
                }

                if (!request.openRouterKey) {
                    throw new ApiError(
                        401,
                        "invalid_key",
                        "A validação roda um probe real e exige a API key: Authorization: Bearer sk-or-...",
                    );
                }

                const client = clientFactory(request.openRouterKey);
                const ids = result.shortlist.map((s) => s.model.id);
                const probes = await probeModels(client, ids, body.task);

                const byId = new Map(result.shortlist.map((s) => [s.model.id, s]));
                const ordered = [...probes].sort(
                    (a, b) => Number(b.ok) - Number(a.ok) || a.latencyMs - b.latencyMs,
                );
                const shortlist: ScoredModel[] = ordered.map((p) => {
                    const scored = byId.get(p.model) as ScoredModel;
                    return {
                        ...scored,
                        reason: `${scored.reason} — probe ${p.ok ? `ok em ${p.latencyMs}ms` : "falhou"}`,
                    };
                });
                const bestProbe = ordered.find((p) => p.ok);
                const best = bestProbe
                    ? (byId.get(bestProbe.model) as ScoredModel).model
                    : result.best;

                return {
                    best,
                    shortlist,
                    rationale: `${result.rationale} Reordenado por validação (probe real).`,
                    validated: true,
                };
            },
        );
    };
}
