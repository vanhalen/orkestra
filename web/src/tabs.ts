export type TabId = "recommend" | "compare" | "catalog";

export type TabMeta = { id: TabId; label: string; roman: string; subtitle: string };

export const TABS: TabMeta[] = [
    { id: "recommend", label: "Recomendar", roman: "I", subtitle: "escolha e execute" },
    { id: "compare", label: "Comparar", roman: "II", subtitle: "respostas lado a lado" },
    { id: "catalog", label: "Catálogo", roman: "III", subtitle: "todos os modelos" },
];
