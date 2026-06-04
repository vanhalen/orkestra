import { describe, it, expect } from "vitest";
import { loadEnv } from "../src/env";
import { buildServer } from "../src/server";
import { normalizeModel, type Catalog } from "../src/core/catalog";
import { rawModels } from "./fixtures/models";
import { fakeClient, ok } from "./fixtures/fakeClient";

const catalog: Catalog = { getModels: async () => rawModels.map(normalizeModel) };
const KEY = "sk-or-test-123";

function app() {
    return buildServer(loadEnv(), {
        catalog,
        createClient: () => fakeClient((model) => ok(model)),
    });
}

describe("POST /v1/recommend?validate", () => {
    it("validate=true sem key → 401", async () => {
        const a = app();
        const res = await a.inject({
            method: "POST",
            url: "/v1/recommend",
            payload: { task: "x", validate: true },
        });
        expect(res.statusCode).toBe(401);
        await a.close();
    });

    it("validate=true com key marca validated e roda o probe", async () => {
        const a = app();
        const res = await a.inject({
            method: "POST",
            url: "/v1/recommend",
            headers: { authorization: `Bearer ${KEY}` },
            payload: { task: "x", validate: true },
        });
        expect(res.statusCode).toBe(200);
        const body = res.json();
        expect(body.validated).toBe(true);
        expect(body.best).toBeTruthy();
        await a.close();
    });
});
