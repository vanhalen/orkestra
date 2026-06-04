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

- [ ] `core/selector.ts`: derivar requisitos da tarefa → filtrar → pontuar por `priority` → `{ best, shortlist, rationale }`.
- [ ] Suporte às prioridades: `cheapest`, `fastest`, `largest_context`, `balanced`.
- [ ] Validação opcional (`validate:true`): probe curto nos finalistas via `runner` (depende da Sprint 4 — usar stub e religar).
- [ ] `routes/recommend.ts`: `POST /v1/recommend` + schema Zod.
- [ ] Testes: filtros por capacidade (PDF→file, JSON→structured_outputs), ordenação por preço, empates, lista vazia.

## Sprint 4 — Execução & comparação (confiabilidade)
> Rodar de verdade, sem nunca travar.

- [ ] `core/runner.ts`: cadeia de fallback + timeout por modelo; suporte a `files`/PDF; `responseFormat`; retorna `attempts[]` + `modelUsed`.
- [ ] `core/comparator.ts`: paralelo com `Promise.allSettled`, isola erro por modelo, anexa métricas.
- [ ] `core/metrics.ts`: latência, custo (pricing×usage), tokens.
- [ ] `routes/run.ts`: `POST /v1/run` (`models` OU `auto`).
- [ ] `routes/compare.ts`: `POST /v1/compare`.
- [ ] Religar a validação do `selector` ao `runner` real.
- [ ] Testes de confiabilidade: 1º modelo falha → usa o próximo; timeout não trava; 1 modelo quebrado no compare não derruba os outros.

## Sprint 5 — Performance, usabilidade & docs da API
> A API "lapidada": rápida, documentada, fácil de consumir.

- [ ] `@fastify/swagger` + UI: OpenAPI a partir dos schemas; exemplos por rota.
- [ ] Revisar timeouts/concorrência; medir p95 do `compare`.
- [ ] Teste de carga com `autocannon`; documentar limites.
- [ ] Revisar mensagens de erro e consistência dos contratos ([API.md](API.md)).
- [ ] Atualizar `README.md` para a v2 (rotas novas, BYOK).

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
