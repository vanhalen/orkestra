import { ApiError } from "./errors";

const CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";

export type ChatRole = "system" | "user" | "assistant";
export type ChatMessage = { role: ChatRole; content: unknown };
export type ChatUsage = {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
};

export type ChatParams = {
    model?: string;
    /** Cadeia de fallback nativa do OpenRouter (ordem de prioridade). */
    models?: string[];
    messages: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
    responseFormat?: "json";
    provider?: Record<string, unknown>;
    plugins?: unknown[];
};

export type ChatResult = { model: string; content: string; usage?: ChatUsage };

export type OpenRouterClient = { chat(params: ChatParams): Promise<ChatResult> };

export type ClientOptions = {
    apiKey: string;
    httpReferer?: string;
    title?: string;
    timeoutMs?: number;
    fetchImpl?: typeof fetch;
};

/**
 * Cliente do OpenRouter por-key (BYOK), com timeout via AbortSignal.
 * Erros são normalizados em ApiError e **nunca contêm a API key**.
 */
export function createOpenRouterClient(opts: ClientOptions): OpenRouterClient {
    const fetchImpl = opts.fetchImpl ?? fetch;
    const timeoutMs = opts.timeoutMs ?? 30_000;

    async function chat(params: ChatParams): Promise<ChatResult> {
        const body: Record<string, unknown> = { messages: params.messages };
        if (params.model) body.model = params.model;
        if (params.models) body.models = params.models;
        if (params.temperature !== undefined) body.temperature = params.temperature;
        if (params.maxTokens !== undefined) body.max_tokens = params.maxTokens;
        if (params.responseFormat === "json") {
            body.response_format = { type: "json_object" };
        }
        if (params.provider) body.provider = params.provider;
        if (params.plugins) body.plugins = params.plugins;

        let res: Response;
        try {
            res = await fetchImpl(CHAT_URL, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${opts.apiKey}`,
                    "Content-Type": "application/json",
                    ...(opts.httpReferer ? { "HTTP-Referer": opts.httpReferer } : {}),
                    ...(opts.title ? { "X-Title": opts.title } : {}),
                },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(timeoutMs),
            });
        } catch (e) {
            const name = (e as Error)?.name;
            if (name === "TimeoutError" || name === "AbortError") {
                throw new ApiError(504, "timeout", "O modelo não respondeu a tempo.");
            }
            throw new ApiError(502, "upstream_error", "Falha ao contatar o OpenRouter.");
        }

        if (!res.ok) {
            const detail = await safeErrorMessage(res);
            const rateLimited = res.status === 429;
            throw new ApiError(
                rateLimited ? 429 : 502,
                rateLimited ? "rate_limited" : "upstream_error",
                detail,
            );
        }

        const json = (await res.json()) as {
            model?: string;
            choices?: Array<{ message?: { content?: unknown } }>;
            usage?: ChatUsage;
        };
        const content = json.choices?.[0]?.message?.content;
        return {
            model: json.model ?? params.model ?? "desconhecido",
            content: typeof content === "string" ? content : String(content ?? ""),
            usage: json.usage,
        };
    }

    return { chat };
}

async function safeErrorMessage(res: Response): Promise<string> {
    try {
        const j = (await res.json()) as { error?: { message?: string } };
        return j.error?.message ?? `OpenRouter retornou status ${res.status}`;
    } catch {
        return `OpenRouter retornou status ${res.status}`;
    }
}
