type Priced = { pricing: { prompt: number; completion: number } };

export function isFree(m: Priced): boolean {
    return m.pricing.prompt === 0 && m.pricing.completion === 0;
}

export function totalPerToken(m: Priced): number {
    return m.pricing.prompt + m.pricing.completion;
}

/** Chave de ordenação por custo: preço variável (negativo) vai para o fim. */
export function sortPrice(m: Priced): number {
    const total = totalPerToken(m);
    return total < 0 ? Number.POSITIVE_INFINITY : total;
}

function brl(n: number): string {
    return n.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

/** Custo de 1 milhão de tokens (entrada+saída): "grátis", "variável" ou "US$ X,XX". */
export function priceLabel(m: Priced): string {
    if (isFree(m)) return "grátis";
    const total = totalPerToken(m);
    if (total < 0) return "variável";
    return `US$ ${brl(total * 1_000_000)}`;
}

/** Preço de entrada e saída separados, por 1M tokens (ou null se grátis/variável). */
export function priceBreakdown(m: Priced): { input: string; output: string } | null {
    const total = totalPerToken(m);
    if (total <= 0) return null;
    return {
        input: `US$ ${brl(m.pricing.prompt * 1_000_000)}`,
        output: `US$ ${brl(m.pricing.completion * 1_000_000)}`,
    };
}
