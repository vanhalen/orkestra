import Fastify, { type FastifyInstance } from "fastify";
import {
    serializerCompiler,
    validatorCompiler,
    type ZodTypeProvider,
} from "fastify-type-provider-zod";
import type { Env } from "./env";
import { healthRoutes } from "./routes/health";

/**
 * Monta a instância do Fastify: liga o type provider do Zod (validação +
 * serialização a partir de schemas Zod) e registra as rotas.
 *
 * As rotas da v2 (catálogo, recommend, run, compare) e os plugins de segurança
 * (auth BYOK, cors, helmet, rate-limit) entram nas próximas sprints.
 */
export function buildServer(_env: Env): FastifyInstance {
    const app = Fastify({ logger: false }).withTypeProvider<ZodTypeProvider>();

    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    app.register(healthRoutes);

    return app;
}
