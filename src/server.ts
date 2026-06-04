import Fastify, { type FastifyInstance } from "fastify";
import {
    serializerCompiler,
    validatorCompiler,
    type ZodTypeProvider,
} from "fastify-type-provider-zod";
import type { Env } from "./env";
import { createCatalog, type Catalog } from "./core/catalog";
import { createOpenRouterClient, type OpenRouterClient } from "./core/openrouterClient";
import { errorHandlerPlugin } from "./plugins/errorHandler";
import { securityPlugin } from "./plugins/security";
import { authPlugin } from "./plugins/auth";
import { docsPlugin } from "./plugins/docs";
import { staticWebPlugin } from "./plugins/staticWeb";
import { healthRoutes } from "./routes/health";
import { modelsRoutes } from "./routes/models";
import { recommendRoutes } from "./routes/recommend";
import { runRoutes } from "./routes/run";
import { compareRoutes } from "./routes/compare";

/** Cria um cliente do OpenRouter para a key BYOK de uma requisição. */
export type ClientFactory = (apiKey: string) => OpenRouterClient;

/** Dependências injetáveis (facilita testes — catálogo e cliente fake). */
export type ServerDeps = {
    catalog?: Catalog;
    createClient?: ClientFactory;
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
    app.register(docsPlugin);
    app.register(authPlugin);

    const catalog =
        deps.catalog ??
        createCatalog({
            ttlMs: env.catalogTtlMs,
            timeoutMs: env.requestTimeoutMs,
        });

    const clientFactory: ClientFactory =
        deps.createClient ??
        ((apiKey) =>
            createOpenRouterClient({
                apiKey,
                timeoutMs: env.requestTimeoutMs,
                httpReferer: env.httpReferer,
                title: env.title,
            }));

    app.register(healthRoutes);
    app.register(modelsRoutes(catalog));
    app.register(recommendRoutes(catalog, clientFactory));
    app.register(runRoutes(catalog, clientFactory));
    app.register(compareRoutes(catalog, clientFactory));

    // serve a SPA buildada (web/dist) se existir — registrado por último
    app.register(staticWebPlugin);

    return app;
}
