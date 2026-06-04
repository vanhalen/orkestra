# Roadmap — Sprints & Tarefas

Plano incremental. **A API vem primeiro** (segura e usável); a tela de divulgação depois, como cliente visual. Cada sprint entrega algo testável, idealmente uma tarefa por vez.

Legenda: `[ ]` a fazer · `[~]` em andamento · `[x]` feito.

---

## Sprint 0 — Fundação & tooling
> Preparar o terreno: ferramentas de qualidade e reestruturação base. Sem mudar comportamento ainda.

- [x] Adicionar `typescript` como devDep e script `typecheck` (`tsc --noEmit`).
- [x] Configurar ESLint + Prettier (padrão do projeto: PT-BR, 4 espaços).
- [x] Adicionar Vitest + script `test`; um teste smoke.
- [x] Definir validação de input: **Zod** + type-provider (ADR-004 → Zod). Migrado para **ESM** (`"type": "module"`).
- [x] Reestruturar `src/` conforme [ARQUITETURA.md](ARQUITETURA.md) (`env.ts`, `server.ts`, `index.ts`, `routes/`). Protótipo v1 (`config.ts`, `openrouterService.ts`, rotas `/chat`) aposentado.
- [x] `env.ts`: config só do servidor; **`OPENROUTER_API_KEY` removida** (passa a ser BYOK).
- [x] Rota `GET /health` + teste.
- [x] Atualizar `.env.example` (sem a key de usuário).

## Sprint 1 — Núcleo OpenRouter + catálogo
> Falar com o OpenRouter de forma centralizada e expor o catálogo.

- [→] `core/openrouterClient.ts`: **movido para a Sprint 4** (só necessário ao chamar modelos; `/models` é público).
- [x] `core/catalog.ts`: `fetchRawModels` (cache + TTL), `normalizeModel` (→ `OrkModel`), `filterModels`, helpers de capacidade.
- [x] `core/types.ts`: `OrkModel`, `RawModel`, `Capability`, `CatalogFilter`.
- [x] `routes/models.ts`: `GET /v1/models` com filtros (`supports`, `free`, `maxPrice`, `minContext`, `q`).
- [x] Testes: normalização, filtros e cache/TTL do catálogo + rota (15 testes, fixture compartilhada).

## Sprint 2 — Segurança (BYOK) & hardening
> A camada de segurança antes de qualquer rota que gaste tokens.

- [x] `plugins/auth.ts`: extrai/valida `Authorization: Bearer`, formato `sk-or-`, injeta `request.openRouterKey`; `requireApiKey` preHandler.
- [x] `plugins/security.ts`: `@fastify/helmet`, `@fastify/cors` (origem da SPA via `WEB_ORIGIN`), `@fastify/rate-limit`, `bodyLimit`.
- [x] `plugins/errorHandler.ts`: resposta de erro uniforme `{ error: { code, message } }` + `ApiError`.
- [x] Garantir que a key nunca aparece em log/erro/resposta.
- [x] Testes de segurança: key ausente/malformada → 401; rate limit → 429; key não vaza; catálogo público.

## Sprint 3 — Motor de recomendação (híbrido)
> O diferencial do Orkestra. Função pura, muito testável.

- [x] `core/selector.ts`: derivar requisitos da tarefa → filtrar → pontuar por `priority` → `{ best, shortlist, rationale }`.
- [x] Suporte às prioridades: `cheapest`, `fastest`, `largest_context`, `balanced`.
- [→] Validação opcional (`validate:true`): probe curto nos finalistas via `runner` — **wiring na Sprint 4** (depende do runner).
- [x] `routes/recommend.ts`: `POST /v1/recommend` + schema Zod (`schemas/recommend.ts`, reusado pelo `auto` do /v1/run).
- [x] Testes: filtros por capacidade, ordenação por prioridade, candidates, lista vazia (404), body inválido (400).

## Sprint 4 — Execução & comparação (confiabilidade)
> Rodar de verdade, sem nunca travar.

- [x] `core/openrouterClient.ts`: client por-key (BYOK) + timeout (`AbortSignal`) + erro normalizado (sem vazar key).
- [x] `core/runner.ts`: cadeia de fallback + timeout por modelo; suporte a `files`/PDF; `responseFormat`; `attempts[]` + `modelUsed`; `probeModels`.
- [x] `core/comparator.ts`: paralelo com `Promise.allSettled`, isola erro por modelo.
- [x] `core/metrics.ts`: custo (pricing×usage).
- [x] `routes/run.ts`: `POST /v1/run` (`models` OU `auto`) + `files`/PDF.
- [x] `routes/compare.ts`: `POST /v1/compare`.
- [x] Religar a validação (`validate:true`) do recommend ao `probeModels` real.
- [x] Testes de confiabilidade: fallback usa o próximo; todos falham → 502 com attempts; compare isola falha; run/compare exigem key.

## Sprint 5 — Performance, usabilidade & docs da API
> A API "lapidada": rápida, documentada, fácil de consumir.

- [x] `@fastify/swagger` + UI: OpenAPI a partir dos schemas Zod; UI em `/docs`, spec em `/docs/json`.
- [x] Revisar timeouts/concorrência (timeout por modelo no client; compare paralelo; rate limit por IP).
- [x] Teste de carga com `autocannon` (script `loadtest`): ~10.9k req/s, p99 ~5ms em `/health`; rate limit rejeita o excedente com 429.
- [x] Mensagens de erro padronizadas (`{ error: { code, message } }`) e contrato em [API.md](API.md).
- [x] `README.md` atualizado para a v2 (rotas, BYOK, `/docs`, scripts).

## Sprint 6 — Frontend (Vue 3 + Vite + Tailwind)
> Cliente visual da API. Responsivo e usável.

- [ ] Scaffold `web/` (Vite + Vue 3 + Tailwind); proxy de dev p/ a API.
- [ ] `ApiKeyForm`: cola a key, guarda em `sessionStorage`, envia no header.
- [ ] `ModelPicker`: consome `GET /v1/models`, busca/filtra (free, maxPrice, capacidades).
- [ ] Tela **Comparar**: escolhe modelos + pergunta → grade de respostas + métricas.
- [ ] Tela **Recomendar/Executar**: tarefa + filtros (ex.: "mais barato") → modelo escolhido + resposta.
- [ ] Estados de loading/erro; responsividade; acessibilidade básica.

## Sprint 7 — Polimento & divulgação
- [ ] Smoke E2E (API + web).
- [ ] Notas de deploy (servir estáticos do build pela API ou hospedar separado).
- [ ] Screenshots/GIF, README final, roteiro de demo.

---

## Ordem de dependência (resumo)
`S0 → S1 → S2 → S3 ↔ S4 → S5 → S6 → S7`
(S3 e S4 têm um vai-e-volta na validação opcional do selector.)

## Fluxo de trabalho
- Uma tarefa por vez; ao concluir, marcar `[x]` aqui.
- Decisões arquiteturais relevantes → registrar como ADR em [DECISOES.md](DECISOES.md).
