import { describe, it, expect } from "vitest";
import { runChain, buildMessages, probeModels } from "../src/core/runner";
import { ApiError } from "../src/core/errors";
import { fakeClient, ok } from "./fixtures/fakeClient";

describe("runChain (fallback + nunca trava)", () => {
    it("usa o próximo modelo quando o primeiro falha", async () => {
        const client = fakeClient((model) => {
            if (model === "ruim") throw new ApiError(502, "upstream_error", "caiu");
            return ok(model, "ok!");
        });
        const r = await runChain(
            client,
            { prompt: "oi", models: ["ruim", "bom"] },
            () => 0,
        );

        expect(r.ok).toBe(true);
        expect(r.modelUsed).toBe("bom");
        expect(r.answer).toBe("ok!");
        expect(r.attempts).toEqual([
            { model: "ruim", ok: false, error: "caiu" },
            { model: "bom", ok: true },
        ]);
    });

    it("ok:false quando todos falham (sem lançar)", async () => {
        const client = fakeClient(() => {
            throw new ApiError(504, "timeout", "demorou");
        });
        const r = await runChain(client, { prompt: "oi", models: ["a", "b"] });

        expect(r.ok).toBe(false);
        expect(r.answer).toBeNull();
        expect(r.attempts).toHaveLength(2);
        expect(r.attempts.every((a) => !a.ok)).toBe(true);
    });
});

describe("buildMessages", () => {
    it("anexa arquivos como content do tipo file", () => {
        const msgs = buildMessages("leia", [{ filename: "n.pdf", data: "data:x" }]);
        const content = msgs[0].content as Array<{
            type: string;
            file?: { filename: string };
        }>;
        expect(content[1].type).toBe("file");
        expect(content[1].file?.filename).toBe("n.pdf");
    });
});

describe("probeModels", () => {
    it("mede ok/falha por modelo sem lançar", async () => {
        const client = fakeClient((model) => {
            if (model === "x") throw new ApiError(504, "timeout", "t");
            return ok(model);
        });
        const probes = await probeModels(client, ["x", "y"], "ping", () => 0);
        expect(probes.find((p) => p.model === "x")?.ok).toBe(false);
        expect(probes.find((p) => p.model === "y")?.ok).toBe(true);
    });
});
