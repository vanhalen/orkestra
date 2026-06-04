import type { Capability, CatalogFilter, OrkModel } from "./types";
import { filterModels } from "./catalog";

export type Priority = "cheapest" | "fastest" | "largest_context" | "balanced";

export type Requirements = {
    inputs?: Array<"pdf" | "image">;
    wantJson?: boolean;
    tools?: boolean;
    web?: boolean;
    minContext?: number;
};

export type RecommendInput = {
    task: string;
    priority?: Priority;
    requirements?: Requirements;
    filters?: { free?: boolean; maxPrice?: number };
    candidates?: string[];
    topN?: number;
};

export type ScoredModel = { model: OrkModel; score: number; reason: string };

export type RecommendResult = {
    best: OrkModel | null;
    shortlist: ScoredModel[];
    rationale: string;
};

const PRIORITY_LABEL: Record<Priority, string> = {
    cheapest: "menor custo",
    fastest:
        "menor custo como proxy de velocidade (throughput real via provider routing)",
    largest_context: "maior janela de contexto",
    balanced: "equilíbrio entre custo e contexto",
};

function totalPrice(m: OrkModel): number {
    return m.pricing.prompt + m.pricing.completion;
}

/** Converte os requisitos da tarefa em um filtro de catálogo. */
export function deriveFilter(input: RecommendInput): CatalogFilter {
    const req = input.requirements ?? {};
    const supports: Capability[] = [];
    if (req.inputs?.includes("pdf")) supports.push("file");
    if (req.inputs?.includes("image")) supports.push("image");
    if (req.wantJson) supports.push("json");
    if (req.tools) supports.push("tools");
    if (req.web) supports.push("web");

    return {
        supports: supports.length ? supports : undefined,
        free: input.filters?.free,
        maxPrice: input.filters?.maxPrice,
        minContext: req.minContext,
    };
}

/** Pontua e ordena os modelos elegíveis conforme a prioridade. */
export function rankModels(models: OrkModel[], priority: Priority): ScoredModel[] {
    if (models.length === 0) return [];

    const maxPrice = Math.max(...models.map(totalPrice));
    const maxContext = Math.max(...models.map((m) => m.contextLength ?? 0), 1);
    const priceScore = (m: OrkModel) =>
        maxPrice === 0 ? 1 : 1 - totalPrice(m) / maxPrice;
    const contextScore = (m: OrkModel) => (m.contextLength ?? 0) / maxContext;

    const scored = models.map((m): ScoredModel => {
        switch (priority) {
            case "largest_context":
                return {
                    model: m,
                    score: contextScore(m),
                    reason: `contexto de ${m.contextLength ?? "?"} tokens`,
                };
            case "balanced":
                return {
                    model: m,
                    score: 0.6 * priceScore(m) + 0.4 * contextScore(m),
                    reason: "melhor equilíbrio entre custo e contexto",
                };
            case "fastest":
                return {
                    model: m,
                    score: priceScore(m),
                    reason: "candidato de baixo custo; velocidade confirmada via validação/routing",
                };
            case "cheapest":
            default:
                return {
                    model: m,
                    score: priceScore(m),
                    reason:
                        totalPrice(m) === 0
                            ? "gratuito"
                            : `custo ${totalPrice(m)} USD/token`,
                };
        }
    });

    return scored.sort((a, b) => b.score - a.score);
}

function buildRationale(input: RecommendInput, eligibleCount: number): string {
    const req = input.requirements ?? {};
    const reqs: string[] = [];
    if (req.inputs?.includes("pdf")) reqs.push("aceita PDF/arquivo");
    if (req.inputs?.includes("image")) reqs.push("aceita imagem");
    if (req.wantJson) reqs.push("saída JSON estruturada");
    if (req.tools) reqs.push("ferramentas");
    if (req.web) reqs.push("busca web");
    if (req.minContext) reqs.push(`contexto ≥ ${req.minContext}`);
    if (input.filters?.free) reqs.push("apenas gratuitos");
    if (input.filters?.maxPrice !== undefined)
        reqs.push(`custo ≤ ${input.filters.maxPrice}`);

    const filtro = reqs.length ? `Filtrado por: ${reqs.join(", ")}. ` : "";
    const ordem = PRIORITY_LABEL[input.priority ?? "cheapest"];
    return `${filtro}${eligibleCount} modelo(s) elegível(is), ordenado(s) por ${ordem}.`;
}

/**
 * Motor de recomendação (heurística sobre o catálogo): deriva requisitos,
 * filtra, ordena pela prioridade e devolve o melhor + shortlist + justificativa.
 * Não gasta tokens. A validação opcional (rodar um probe) é aplicada à parte.
 */
export function selectModel(models: OrkModel[], input: RecommendInput): RecommendResult {
    let universe = models;
    if (input.candidates?.length) {
        const set = new Set(input.candidates);
        universe = models.filter((m) => set.has(m.id));
    }

    const eligible = filterModels(universe, deriveFilter(input));
    const ranked = rankModels(eligible, input.priority ?? "cheapest");
    const shortlist = ranked.slice(0, input.topN ?? 3);

    return {
        best: shortlist[0]?.model ?? null,
        shortlist,
        rationale: buildRationale(input, eligible.length),
    };
}
