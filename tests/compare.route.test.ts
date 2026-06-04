import { describe, it, expect } from "vitest";
import { loadEnv } from "../src/env";
import { buildServer } from "../src/server";
import { normalizeModel, type Catalog } from "../src/core/catalog";
import { rawModels } from "./fixtures/models";
import { fakeClient, ok, type Behavior } from "./fixtures/fakeClient";
import { ApiError } from "../src/core/errors";

const catalog: Catalog = { getModels: async () => rawModels.map(normalizeModel) };
const KEY = "sk-or-test-123";

function appWith(behavior: Behavior) {
    return buildServer(loadEnv(), { catalog, createClient: () => fakeClient(behavior) });
}

describe("POST /v1/compare", () => {
    it("401 sem API key", async () => {
        const app = appWith(() => ok("x"));
        const res = await app.inject({
            method: "POST",
            url: "/v1/compare",
            payload: { question: "q", models: ["a"] },
        });
        expect(res.statusCode).toBe(401);
        await app.close();
    });

    it("roda em paralelo e isola a falha de um modelo", async () => {
        const app = appWith((model) => {
            if (model === "free/model") throw new ApiError(502, "upstream_error", "x");
            return ok(model, "resp");
        });
        const res = await app.inject({
            method: "POST",
            url: "/v1/compare",
            headers: { authorization: `Bearer ${KEY}` },
            payload: { question: "q", models: ["free/model", "vision/pdf"] },
        });
        expect(res.statusCode).toBe(200);
        const results = res.json().results;
        expect(results).toHaveLength(2);
        expect(
            results.find((r: { model: string }) => r.model === "free/model").error,
        ).toBe("x");
        expect(
            results.find((r: { model: string }) => r.model === "vision/pdf").content,
        ).toBe("resp");
        await app.close();
    });
});
