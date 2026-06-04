import { describe, it, expect, vi } from "vitest";
import { createCatalog, filterModels, normalizeModel } from "../src/core/catalog";
import { rawModels } from "./fixtures/models";

describe("normalizeModel", () => {
    it("converte pricing string→número e deriva capacidades", () => {
        const m = normalizeModel(rawModels[1]);
        expect(m.pricing.prompt).toBe(0.000001);
        expect(m.contextLength).toBe(128000);
        expect(m.capabilities).toEqual({
            tools: true,
            json: true,
            web: true,
            file: true,
            image: true,
        });
    });

    it("usa defaults seguros quando faltam campos", () => {
        const m = normalizeModel({ id: "x" });
        expect(m.name).toBe("x");
        expect(m.pricing).toEqual({ prompt: 0, completion: 0, image: 0 });
        expect(m.capabilities.file).toBe(false);
        expect(m.contextLength).toBeNull();
    });
});

describe("filterModels", () => {
    const models = rawModels.map(normalizeModel);
    const ids = (f: Parameters<typeof filterModels>[1]) =>
        filterModels(models, f).map((m) => m.id);

    it("free=true retorna só preço zero", () => {
        expect(ids({ free: true })).toEqual(["free/model"]);
    });
    it("supports=[file,json] filtra por capacidade", () => {
        expect(ids({ supports: ["file", "json"] })).toEqual(["vision/pdf"]);
    });
    it("minContext filtra por contexto", () => {
        expect(ids({ minContext: 100000 })).toEqual(["vision/pdf"]);
    });
    it("maxPrice soma prompt+completion", () => {
        expect(ids({ maxPrice: 0 })).toEqual(["free/model"]);
    });
    it("q busca por id/name (case-insensitive)", () => {
        expect(ids({ q: "vision" })).toEqual(["vision/pdf"]);
    });
    it("sem filtro retorna todos", () => {
        expect(ids({})).toEqual(["free/model", "vision/pdf"]);
    });
});

describe("createCatalog (cache + TTL)", () => {
    it("cacheia dentro do TTL e refaz o fetch após expirar", async () => {
        let clock = 0;
        const fetchImpl = vi.fn(
            async () =>
                new Response(JSON.stringify({ data: rawModels }), { status: 200 }),
        );
        const catalog = createCatalog({
            fetchImpl: fetchImpl as unknown as typeof fetch,
            ttlMs: 1000,
            now: () => clock,
        });

        await catalog.getModels();
        await catalog.getModels();
        expect(fetchImpl).toHaveBeenCalledTimes(1); // cache hit

        clock = 1500; // passou do TTL
        await catalog.getModels();
        expect(fetchImpl).toHaveBeenCalledTimes(2);
    });
});
