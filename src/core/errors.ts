/**
 * Erro de aplicação com código e status HTTP. O errorHandler converte em
 * `{ error: { code, message } }`. Use para falhas esperadas (key inválida,
 * upstream fora, timeout...).
 */
export class ApiError extends Error {
    constructor(
        public readonly statusCode: number,
        public readonly code: string,
        message: string,
    ) {
        super(message);
        this.name = "ApiError";
    }
}
