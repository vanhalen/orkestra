import { describe, it, expect } from "vitest";
import { compareModels } from "../src/core/comparator";
import { ApiError } from "../src/core/errors";
import { fakeClient, ok } from "./fixtures/fakeClient";

describe("compareModels (isolamento de erro)", () => {
    it("um modelo falha sem derrubar os outros", async () => {
        const client = fakeClient((model) => {
            if (model === "quebrado") throw new ApiError(502, "upstream_error", "falhou");
            return ok(model);
        });
        const items = await compareModels(
            client,
            { prompt: "q", models: ["a", "quebrado", "c"] },
            () => 0,
        );

        expect(items).toHaveLength(3);
        const broken = items.find((i) => i.model === "quebrado");
        expect(broken?.error).toBe("falhou");
        expect(broken?.content).toBeNull();
        expect(items.filter((i) => i.content !== null)).toHaveLength(2);
    });
});
