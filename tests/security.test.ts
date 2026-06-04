import { describe, it, expect } from "vitest";
import { loadEnv } from "../src/env";
import { buildServer } from "../src/server";
import { normalizeModel, type Catalog } from "../src/core/catalog";
import { rawModels } from "./fixtures/models";

const fakeCatalog: Catalog = {
    getModels: async () => rawModels.map(normalizeModel),
};

function appWith(envOverrides = {}) {
    return buildServer({ ...loadEnv(), ...envOverrides }, { catalog: fakeCatalog });
}

describe("hardening", () => {
    it("aplica cabeçalhos de segurança (helmet) no /health", async () => {
        const app = appWith();
        const res = await app.inject({ method: "GET", url: "/health" });
        expect(
            res.headers["x-frame-options"] ?? res.headers["content-security-policy"],
        ).toBeDefined();
        await app.close();
    });

    it("o catálogo é público (não exige key)", async () => {
        const app = appWith();
        const res = await app.inject({ method: "GET", url: "/v1/models" });
        expect(res.statusCode).toBe(200);
        await app.close();
    });

    it("retorna 429 ao exceder o rate limit", async () => {
        const app = appWith({ rateLimitMax: 2 });
        const a = await app.inject({ method: "GET", url: "/health" });
        const b = await app.inject({ method: "GET", url: "/health" });
        const c = await app.inject({ method: "GET", url: "/health" });
        expect(a.statusCode).toBe(200);
        expect(b.statusCode).toBe(200);
        expect(c.statusCode).toBe(429);
        expect(c.json().error.code).toBe("rate_limited");
        await app.close();
    });
});
