import { describe, it, expect } from "vitest";
import { loadEnv } from "../src/env";
import { buildServer } from "../src/server";
import { normalizeModel, type Catalog } from "../src/core/catalog";
import { rawModels } from "./fixtures/models";

const fakeCatalog: Catalog = {
    getModels: async () => rawModels.map(normalizeModel),
};

function app() {
    return buildServer(loadEnv(), { catalog: fakeCatalog });
}

describe("POST /v1/recommend", () => {
    it("retorna best + shortlist + rationale", async () => {
        const a = app();
        const res = await a.inject({
            method: "POST",
            url: "/v1/recommend",
            payload: { task: "extrair dados de pdf", requirements: { inputs: ["pdf"] } },
        });
        expect(res.statusCode).toBe(200);
        const body = res.json();
        expect(body.best.id).toBe("vision/pdf");
        expect(body.validated).toBe(false);
        expect(typeof body.rationale).toBe("string");
        await a.close();
    });

    it("404 quando nenhum modelo atende", async () => {
        const a = app();
        const res = await a.inject({
            method: "POST",
            url: "/v1/recommend",
            payload: { task: "x", requirements: { minContext: 9_000_000 } },
        });
        expect(res.statusCode).toBe(404);
        expect(res.json().error.code).toBe("no_model");
        await a.close();
    });

    it("400 quando o body é inválido (task ausente)", async () => {
        const a = app();
        const res = await a.inject({
            method: "POST",
            url: "/v1/recommend",
            payload: { priority: "cheapest" },
        });
        expect(res.statusCode).toBe(400);
        await a.close();
    });
});
