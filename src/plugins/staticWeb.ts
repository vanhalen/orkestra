import fp from "fastify-plugin";
import fastifyStatic from "@fastify/static";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const WEB_DIST = join(dirname(fileURLToPath(import.meta.url)), "../../web/dist");

/**
 * Serve a SPA buildada (`web/dist`) pela própria API, se existir — permite
 * deploy em porta única. Sem o build do front, o plugin é um no-op.
 * Rotas de API (/v1, /health, /docs) seguem tendo prioridade; o resto cai no
 * fallback da SPA (index.html).
 */
export const staticWebPlugin = fp(async (app) => {
    if (!existsSync(join(WEB_DIST, "index.html"))) return;

    await app.register(fastifyStatic, { root: WEB_DIST, prefix: "/" });

    app.setNotFoundHandler((request, reply) => {
        const url = request.raw.url ?? "";
        if (
            url.startsWith("/v1") ||
            url.startsWith("/health") ||
            url.startsWith("/docs")
        ) {
            return reply
                .code(404)
                .send({ error: { code: "not_found", message: "Rota não encontrada." } });
        }
        return reply.sendFile("index.html");
    });
});
