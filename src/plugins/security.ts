import fp from "fastify-plugin";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import type { Env } from "../env";

/**
 * Camada de segurança: cabeçalhos (helmet), CORS restrito à origem da SPA e
 * rate limit por IP. O limite de body é configurado no `Fastify({ bodyLimit })`.
 */
export function securityPlugin(env: Env) {
    return fp(async (app) => {
        await app.register(helmet);

        await app.register(cors, {
            origin:
                env.webOrigin === "*"
                    ? true
                    : env.webOrigin.split(",").map((o) => o.trim()),
        });

        // O erro 429 flui para o errorHandler, que padroniza o formato da resposta.
        await app.register(rateLimit, {
            max: env.rateLimitMax,
            timeWindow: "1 minute",
        });
    });
}
