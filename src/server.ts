import Fastify, { type FastifyInstance } from "fastify";
import {
    serializerCompiler,
    validatorCompiler,
    type ZodTypeProvider,
} from "fastify-type-provider-zod";
import type { Env } from "./env";
import { createCatalog, type Catalog } from "./core/catalog";
import { healthRoutes } from "./routes/health";
import { modelsRoutes } from "./routes/models";

/** Dependências injetáveis (facilita testes — ex.: catálogo com fetch fake). */
export type ServerDeps = {
    catalog?: Catalog;
};

/**
 * Monta a instância do Fastify: liga o type provider do Zod (validação +
 * serialização a partir de schemas Zod) e registra as rotas.
 *
 * As rotas de recommend/run/compare e os plugins de segurança (auth BYOK, cors,
 * helmet, rate-limit) entram nas próximas sprints.
 */
export function buildServer(env: Env, deps: ServerDeps = {}): FastifyInstance {
    const app = Fastify({ logger: false }).withTypeProvider<ZodTypeProvider>();

    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    const catalog =
        deps.catalog ??
        createCatalog({
            ttlMs: env.catalogTtlMs,
            timeoutMs: env.requestTimeoutMs,
        });

    app.register(healthRoutes);
    app.register(modelsRoutes(catalog));

    return app;
}
