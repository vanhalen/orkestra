# Orkestra — Visão do Produto

## O que é

Orkestra é uma **camada de seleção, comparação e recomendação de LLMs** construída sobre o [OpenRouter](https://openrouter.ai/). Ele não hospeda modelos: usa o catálogo e o roteamento do OpenRouter e adiciona inteligência para responder à pergunta *"qual modelo devo usar para esta tarefa, com este orçamento e estas restrições?"*.

## Para quem

1. **Desenvolvedores (via API)** — durante um desenvolvimento, em vez de chutar qual LLM usar, chamam o Orkestra com a descrição da tarefa + restrições (mais barato, mais rápido, precisa ler PDF, precisa devolver JSON...) e recebem o modelo ideal — pronto para uso ou já com a resposta executada.
2. **Curiosos / avaliadores (via tela de divulgação)** — uma SPA onde a pessoa cola a própria API key do OpenRouter, escolhe modelos, aplica filtros ("mais barato"), envia uma pergunta e vê a resposta + o modelo escolhido + métricas.

## Princípio central: BYOK (Bring Your Own Key)

Cada requisição carrega a **API key do OpenRouter do próprio usuário** no header. O Orkestra **apenas repassa** a key ao OpenRouter — nunca persiste, nunca loga, nunca custodia. O servidor é **stateless** em relação a segredos. No frontend a key vive só no `sessionStorage` do navegador.

## Os três verbos do Orkestra

| Verbo | Rota | O que faz |
|-------|------|-----------|
| **Recomendar** | `POST /v1/recommend` | Dada uma tarefa + restrições, escolhe o melhor modelo (heurística sobre o catálogo; validação opcional rodando um probe). Retorna o escolhido + shortlist + justificativa. |
| **Executar** | `POST /v1/run` | Executa a tarefa de fato e devolve a resposta + qual modelo respondeu. Aceita um modelo fixo, uma cadeia de fallback, ou `auto` (recomenda internamente e roda). Suporta entrada de PDF/arquivo. |
| **Comparar** | `POST /v1/compare` | Roda N modelos escolhidos em paralelo com a mesma pergunta e devolve respostas + métricas (latência, custo, tokens) lado a lado. |

Mais o **catálogo**: `GET /v1/models` — lista normalizada e filtrável dos modelos do OpenRouter, que alimenta tanto a recomendação quanto o seletor do frontend.

## Princípios do projeto

- Código **simples, legível e bem abstraído**; nada repetitivo, tudo reutilizável.
- **Nunca travar**: toda chamada a modelo tem timeout. Se uma LLM não responde, o Orkestra registra o erro e **tenta a próxima** (fallback). Numa comparação, a falha de um modelo não derruba os outros.
- **API primeiro**, segura por padrão; a tela de divulgação é apenas um cliente visual da API.
- Interface **responsiva** e com boa usabilidade.
- Decisões arquiteturais relevantes ficam registradas como **ADR** (ver [DECISOES.md](DECISOES.md)).

## Stack escolhida

- **API:** TypeScript + Node 22 + Fastify 5 + `@openrouter/sdk`.
- **Frontend:** Vue 3 + Vite + Tailwind (SPA em `/web`).
- **Qualidade:** Vitest (testes), ESLint + Prettier, `tsc --noEmit` (type-check).

Ver [ROADMAP.md](ROADMAP.md) para as sprints, [ARQUITETURA.md](ARQUITETURA.md) para o desenho técnico e [API.md](API.md) para o contrato das rotas.
