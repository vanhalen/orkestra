import { describe, it, expect } from "vitest";
import { selectModel, deriveFilter, rankModels } from "../src/core/selector";
import type { Capability, OrkModel } from "../src/core/types";

type ModelInput = {
    id: string;
    name?: string;
    contextLength?: number | null;
    pricing?: OrkModel["pricing"];
    inputModalities?: string[];
    capabilities?: Partial<Record<Capability, boolean>>;
};

function model(p: ModelInput): OrkModel {
    return {
        id: p.id,
        name: p.name ?? p.id,
        contextLength: p.contextLength ?? 8000,
        pricing: p.pricing ?? { prompt: 0, completion: 0, image: 0 },
        inputModalities: p.inputModalities ?? ["text"],
        capabilities: {
            tools: false,
            json: false,
            web: false,
            file: false,
            image: false,
            ...p.capabilities,
        },
    };
}

const models: OrkModel[] = [
    model({
        id: "free-small",
        pricing: { prompt: 0, completion: 0, image: 0 },
        contextLength: 8000,
    }),
    model({
        id: "cheap-pdf",
        pricing: { prompt: 0.000001, completion: 0.000001, image: 0 },
        contextLength: 32000,
        inputModalities: ["text", "file"],
        capabilities: { file: true, json: true },
    }),
    model({
        id: "pricey-huge",
        pricing: { prompt: 0.00001, completion: 0.00003, image: 0 },
        contextLength: 1000000,
        inputModalities: ["text", "file"],
        capabilities: { file: true, json: true, tools: true },
    }),
];

describe("deriveFilter", () => {
    it("mapeia inputs/wantJson para capacidades exigidas", () => {
        const f = deriveFilter({
            task: "x",
            requirements: { inputs: ["pdf"], wantJson: true },
        });
        expect(f.supports).toEqual(["file", "json"]);
    });
});

describe("selectModel", () => {
    it("cheapest prioriza o gratuito", () => {
        const r = selectModel(models, { task: "x", priority: "cheapest" });
        expect(r.best?.id).toBe("free-small");
    });

    it("largest_context prioriza o de maior janela", () => {
        const r = selectModel(models, { task: "x", priority: "largest_context" });
        expect(r.best?.id).toBe("pricey-huge");
    });

    it("requisito de PDF+JSON elimina quem não suporta", () => {
        const r = selectModel(models, {
            task: "extrair pdf",
            requirements: { inputs: ["pdf"], wantJson: true },
            priority: "cheapest",
        });
        expect(r.shortlist.map((s) => s.model.id)).toEqual(["cheap-pdf", "pricey-huge"]);
        expect(r.best?.id).toBe("cheap-pdf");
    });

    it("candidates restringe o universo", () => {
        const r = selectModel(models, { task: "x", candidates: ["pricey-huge"] });
        expect(r.shortlist.map((s) => s.model.id)).toEqual(["pricey-huge"]);
    });

    it("retorna best=null quando nada atende", () => {
        const r = selectModel(models, { task: "x", requirements: { web: true } });
        expect(r.best).toBeNull();
        expect(r.shortlist).toHaveLength(0);
    });

    it("respeita topN", () => {
        const r = selectModel(models, { task: "x", topN: 1 });
        expect(r.shortlist).toHaveLength(1);
    });
});

describe("rankModels", () => {
    it("ordena por score desc", () => {
        const ranked = rankModels(models, "cheapest");
        expect(ranked[0].score).toBeGreaterThanOrEqual(ranked[ranked.length - 1].score);
    });
});
