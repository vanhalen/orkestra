export type TabId = "recommend" | "compare" | "catalog";

export const TABS: Array<{ id: TabId; label: string }> = [
    { id: "recommend", label: "Recomendar / Executar" },
    { id: "compare", label: "Comparar" },
    { id: "catalog", label: "Catálogo" },
];
