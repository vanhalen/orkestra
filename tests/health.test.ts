import { describe, it, expect } from "vitest";
import { loadEnv } from "../src/env";
import { buildServer } from "../src/server";

describe("GET /health", () => {
    it("retorna 200 com status ok", async () => {
        const app = buildServer(loadEnv());
        const res = await app.inject({ method: "GET", url: "/health" });

        expect(res.statusCode).toBe(200);
        expect(res.json()).toEqual({ status: "ok" });

        await app.close();
    });
});
