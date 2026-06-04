import { describe, it, expect } from "vitest";
import { loadEnv } from "../src/env";
import { buildServer } from "../src/server";
import { normalizeModel, type Catalog } from "../src/core/catalog";
import { rawModels } from "./fixtures/models";

const fakeCatalog: Catalog = {
    getModels: async () => rawModels.map(normalizeModel),
};

function appWithFakeCatalog() {
    return buildServer(loadEnv(), { catalog: fakeCatalog });
}

describe("GET /v1/models", () => {
    it("retorna o catálogo completo com count", async () => {
        const app = appWithFakeCatalog();
        const res = await app.inject({ method: "GET", url: "/v1/models" });

        expect(res.statusCode).toBe(200);
        expect(res.json().count).toBe(2);
        await app.close();
    });

    it("aplica filtro free=true", async () => {
        const app = appWithFakeCatalog();
        const res = await app.inject({ method: "GET", url: "/v1/models?free=true" });
        const body = res.json();

        expect(body.count).toBe(1);
        expect(body.models[0].id).toBe("free/model");
        await app.close();
    });

    it("aplica filtro supports=file", async () => {
        const app = appWithFakeCatalog();
        const res = await app.inject({ method: "GET", url: "/v1/models?supports=file" });

        expect(res.json().models.map((m: { id: string }) => m.id)).toEqual([
            "vision/pdf",
        ]);
        await app.close();
    });

    it("rejeita query inválida (maxPrice não-numérico) com 400", async () => {
        const app = appWithFakeCatalog();
        const res = await app.inject({
            method: "GET",
            url: "/v1/models?maxPrice=abc",
        });

        expect(res.statusCode).toBe(400);
        await app.close();
    });
});
