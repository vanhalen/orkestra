import Fastify from "fastify";
import { OpenRouterService } from "./openrouterService";
import type { SortStrategy } from "./config";

const questionSchema = {
    type: "object" as const,
    required: ["question"],
    properties: {
        question: { type: "string", minLength: 5 },
    },
};

export const createServer = (routerService: OpenRouterService) => {
    const app = Fastify({ logger: false });

    /** (1) O que o OpenRouter recomenda por critério (preço, throughput, latência). */
    app.post(
        "/chat/recommend",
        {
            schema: {
                body: {
                    ...questionSchema,
                    properties: {
                        ...questionSchema.properties,
                        sorts: {
                            type: "array",
                            items: {
                                type: "string",
                                enum: ["price", "throughput", "latency"],
                            },
                        },
                        candidates: {
                            type: "array",
                            items: { type: "string" },
                            maxItems: 3,
                        },
                    },
                },
            },
        },
        async (request, reply) => {
            try {
                const { question, sorts, candidates } = request.body as {
                    question: string;
                    sorts?: SortStrategy[];
                    candidates?: string[];
                };
                const data = await routerService.recommend(question, {
                    sorts,
                    candidates,
                });
                return reply.send({ question, mode: "recommend", ...data });
            } catch (error) {
                console.error(error);
                return reply
                    .status(500)
                    .send({ error: "Erro ao processar a requisição" });
            }
        },
    );

    /** (2) Comparativo lado a lado — você escolhe os modelos, todos rodam. */
    app.post(
        "/chat/compare",
        {
            schema: {
                body: {
                    ...questionSchema,
                    properties: {
                        ...questionSchema.properties,
                        models: { type: "array", items: { type: "string" }, minItems: 1 },
                    },
                },
            },
        },
        async (request, reply) => {
            try {
                const { question, models } = request.body as {
                    question: string;
                    models?: string[];
                };
                const data = await routerService.compareModels(question, models);
                return reply.send({ question, mode: "compare", ...data });
            } catch (error) {
                console.error(error);
                return reply
                    .status(500)
                    .send({ error: "Erro ao processar a requisição" });
            }
        },
    );

    return app;
};
