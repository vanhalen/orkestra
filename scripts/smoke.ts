/**
 * Smoke E2E: sobe o servidor em processo e exercita as rotas públicas contra o
 * catálogo real do OpenRouter (sem API key). Uso: `npm run smoke`.
 */
import { loadEnv } from "../src/env";
import { buildServer } from "../src/server";

const app = buildServer(loadEnv());
await app.ready();

function check(label: string, ok: boolean, detail = "") {
    console.log(`${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
    if (!ok) process.exitCode = 1;
}

const health = await app.inject({ url: "/health" });
check("GET /health", health.statusCode === 200, health.body);

const models = await app.inject({ url: "/v1/models?free=true" });
const modelsBody = models.json() as { count: number };
check(
    "GET /v1/models?free=true",
    models.statusCode === 200 && modelsBody.count > 0,
    `${modelsBody.count} modelos grátis`,
);

const rec = await app.inject({
    method: "POST",
    url: "/v1/recommend",
    payload: {
        task: "extrair dados de PDF",
        requirements: { inputs: ["pdf"] },
        priority: "cheapest",
    },
});
const recBody = rec.json() as { best?: { id: string } };
check(
    "POST /v1/recommend (PDF, cheapest)",
    rec.statusCode === 200 && Boolean(recBody.best),
    recBody.best?.id,
);

const noKey = await app.inject({
    method: "POST",
    url: "/v1/run",
    payload: { prompt: "oi", models: ["x"] },
});
check("POST /v1/run sem key → 401", noKey.statusCode === 401);

await app.close();
console.log("\nSmoke concluído.");
