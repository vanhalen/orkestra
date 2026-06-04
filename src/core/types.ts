/** Capacidades de um modelo que o Orkestra usa para filtrar/recomendar. */
export type Capability = "tools" | "json" | "web" | "file" | "image";

/**
 * Modelo cru como vem do `GET /api/v1/models` do OpenRouter
 * (apenas os campos que o Orkestra consome).
 */
export type RawModel = {
    id: string;
    name?: string;
    context_length?: number | null;
    pricing?: {
        prompt?: string;
        completion?: string;
        image?: string;
        request?: string;
    };
    architecture?: {
        input_modalities?: string[];
        output_modalities?: string[];
        modality?: string;
    };
    supported_parameters?: string[];
};

/** Modelo normalizado usado internamente (pricing numérico, capacidades derivadas). */
export type OrkModel = {
    id: string;
    name: string;
    contextLength: number | null;
    /** Custo em USD por token. */
    pricing: { prompt: number; completion: number; image: number };
    inputModalities: string[];
    capabilities: Record<Capability, boolean>;
};

/** Critérios de filtragem do catálogo. */
export type CatalogFilter = {
    supports?: Capability[];
    free?: boolean;
    /** Teto para (prompt + completion) em USD por token. */
    maxPrice?: number;
    minContext?: number;
    q?: string;
};
