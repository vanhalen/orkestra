import fp from "fastify-plugin";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { jsonSchemaTransform } from "fastify-type-provider-zod";

/**
 * Documentação OpenAPI gerada a partir dos schemas Zod das rotas.
 * UI interativa em `/docs`, spec em `/docs/json`.
 */
export const docsPlugin = fp(async (app) => {
    await app.register(swagger, {
        openapi: {
            info: {
                title: "Orkestra API",
                version: "0.1.0",
                description:
                    "Seleção, comparação e recomendação de LLMs sobre o OpenRouter (BYOK). " +
                    "Rotas que chamam o OpenRouter exigem o header Authorization: Bearer sk-or-...",
            },
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        description: "API key do OpenRouter (BYOK).",
                    },
                },
            },
        },
        transform: jsonSchemaTransform,
    });

    await app.register(swaggerUi, { routePrefix: "/docs" });
});
