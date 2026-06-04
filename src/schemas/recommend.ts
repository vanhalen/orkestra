import { z } from "zod";

export const prioritySchema = z.enum([
    "cheapest",
    "fastest",
    "largest_context",
    "balanced",
]);

export const requirementsSchema = z.object({
    inputs: z.array(z.enum(["pdf", "image"])).optional(),
    wantJson: z.boolean().optional(),
    tools: z.boolean().optional(),
    web: z.boolean().optional(),
    minContext: z.number().int().nonnegative().optional(),
});

export const filtersSchema = z.object({
    free: z.boolean().optional(),
    maxPrice: z.number().nonnegative().optional(),
});

/** Critérios de seleção compartilhados (recommend e modo `auto` do /v1/run). */
export const autoSchema = z.object({
    priority: prioritySchema.optional(),
    requirements: requirementsSchema.optional(),
    filters: filtersSchema.optional(),
    candidates: z.array(z.string()).optional(),
});

/** Corpo de POST /v1/recommend. */
export const recommendBodySchema = autoSchema.extend({
    task: z.string().min(1, "Descreva a tarefa."),
    topN: z.number().int().positive().max(20).optional(),
    /** Se true, roda um probe curto nos finalistas para validar (exige API key). */
    validate: z.boolean().optional(),
});

export type RecommendBody = z.infer<typeof recommendBodySchema>;
