import { z } from "zod";

/** Schema do corpo de POST /v1/recommend (reaproveitado pelo modo `auto` do /v1/run). */
export const recommendBodySchema = z.object({
    task: z.string().min(1, "Descreva a tarefa."),
    priority: z.enum(["cheapest", "fastest", "largest_context", "balanced"]).optional(),
    requirements: z
        .object({
            inputs: z.array(z.enum(["pdf", "image"])).optional(),
            wantJson: z.boolean().optional(),
            tools: z.boolean().optional(),
            web: z.boolean().optional(),
            minContext: z.number().int().nonnegative().optional(),
        })
        .optional(),
    filters: z
        .object({
            free: z.boolean().optional(),
            maxPrice: z.number().nonnegative().optional(),
        })
        .optional(),
    candidates: z.array(z.string()).optional(),
    topN: z.number().int().positive().max(20).optional(),
});

export type RecommendBody = z.infer<typeof recommendBodySchema>;
