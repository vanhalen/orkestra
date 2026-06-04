import { z } from "zod";
import { autoSchema } from "./recommend";

const fileSchema = z.object({
    filename: z.string(),
    /** URL pública ou data URL base64 do arquivo (ex.: PDF). */
    data: z.string(),
});

/** Corpo de POST /v1/run. Forneça `models` (cadeia de fallback) OU `auto`. */
export const runBodySchema = z
    .object({
        prompt: z.string().min(1, "Informe o prompt."),
        models: z.array(z.string()).min(1).optional(),
        auto: autoSchema.optional(),
        files: z.array(fileSchema).optional(),
        responseFormat: z.literal("json").optional(),
        temperature: z.number().min(0).max(2).optional(),
        maxTokens: z.number().int().positive().optional(),
    })
    .refine((b) => Boolean(b.models?.length) || Boolean(b.auto), {
        message: "Forneça 'models' (cadeia de fallback) ou 'auto'.",
    });

/** Corpo de POST /v1/compare. */
export const compareBodySchema = z.object({
    question: z.string().min(1, "Informe a pergunta."),
    models: z.array(z.string()).min(1, "Liste ao menos um modelo."),
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().int().positive().optional(),
});
