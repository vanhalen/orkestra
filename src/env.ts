/**
 * Configuração do SERVIDOR Orkestra.
 *
 * Não há segredos de usuário aqui: a API key do OpenRouter é BYOK (enviada por
 * requisição no header `Authorization`), nunca lida do ambiente. Todas as
 * variáveis abaixo têm default, então a aplicação sobe sem `.env`.
 */
export type Env = {
    port: number;
    host: string;
    /** Origem permitida no CORS (a SPA). */
    webOrigin: string;
    /** Timeout por chamada a modelo no OpenRouter (ms). */
    requestTimeoutMs: number;
    /** Headers enviados ao OpenRouter (defaults; podem ser sobrescritos por requisição). */
    httpReferer: string;
    title: string;
};

function num(name: string, fallback: number): number {
    const raw = process.env[name];
    if (raw === undefined || raw === "") return fallback;
    const parsed = Number(raw);
    if (Number.isNaN(parsed)) {
        throw new Error(
            `Variável de ambiente ${name} inválida: "${raw}" não é um número.`,
        );
    }
    return parsed;
}

function str(name: string, fallback: string): string {
    const raw = process.env[name];
    return raw === undefined || raw === "" ? fallback : raw;
}

export function loadEnv(): Env {
    return {
        port: num("PORT", 3000),
        host: str("HOST", "0.0.0.0"),
        webOrigin: str("WEB_ORIGIN", "*"),
        requestTimeoutMs: num("REQUEST_TIMEOUT_MS", 30_000),
        httpReferer: str("HTTP_REFERER", "http://localhost:3000"),
        title: str("TITLE", "Orkestra"),
    };
}
