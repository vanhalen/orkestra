import { describe, it, expect } from "vitest";

// Smoke test: garante que a toolchain de testes (Vitest + TS) está de pé.
// Testes reais por funcionalidade chegam nas próximas sprints.
describe("toolchain", () => {
    it("executa testes TypeScript", () => {
        expect(1 + 1).toBe(2);
    });
});
