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

describe("POST /v1/run", () => {
    it("401 sem API key", async () => {
        const app = appWith(() => ok("x"));
        const res = await app.inject({
            method: "POST",
            url: "/v1/run",
            payload: { prompt: "oi", models: ["a"] },
        });
        expect(res.statusCode).toBe(401);
        await app.close();
    });

    it("executa com fallback e devolve modelUsed + attempts", async () => {
        const app = appWith((model) => {
            if (model === "ruim") throw new ApiError(502, "upstream_error", "caiu");
            return ok(model, "resposta final");
        });
        const res = await app.inject({
            method: "POST",
            url: "/v1/run",
            headers: { authorization: `Bearer ${KEY}` },
            payload: { prompt: "oi", models: ["ruim", "bom"] },
        });
        expect(res.statusCode).toBe(200);
        const b = res.json();
        expect(b.answer).toBe("resposta final");
        expect(b.modelUsed).toBe("bom");
        expect(b.attempts).toHaveLength(2);
        await app.close();
    });

    it("modo auto recomenda (PDF) e roda o vision/pdf", async () => {
        const app = appWith((model) => ok(model, "auto ok"));
        const res = await app.inject({
            method: "POST",
            url: "/v1/run",
            headers: { authorization: `Bearer ${KEY}` },
            payload: {
                prompt: "extrair pdf",
                auto: { requirements: { inputs: ["pdf"] } },
            },
        });
        expect(res.statusCode).toBe(200);
        expect(res.json().modelUsed).toBe("vision/pdf");
        await app.close();
    });

    it("502 com attempts quando todos falham", async () => {
        const app = appWith(() => {
            throw new ApiError(504, "timeout", "demorou");
        });
        const res = await app.inject({
            method: "POST",
            url: "/v1/run",
            headers: { authorization: `Bearer ${KEY}` },
            payload: { prompt: "oi", models: ["a", "b"] },
        });
        expect(res.statusCode).toBe(502);
        expect(res.json().error.code).toBe("all_models_failed");
        expect(res.json().attempts).toHaveLength(2);
        await app.close();
    });

    it("400 quando não fornece models nem auto", async () => {
        const app = appWith(() => ok("x"));
        const res = await app.inject({
            method: "POST",
            url: "/v1/run",
            headers: { authorization: `Bearer ${KEY}` },
            payload: { prompt: "oi" },
        });
        expect(res.statusCode).toBe(400);
        await app.close();
    });
});
