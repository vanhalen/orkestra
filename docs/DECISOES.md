# Decisões de Arquitetura (ADR)

Registro curto das decisões arquiteturais (ADR — Architecture Decision Records). Cada nova decisão relevante deve ser adicionada aqui conforme for tomada, com contexto e alternativas descartadas.

---

## ADR-001 — Segurança da API key: BYOK por requisição

**Status:** Aceito · **Data:** 2026-06-04

**Contexto.** O Orkestra usa a API key do OpenRouter do usuário. Como a ferramenta pode ser pública (tela de divulgação), precisamos definir como a key trafega.

**Decisão.** **BYOK (Bring Your Own Key) por requisição.** A key vem no header `Authorization: Bearer sk-or-...` em toda chamada. O backend valida o formato, repassa ao OpenRouter e **nunca persiste, loga ou armazena**. Servidor stateless quanto a segredos. No frontend, a key fica só no `sessionStorage`.

**Alternativas descartadas.** Sessão temporária no servidor (passaria a custodiar segredos) e key criptografada em repouso (over-engineering sem contas de usuário).

**Consequências.** Camada de auth simples e segura; o cliente reenvia a key a cada chamada; precisamos garantir redação da key em logs/erros e nunca ecoá-la em respostas.

---

## ADR-002 — Frontend: Vue 3 + Vite + Tailwind

**Status:** Aceito · **Data:** 2026-06-04

**Decisão.** A tela de divulgação é uma **SPA em Vue 3 + Vite + Tailwind**, em `/web`, consumindo a API por `fetch`. É um cliente visual da API — não contém regra de negócio.

**Alternativas descartadas.** HTML/JS puro (menos trabalho de build, mas pior usabilidade/responsividade) e React (equivalente; escolha por preferência).

**Consequências.** `/web` é um subprojeto com build próprio; a API serve apenas JSON (e, em produção, opcionalmente os estáticos do build).

---

## ADR-003 — Motor de recomendação: híbrido (heurística + validação opcional)

**Status:** Aceito · **Data:** 2026-06-04

**Decisão.** A rota `recommend` usa uma **heurística sobre o catálogo `/models`** (filtra por capacidades exigidas + restrições, ordena pela prioridade) por padrão — **rápida, determinística e sem gastar tokens**. Uma flag opcional `validate: true` roda um probe curto nos finalistas para confirmar latência/sucesso reais antes de decidir.

**Alternativas descartadas.** Heurística pura (nunca valida a resposta real) e empírica sempre (gasta tokens da key do usuário em toda recomendação).

**Consequências.** Barato por padrão, preciso sob demanda. Exige um `runner` reutilizável (mesmo motor usado por `run` e pela validação).

---

## ADR-004 — (template para próximas decisões)

**Status:** Proposto · **Data:** —

Decisões em aberto, a definir no início das sprints correspondentes (não bloqueiam o planejamento):

- **Validação de input:** JSON Schema nativo do Fastify vs. **Zod** (+ `fastify-type-provider-zod`). _Inclinação: Zod, por tipos compartilhados e mensagens claras._
- **Cache do catálogo `/models`:** em memória com TTL (simples) vs. nenhum. _Inclinação: memória + TTL configurável._
- **Docs da API:** `@fastify/swagger` (OpenAPI) — incluir já na Sprint 5.
- **Teste de carga:** `autocannon`.
