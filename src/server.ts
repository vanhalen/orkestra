import Fastify, { type FastifyInstance } from "fastify";
import {
    serializerCompiler,
    validatorCompiler,
    type ZodTypeProvider,
} from "fastify-type-provider-zod";
import type { Env } from "./env";
import { createCatalog, type Catalog } from "./core/catalog";
import { errorHandlerPlugin } from "./plugins/errorHandler";
import { securityPlugin } from "./plugins/security";
import { authPlugin } from "./plugins/auth";
import { healthRoutes } from "./routes/health";
import { modelsRoutes } from "./routes/models";

/** Dependências injetáveis (facilita testes — ex.: catálogo com fetch fake). */
export type ServerDeps = {
    catalog?: Catalog;
};

/**
 * Monta a instância do Fastify: validação/serialização via Zod, camada de
 * segurança (helmet/cors/rate-limit + bodyLimit), BYOK e as rotas.
 *
 * As rotas de recommend/run/compare entram nas próximas sprints.
 */
export function buildServer(env: Env, deps: ServerDeps = {}): FastifyInstance {
    const app = Fastify({
        logger: false,
        bodyLimit: env.maxBodyBytes,
    }).withTypeProvider<ZodTypeProvider>();

    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    app.register(errorHandlerPlugin);
    app.register(securityPlugin(env));
    app.register(authPlugin);

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
