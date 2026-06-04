import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { filterModels, type Catalog } from "../core/catalog";
import type { Capability } from "../core/types";

const CAPS = ["tools", "json", "web", "file", "image"] as const;

const querySchema = z.object({
    /** CSV de capacidades exigidas, ex.: "file,json". */
    supports: z
        .string()
        .optional()
        .transform((s) =>
            s
                ? s
                      .split(",")
                      .map((x) => x.trim())
                      .filter((x): x is Capability =>
                          (CAPS as readonly string[]).includes(x),
                      )
                : undefined,
        ),
    free: z
        .enum(["true", "false"])
        .optional()
        .transform((v) => v === "true"),
    maxPrice: z.coerce.number().nonnegative().optional(),
    minContext: z.coerce.number().int().nonnegative().optional(),
    q: z.string().optional(),
});

/** Registra `GET /v1/models` — catálogo normalizado e filtrável. Não exige auth. */
export function modelsRoutes(catalog: Catalog) {
    return async function (fastify: FastifyInstance) {
        const app = fastify.withTypeProvider<ZodTypeProvider>();

        app.get(
            "/v1/models",
            { schema: { querystring: querySchema } },
            async (request) => {
                const { supports, free, maxPrice, minContext, q } = request.query;
                const models = await catalog.getModels();
                const filtered = filterModels(models, {
                    supports,
                    free,
                    maxPrice,
                    minContext,
                    q,
                });
                return { count: filtered.length, models: filtered };
            },
        );
    };
}
