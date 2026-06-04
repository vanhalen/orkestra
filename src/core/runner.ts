import type { ChatMessage, ChatUsage, OpenRouterClient } from "./openrouterClient";

export type RunFile = { filename: string; data: string };

export type RunParams = {
    prompt: string;
    /** Cadeia de fallback: tenta na ordem até um responder. */
    models: string[];
    files?: RunFile[];
    responseFormat?: "json";
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
};

export type RunAttempt = { model: string; ok: boolean; error?: string };

export type RunResult = {
    ok: boolean;
    answer: string | null;
    modelUsed: string | null;
    usage?: ChatUsage;
    latencyMs: number;
    attempts: RunAttempt[];
};

/** Monta as mensagens, anexando arquivos (PDF/imagem) quando houver. */
export function buildMessages(
    prompt: string,
    files?: RunFile[],
    systemPrompt?: string,
): ChatMessage[] {
    const messages: ChatMessage[] = [];
    if (systemPrompt) messages.push({ role: "system", content: systemPrompt });

    if (files?.length) {
        const content = [
            { type: "text", text: prompt },
            ...files.map((f) => ({
                type: "file",
                file: { filename: f.filename, file_data: f.data },
            })),
        ];
        messages.push({ role: "user", content });
    } else {
        messages.push({ role: "user", content: prompt });
    }
    return messages;
}

function messageOf(e: unknown): string {
    return e instanceof Error ? e.message : "erro desconhecido";
}

/**
 * Executa a tarefa percorrendo a cadeia de modelos: se um falha/dá timeout,
 * tenta o próximo. Nunca trava (cada chamada tem timeout no cliente) e nunca
 * lança — devolve `ok: false` com os `attempts` se todos falharem.
 */
export async function runChain(
    client: OpenRouterClient,
    params: RunParams,
    now: () => number = () => Date.now(),
): Promise<RunResult> {
    const messages = buildMessages(params.prompt, params.files, params.systemPrompt);
    const attempts: RunAttempt[] = [];
    const start = now();

    for (const model of params.models) {
        try {
            const res = await client.chat({
                model,
                messages,
                temperature: params.temperature,
                maxTokens: params.maxTokens,
                responseFormat: params.responseFormat,
            });
            attempts.push({ model, ok: true });
            return {
                ok: true,
                answer: res.content,
                modelUsed: res.model,
                usage: res.usage,
                latencyMs: now() - start,
                attempts,
            };
        } catch (e) {
            attempts.push({ model, ok: false, error: messageOf(e) });
        }
    }

    return {
        ok: false,
        answer: null,
        modelUsed: null,
        latencyMs: now() - start,
        attempts,
    };
}

export type ProbeResult = { model: string; ok: boolean; latencyMs: number };

/**
 * Probe curto para a validação opcional do recommend: roda um prompt mínimo em
 * cada finalista (em paralelo) e mede sucesso/latência reais. Nunca lança.
 */
export async function probeModels(
    client: OpenRouterClient,
    models: string[],
    prompt: string,
    now: () => number = () => Date.now(),
): Promise<ProbeResult[]> {
    return Promise.all(
        models.map(async (model): Promise<ProbeResult> => {
            const start = now();
            try {
                await client.chat({
                    model,
                    messages: buildMessages(prompt),
                    maxTokens: 16,
                });
                return { model, ok: true, latencyMs: now() - start };
            } catch {
                return { model, ok: false, latencyMs: now() - start };
            }
        }),
    );
}
