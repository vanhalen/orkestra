import type {
    ChatParams,
    ChatResult,
    ChatUsage,
    OpenRouterClient,
} from "../../src/core/openrouterClient";

export type Behavior = (
    model: string,
    params: ChatParams,
) => ChatResult | Promise<ChatResult>;

/** Cliente do OpenRouter fake: o comportamento por modelo é definido no teste. */
export function fakeClient(behavior: Behavior): OpenRouterClient {
    return {
        chat: async (params) =>
            behavior(params.model ?? params.models?.[0] ?? "?", params),
    };
}

export function ok(
    model: string,
    content = "resposta",
    usage: ChatUsage = { prompt_tokens: 10, completion_tokens: 5 },
): ChatResult {
    return { model, content, usage };
}
