import type { OrkModel } from "./types";
import type { ChatUsage } from "./openrouterClient";

/** Estima o custo em USD a partir do uso de tokens e do pricing do modelo. */
export function computeCost(usage: ChatUsage | undefined, model: OrkModel): number {
    const promptTokens = usage?.prompt_tokens ?? 0;
    const completionTokens = usage?.completion_tokens ?? 0;
    return (
        promptTokens * model.pricing.prompt + completionTokens * model.pricing.completion
    );
}
