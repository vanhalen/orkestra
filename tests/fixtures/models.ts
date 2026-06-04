import type { RawModel } from "../../src/core/types";

/** Modelos crus de exemplo (formato do GET /api/v1/models do OpenRouter). */
export const rawModels: RawModel[] = [
    {
        id: "free/model",
        name: "Free Model",
        context_length: 8000,
        pricing: { prompt: "0", completion: "0", image: "0" },
        architecture: { input_modalities: ["text"] },
        supported_parameters: ["tools"],
    },
    {
        id: "vision/pdf",
        name: "PDF Vision",
        context_length: 128000,
        pricing: { prompt: "0.000001", completion: "0.000002" },
        architecture: { input_modalities: ["text", "image", "file"] },
        supported_parameters: ["tools", "structured_outputs", "web_search"],
    },
];
