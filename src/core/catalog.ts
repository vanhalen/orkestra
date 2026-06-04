import type { CatalogFilter, OrkModel, RawModel } from "./types";

const MODELS_URL = "https://openrouter.ai/api/v1/models";

function toPrice(raw?: string): number {
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
}

/** Normaliza um modelo cru do OpenRouter para o formato interno do Orkestra. */
export function normalizeModel(raw: RawModel): OrkModel {
    const inputModalities = raw.architecture?.input_modalities ?? [];
    const params = raw.supported_parameters ?? [];

    return {
        id: raw.id,
        name: raw.name ?? raw.id,
        contextLength: raw.context_length ?? null,
        pricing: {
            prompt: toPrice(raw.pricing?.prompt),
            completion: toPrice(raw.pricing?.completion),
            image: toPrice(raw.pricing?.image),
        },
        inputModalities,
        capabilities: {
            tools: params.includes("tools"),
            json:
                params.includes("structured_outputs") ||
                params.includes("response_format"),
            web: params.includes("web_search") || params.includes("web_search_options"),
            file: inputModalities.includes("file"),
            image: inputModalities.includes("image"),
        },
    };
}

/** Aplica os critérios de filtragem sobre uma lista de modelos normalizados. */
export function filterModels(models: OrkModel[], filter: CatalogFilter = {}): OrkModel[] {
    const q = filter.q?.toLowerCase();

    return models.filter((m) => {
        if (filter.supports?.some((cap) => !m.capabilities[cap])) return false;
        if (filter.free && (m.pricing.prompt !== 0 || m.pricing.completion !== 0)) {
            return false;
        }
        if (
            filter.maxPrice !== undefined &&
            m.pricing.prompt + m.pricing.completion > filter.maxPrice
        ) {
            return false;
        }
        if (
            filter.minContext !== undefined &&
            (m.contextLength ?? 0) < filter.minContext
        ) {
            return false;
        }
        if (q && !`${m.id} ${m.name}`.toLowerCase().includes(q)) return false;
        return true;
    });
}

/** Busca a lista crua de modelos no OpenRouter, com timeout (nunca trava). */
export async function fetchRawModels(
    fetchImpl: typeof fetch = fetch,
    timeoutMs = 30_000,
): Promise<RawModel[]> {
    const res = await fetchImpl(MODELS_URL, {
        signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) {
        throw new Error(`OpenRouter /models retornou status ${res.status}`);
    }
    const json = (await res.json()) as { data?: RawModel[] };
    return json.data ?? [];
}

export type Catalog = { getModels(): Promise<OrkModel[]> };

type CatalogDeps = {
    fetchImpl?: typeof fetch;
    ttlMs?: number;
    timeoutMs?: number;
    now?: () => number;
};

/**
 * Catálogo com cache em memória + TTL. O fetch/relógio são injetáveis para teste.
 */
export function createCatalog(deps: CatalogDeps = {}): Catalog {
    const fetchImpl = deps.fetchImpl ?? fetch;
    const ttlMs = deps.ttlMs ?? 300_000;
    const timeoutMs = deps.timeoutMs ?? 30_000;
    const now = deps.now ?? (() => Date.now());

    let cache: { at: number; models: OrkModel[] } | null = null;

    async function getModels(): Promise<OrkModel[]> {
        const current = now();
        if (cache && current - cache.at < ttlMs) {
            return cache.models;
        }
        const raw = await fetchRawModels(fetchImpl, timeoutMs);
        const models = raw.map(normalizeModel);
        cache = { at: current, models };
        return models;
    }

    return { getModels };
}
