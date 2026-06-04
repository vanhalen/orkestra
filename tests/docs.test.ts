import { describe, it, expect } from "vitest";
import { loadEnv } from "../src/env";
import { buildServer } from "../src/server";
import { normalizeModel, type Catalog } from "../src/core/catalog";
import { rawModels } from "./fixtures/models";

const catalog: Catalog = { getModels: async () => rawModels.map(normalizeModel) };

describe("OpenAPI / docs", () => {
    it("gera o spec com as rotas v1", async () => {
        const app = buildServer(loadEnv(), { catalog });
        await app.ready();

        const spec = app.swagger() as { paths: Record<string, unknown> };
        expect(spec.paths["/v1/models"]).toBeDefined();
        expect(spec.paths["/v1/recommend"]).toBeDefined();
        expect(spec.paths["/v1/run"]).toBeDefined();
        expect(spec.paths["/v1/compare"]).toBeDefined();

        await app.close();
    });

    it("serve a UI em /docs", async () => {
        const app = buildServer(loadEnv(), { catalog });
        const res = await app.inject({ method: "GET", url: "/docs" });
        // redirect para /docs/static/index.html ou 200
        expect([200, 302]).toContain(res.statusCode);
        await app.close();
    });
});
