/** Capacidades de modelo expostas pelo OpenRouter — fonte única (badges, filtros, requisitos). */
export type CapKey = "file" | "image" | "json" | "tools" | "web";

export const CAPABILITIES: Array<{ key: CapKey; label: string; short: string; help: string }> = [
    {
        key: "file",
        label: "PDF / arquivo",
        short: "PDF",
        help: "Aceita PDFs e arquivos como entrada — ideal para extrair informação de documentos.",
    },
    {
        key: "image",
        label: "Imagem",
        short: "imagem",
        help: "Aceita imagens como entrada (modelos de visão).",
    },
    {
        key: "json",
        label: "JSON estruturado",
        short: "JSON",
        help: "Garante a saída em JSON válido (structured outputs / response_format).",
    },
    {
        key: "tools",
        label: "Ferramentas",
        short: "tools",
        help: "Suporta tool calling / function calling (chamar funções e ferramentas).",
    },
    {
        key: "web",
        label: "Busca web",
        short: "web",
        help: "Pode pesquisar na web durante a geração da resposta.",
    },
];

export type SortKey = "cheapest" | "expensive" | "context" | "name";

export type CatalogFilterState = {
    q: string;
    free: boolean;
    caps: Record<CapKey, boolean>;
    /** custo máximo em US$ por milhão de tokens */
    maxPriceMtok: string;
    minContext: string;
    /** incluir modelos especializados (moderação, embeddings…) — ocultos por padrão */
    includeSpecialized: boolean;
    sort: SortKey;
};

export function emptyFilter(): CatalogFilterState {
    return {
        q: "",
        free: false,
        caps: { file: false, image: false, json: false, tools: false, web: false },
        maxPriceMtok: "",
        minContext: "",
        includeSpecialized: false,
        sort: "cheapest",
    };
}
