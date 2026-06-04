# Orkestra

> Camada de **seleção, comparação e recomendação de LLMs** sobre o [OpenRouter](https://openrouter.ai/) — você traz sua própria API key (BYOK).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-orange)

O Orkestra não hospeda modelos: usa o catálogo e o roteamento do OpenRouter e adiciona a inteligência para responder *"qual modelo devo usar para esta tarefa, com este orçamento e estas restrições?"*.

**Cenário típico:** você precisa extrair informação de um PDF e quer o modelo **mais barato e mais rápido** que dê conta. Você descreve a tarefa + restrições e o Orkestra retorna o modelo ideal — pronto para uso ou já com a resposta executada.

## 🚦 Status

Projeto em desenvolvimento ativo. A v2 foi construída do zero seguindo o plano em [`docs/`](docs/); o protótipo inicial (rotas `/chat/*` com key via `.env`) foi **aposentado** nessa reconstrução.

- **API pronta:** **BYOK por requisição**, catálogo `GET /v1/models` e as rotas `recommend` / `run` / `compare`, com segurança (helmet/cors/rate-limit), fallback + timeout e docs OpenAPI em `/docs`.
- **Em construção:** a tela de divulgação em Vue (cliente visual da API). Ver [`docs/ROADMAP.md`](docs/ROADMAP.md).

Para a visão e o plano completos, veja [`docs/VISAO.md`](docs/VISAO.md) e [`docs/ROADMAP.md`](docs/ROADMAP.md).

## 📚 Documentação

| Documento | Conteúdo |
|-----------|----------|
| [docs/VISAO.md](docs/VISAO.md) | Produto, público e os verbos recommend / run / compare |
| [docs/ARQUITETURA.md](docs/ARQUITETURA.md) | Estrutura, módulos, segurança e confiabilidade |
| [docs/API.md](docs/API.md) | Contrato das rotas (v1 da nova API) |
| [docs/OPENROUTER.md](docs/OPENROUTER.md) | Capacidades do OpenRouter utilizadas |
| [docs/DECISOES.md](docs/DECISOES.md) | Decisões de arquitetura (ADR) |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Sprints e tarefas |

## 🚀 Como executar

### Requisitos

- **Node.js 22+** (mínimo 20)
- Para usar as rotas que chamam o OpenRouter (próximas sprints): uma **API key** do [OpenRouter](https://openrouter.ai/settings/keys), enviada **por requisição** (BYOK) — não vai no `.env`.

### Passos

```bash
npm install
cp .env.example .env      # opcional: todas as variáveis têm default
npm run dev               # sobe a API em http://localhost:3000 (porta do .env)
```

Verifique que está no ar:

```bash
curl http://localhost:3000/health
# → {"status":"ok"}
```

O `.env` configura **apenas o servidor** (sem segredos de usuário). Todas as variáveis são opcionais:

| Variável | Default | Descrição |
|----------|---------|-----------|
| `PORT` | `3000` | Porta do servidor |
| `HOST` | `0.0.0.0` | Host de bind |
| `WEB_ORIGIN` | `*` | Origem permitida no CORS (a SPA) |
| `REQUEST_TIMEOUT_MS` | `30000` | Timeout por chamada a modelo |
| `HTTP_REFERER` / `TITLE` | — | Headers enviados ao OpenRouter |

> A API key do OpenRouter é **BYOK**: enviada no header `Authorization` por requisição, nunca armazenada — ver [ADR-001](docs/DECISOES.md). O contrato das rotas da v2 está em [docs/API.md](docs/API.md).

### Scripts

```bash
npm run dev          # desenvolvimento (watch)
npm run typecheck    # checagem de tipos (tsc --noEmit)
npm run lint         # ESLint
npm run format       # Prettier
npm test             # Vitest
npm run loadtest     # teste de carga (autocannon) contra /health (servidor no ar)
```

## 🔌 API

Documentação interativa (OpenAPI) em **`/docs`** com o servidor no ar. Rotas que chamam o OpenRouter exigem o header `Authorization: Bearer sk-or-...`.

| Rota | Auth | Descrição |
|------|:----:|-----------|
| `GET /health` | — | Liveness |
| `GET /v1/models` | — | Catálogo filtrável (`?supports=file,json&free=true&maxPrice=…&minContext=…&q=…`) |
| `POST /v1/recommend` | opcional¹ | Melhor modelo para a tarefa (heurística; `validate:true` roda probe real) |
| `POST /v1/run` | ✔ | Executa a tarefa com fallback e devolve resposta + modelo usado (+ PDF) |
| `POST /v1/compare` | ✔ | Roda vários modelos em paralelo, lado a lado |

¹ `recommend` só exige key quando `validate: true`.

```bash
# Recomendar o modelo mais barato que leia PDF e devolva JSON
curl -X POST http://localhost:3000/v1/recommend -H "Content-Type: application/json" \
  -d '{"task":"extrair campos de nota fiscal","priority":"cheapest","requirements":{"inputs":["pdf"],"wantJson":true}}'

# Executar (auto escolhe + roda, com fallback)
curl -X POST http://localhost:3000/v1/run \
  -H "Authorization: Bearer sk-or-..." -H "Content-Type: application/json" \
  -d '{"prompt":"Resuma este texto em 1 frase.","auto":{"priority":"fastest"}}'

# Comparar modelos lado a lado
curl -X POST http://localhost:3000/v1/compare \
  -H "Authorization: Bearer sk-or-..." -H "Content-Type: application/json" \
  -d '{"question":"Melhor estratégia de cache para API REST?","models":["google/gemini-2.5-flash","anthropic/claude-3.5-haiku"]}'
```

Contrato completo em [docs/API.md](docs/API.md).

## 🛠 Tecnologias

- **TypeScript** + **Node.js 22**
- [Fastify](https://fastify.dev/) 5
- [OpenRouter SDK](https://openrouter.ai/docs)
- [tsx](https://github.com/privatenumber/tsx) (execução/watch em desenvolvimento)
- _v2:_ Vue 3 + Vite + Tailwind (tela de divulgação)

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja o [CONTRIBUTING.md](CONTRIBUTING.md). Para mudanças não triviais, abra uma issue antes.

## ⚠️ Segurança

- **BYOK:** a API key do OpenRouter é enviada por requisição e nunca é armazenada nem logada pelo servidor. No frontend, fica só no navegador (`sessionStorage`).
- Nunca cole sua API key em issues, logs ou prints. O `.env` (apenas config de servidor) não é versionado.
- Modelos `:free` podem sofrer rate limit; erros individuais aparecem por modelo sem derrubar os demais.

## 📄 Licença

[MIT](LICENSE) © 2026 Rodrigo Chagas
