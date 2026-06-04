import fp from "fastify-plugin";
import type { FastifyError } from "fastify";
import { ApiError } from "../core/errors";

/**
 * Resposta de erro uniforme: `{ error: { code, message } }`.
 * Nunca ecoa a API key (ela só vive em `request.openRouterKey`, que não logamos).
 */
export const errorHandlerPlugin = fp(async (app) => {
    app.setErrorHandler((err: FastifyError, request, reply) => {
        if (err instanceof ApiError) {
            return reply
                .status(err.statusCode)
                .send({ error: { code: err.code, message: err.message } });
        }

        // Erros de validação (Zod via fastify-type-provider-zod) → 400
        if (err.validation || err.statusCode === 400) {
            return reply
                .status(400)
                .send({ error: { code: "bad_request", message: err.message } });
        }

        if (err.statusCode === 429) {
            return reply.status(429).send({
                error: {
                    code: "rate_limited",
                    message: "Muitas requisições. Tente novamente em instantes.",
                },
            });
        }

        if (err.statusCode === 413) {
            return reply.status(413).send({
                error: { code: "payload_too_large", message: "Payload excede o limite." },
            });
        }

        // Inesperado → loga (sem key) e responde 500 genérico
        request.log.error({ err }, "erro não tratado");
        return reply
            .status(500)
            .send({ error: { code: "internal", message: "Erro interno." } });
    });
});
