const BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:3000";
const KEY_STORAGE = "orkestra_openrouter_key";

export type OrkModel = {
    id: string;
    name: string;
    contextLength: number | null;
    pricing: { prompt: number; completion: number; image: number };
    inputModalities: string[];
    capabilities: Record<string, boolean>;
};

export type ScoredModel = { model: OrkModel; score: number; reason: string };

export type RecommendResult = {
    best: OrkModel;
    shortlist: ScoredModel[];
    rationale: string;
    validated: boolean;
};

export type RunResult = {
    answer: string;
    modelUsed: string;
    usage?: Record<string, number>;
    costUsd: number;
    latencyMs: number;
    attempts: Array<{ model: string; ok: boolean; error?: string }>;
};

export type CompareResult = {
    question: string;
    results: Array<{
        model: string;
        content: string | null;
        error: string | null;
        latencyMs: number;
        costUsd: number;
    }>;
};

// --- gestão da API key (BYOK) — vive só no navegador ---
export function getKey(): string {
    return sessionStorage.getItem(KEY_STORAGE) ?? "";
}
export function setKey(k: string): void {
    sessionStorage.setItem(KEY_STORAGE, k);
}
export function clearKey(): void {
    sessionStorage.removeItem(KEY_STORAGE);
}
export function hasKey(): boolean {
    return getKey().length > 0;
}

type RequestOptions = { method?: string; body?: unknown; auth?: boolean };

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (opts.auth) {
        const key = getKey();
        if (!key) throw new Error("Defina sua API key do OpenRouter primeiro.");
        headers.Authorization = `Bearer ${key}`;
    }

    const res = await fetch(`${BASE}${path}`, {
        method: opts.method ?? "GET",
        headers,
        body: opts.body ? JSON.stringify(opts.body) : undefined,
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
        const message = json?.error?.message ?? `Erro ${res.status}`;
        throw new Error(message);
    }
    return json as T;
}

export const api = {
    models(query = ""): Promise<{ count: number; models: OrkModel[] }> {
        return request(`/v1/models${query}`);
    },
    recommend(body: Record<string, unknown>): Promise<RecommendResult> {
        return request("/v1/recommend", {
            method: "POST",
            body,
            auth: Boolean(body.validate),
        });
    },
    run(body: Record<string, unknown>): Promise<RunResult> {
        return request("/v1/run", { method: "POST", body, auth: true });
    },
    compare(body: Record<string, unknown>): Promise<CompareResult> {
        return request("/v1/compare", { method: "POST", body, auth: true });
    },
};
