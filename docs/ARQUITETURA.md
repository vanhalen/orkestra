# Arquitetura

Desenho técnico do Orkestra v2. Decisões em [DECISOES.md](DECISOES.md); capacidades do OpenRouter em [OPENROUTER.md](OPENROUTER.md).

## Visão em camadas

```
Cliente (dev / SPA Vue)
   │  Authorization: Bearer sk-or-...   (BYOK)
   ▼
┌─────────────────────────────────────────────┐
│ Fastify app                                  │
│  plugins:  auth · cors · helmet · rateLimit  │  ← camada de segurança
│            errorHandler                      │
│  routes:   /v1/models · /v1/recommend        │  ← contratos HTTP (validação de schema)
│            /v1/run · /v1/compare · /health    │
├─────────────────────────────────────────────┤
│ core (regra de negócio, sem HTTP):           │
│  catalog · selector · runner · comparator    │
│  openrouterClient · metrics                  │
└─────────────────────────────────────────────┘
   │  repassa a key por requisição (nunca guarda)
   ▼
OpenRouter API
```

**Regra de ouro:** `routes/` só fala HTTP (parse, validação, status). Toda lógica vive em `core/` e é testável sem servidor. A key do usuário é passada como argumento para o `core` a cada chamada — nunca é variável global nem estado.

## Estrutura de pastas

```
src/
├── index.ts                  # bootstrap: cria e sobe o servidor
├── server.ts                 # monta o Fastify, registra plugins e rotas
├── env.ts                    # carrega/valida config do SERVIDOR (PORT, timeouts, CORS origin) — sem segredos de usuário
├── types.ts                  # tipos compartilhados
├── plugins/
│   ├── auth.ts               # extrai/valida a key BYOK do header → request.openRouterKey
│   ├── errorHandler.ts       # resposta de erro uniforme { error: { code, message } }
│   ├── security.ts           # helmet + cors + rate-limit + limite de body
│   └── ...
├── routes/
│   ├── models.ts             # GET  /v1/models
│   ├── recommend.ts          # POST /v1/recommend
│   ├── run.ts                # POST /v1/run
│   ├── compare.ts            # POST /v1/compare
│   └── health.ts             # GET  /health
├── core/
│   ├── openrouterClient.ts   # cria client por-key; chat.send com timeout (AbortController)
│   ├── catalog.ts            # busca + cacheia /models; normaliza; helpers de filtro/capacidade
│   ├── selector.ts           # MOTOR DE RECOMENDAÇÃO: requisitos → filtra → pontua → ordena
│   ├── runner.ts             # executa tarefa com cadeia de fallback + timeout por modelo
│   ├── comparator.ts         # roda N modelos em paralelo, isola erros, coleta métricas
│   └── metrics.ts            # latência, custo (a partir de pricing+usage), tokens
└── schemas/                  # schemas de validação (Zod) por rota
web/                          # SPA Vue 3 + Vite + Tailwind (Sprint 6)
tests/                        # Vitest (unit + integração)
docs/                         # estes documentos
```

## Componentes do core

### `openrouterClient`
Fábrica fina sobre `@openrouter/sdk`. Recebe a **key do request** e devolve um client. Centraliza:
- headers (`httpReferer`, `xTitle`);
- **timeout** via `AbortController` (config `REQUEST_TIMEOUT_MS`);
- normalização de erro (`extractError`) — sem vazar a key.

Único ponto que fala com o OpenRouter. Todos os outros módulos dependem dele.

### `catalog`
- `fetchModels()` — `GET /api/v1/models` (público), com **cache em memória + TTL**.
- `normalize()` — achata o shape do OpenRouter no tipo interno `OrkModel` (id, name, pricing numérico, contextLength, inputModalities, capabilities { tools, json, web, file, image }).
- `filter(models, requirements)` — aplica capacidades exigidas + restrições (free, maxPrice, minContext).
- Helpers de capacidade reutilizados pelo `selector` e pela rota `GET /v1/models`.

### `selector` (motor de recomendação — ADR-003)
Função pura, sem HTTP, fácil de testar:
1. **Deriva requisitos** da tarefa + flags (ex.: `inputs:["pdf"]` → exige `file`; `wantJson` → exige `structured_outputs`; `minContext`).
2. **Filtra** o catálogo por requisitos + restrições.
3. **Pontua/ordena** pela `priority` (`cheapest` → menor `pricing.prompt+completion`; `fastest` → throughput/latency via provider sort; `largest_context`; `balanced`).
4. Retorna `{ best, shortlist, rationale }`.
5. Se `validate: true`, chama o `runner` com um **probe curto** nos finalistas (paralelo, timeout) e reordena pelo sucesso/latência real.

### `runner` (execução + confiabilidade)
- Recebe uma **cadeia de modelos** (explícita ou vinda do `selector`) e executa a tarefa.
- Usa o parâmetro `models[]` do OpenRouter (fallback nativo) **e** um laço de fallback no cliente com **timeout por modelo** — se um estoura/falha, tenta o próximo. **Nunca trava.**
- Suporta entrada de **PDF/arquivo** (content `file` + plugin `file-parser`).
- Retorna `{ answer, modelUsed, usage, attempts[] }`.

### `comparator`
- Roda os modelos pedidos **em paralelo** (`Promise.allSettled`) com a mesma pergunta.
- **Isola erros**: a falha/timeout de um modelo vira um resultado com `error`, sem derrubar os demais.
- Anexa métricas por modelo (`metrics`).

### `metrics`
- `latencyMs` (medido), `usage` (do OpenRouter), `costUsd` (estimado de `pricing` × `usage`).

## Camada de segurança (ADR-001)

| Preocupação | Mecanismo |
|-------------|-----------|
| Key do usuário | BYOK no header; validação de formato (`sk-or-...`); **redação** em logs/erros; nunca persistida nem ecoada |
| Headers | `@fastify/helmet` |
| CORS | `@fastify/cors` restrito à origem da SPA (config `WEB_ORIGIN`) |
| Abuso | `@fastify/rate-limit` por IP |
| Payload | limite de body (`bodyLimit`) — atenção a PDF base64 |
| Input | validação por schema (Zod) em toda rota; rejeita malformado com 400 |
| Upstream | timeout em toda chamada; sem retry infinito |

## Confiabilidade ("nunca travar")

- **Timeout global** por request + **timeout por modelo** no `runner`/`comparator`.
- **Fallback**: `models[]` nativo do OpenRouter + laço no cliente.
- **Isolamento de falha**: `Promise.allSettled` na comparação.
- Erros sempre viram resposta estruturada — nunca exceção não tratada.

## Configuração (`env.ts`) — só do servidor, sem segredos de usuário

`PORT`, `HOST`, `WEB_ORIGIN` (CORS), `REQUEST_TIMEOUT_MS`, `CATALOG_TTL_MS`, `RATE_LIMIT_MAX`, `HTTP_REFERER`/`TITLE` (defaults para os headers do OpenRouter), `MAX_BODY_BYTES`.
A `OPENROUTER_API_KEY` **sai** do `.env` do servidor (era hardcoded na v1) — agora é sempre BYOK. Uma key opcional só para `GET /v1/models` (que é público) é dispensável.

## Tooling de qualidade

- `tsc --noEmit` (adicionar `typescript` como devDep — hoje não existe).
- ESLint + Prettier.
- Vitest + (inject do Fastify / `nock` para mockar o OpenRouter).
- Scripts npm: `dev`, `typecheck`, `lint`, `test`, `build` (futuro), `start`.
