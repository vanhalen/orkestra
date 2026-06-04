import { describe, it, expect } from "vitest";
import Fastify from "fastify";
import { authPlugin, requireApiKey, extractKey } from "../src/plugins/auth";
import { errorHandlerPlugin } from "../src/plugins/errorHandler";

const VALID_KEY = "sk-or-v1-abcdef0123456789";

describe("extractKey", () => {
    it("aceita Bearer com prefixo sk-or-", () => {
        expect(extractKey(`Bearer ${VALID_KEY}`)).toBe(VALID_KEY);
    });
    it("rejeita header ausente, sem Bearer ou sem prefixo", () => {
        expect(extractKey(undefined)).toBeNull();
        expect(extractKey(VALID_KEY)).toBeNull();
        expect(extractKey("Bearer abc123")).toBeNull();
    });
});

async function protectedApp() {
    const app = Fastify();
    await app.register(errorHandlerPlugin);
    await app.register(authPlugin);
    app.get("/protegido", { preHandler: requireApiKey }, async (req) => ({
        // confirma que a key chega ao handler, mas NÃO é devolvida
        temKey: req.openRouterKey !== null,
    }));
    return app;
}

describe("requireApiKey (BYOK)", () => {
    it("401 quando a key está ausente", async () => {
        const app = await protectedApp();
        const res = await app.inject({ method: "GET", url: "/protegido" });
        expect(res.statusCode).toBe(401);
        expect(res.json().error.code).toBe("invalid_key");
        await app.close();
    });

    it("401 quando a key é malformada (sem prefixo)", async () => {
        const app = await protectedApp();
        const res = await app.inject({
            method: "GET",
            url: "/protegido",
            headers: { authorization: "Bearer chave-invalida" },
        });
        expect(res.statusCode).toBe(401);
        await app.close();
    });

    it("200 com key válida, sem vazar a key na resposta", async () => {
        const app = await protectedApp();
        const res = await app.inject({
            method: "GET",
            url: "/protegido",
            headers: { authorization: `Bearer ${VALID_KEY}` },
        });
        expect(res.statusCode).toBe(200);
        expect(res.json()).toEqual({ temKey: true });
        expect(res.body).not.toContain(VALID_KEY);
        await app.close();
    });
});
