import fp from "fastify-plugin";
import type { FastifyRequest } from "fastify";
import { ApiError } from "../core/errors";

/** Toda key do OpenRouter começa com este prefixo. */
const KEY_PREFIX = "sk-or-";

declare module "fastify" {
    interface FastifyRequest {
        /** Key do OpenRouter (BYOK) extraída do header, ou null. Nunca é logada. */
        openRouterKey: string | null;
    }
}

/** Extrai a key de um header `Authorization: Bearer sk-or-...`. */
export function extractKey(header?: string): string | null {
    if (!header) return null;
    const match = /^Bearer\s+(.+)$/i.exec(header.trim());
    const token = match?.[1]?.trim();
    return token && token.startsWith(KEY_PREFIX) ? token : null;
}

/**
 * Plugin BYOK: decora `request.openRouterKey` com a key do header (ou null),
 * sem falhar — rotas públicas (catálogo, health) seguem funcionando. Rotas que
 * precisam da key usam o preHandler `requireApiKey`.
 *
 * A key fica apenas em `request.openRouterKey` (memória do request) e nunca é
 * registrada em log nem devolvida em respostas.
 */
export const authPlugin = fp(async (app) => {
    app.decorateRequest("openRouterKey", null);
    app.addHook("onRequest", async (request) => {
        request.openRouterKey = extractKey(request.headers.authorization);
    });
});

/** preHandler: exige uma key BYOK válida; senão, 401. */
export async function requireApiKey(request: FastifyRequest): Promise<void> {
    if (!request.openRouterKey) {
        throw new ApiError(
            401,
            "invalid_key",
            "API key do OpenRouter ausente ou inválida. Envie no header: Authorization: Bearer sk-or-...",
        );
    }
}
