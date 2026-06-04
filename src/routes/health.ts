import type { FastifyInstance } from "fastify";

/** Liveness check. Não exige autenticação. */
export async function healthRoutes(app: FastifyInstance): Promise<void> {
    app.get("/health", async () => ({ status: "ok" as const }));
}
