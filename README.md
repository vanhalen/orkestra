# Orkestra

API em Node.js para comparar LLMs via [OpenRouter](https://openrouter.ai/). O projeto oferece dois fluxos distintos: deixar o OpenRouter **recomendar** o melhor modelo por critério (preço, throughput, latência) ou **comparar manualmente** as respostas dos modelos que você escolher.

## ⭐ Arquivo principal

A lógica de integração com o OpenRouter está em:

- [`src/openrouterService.ts`](src/openrouterService.ts) — recomendação (`recommend`) e comparativo (`compareModels`)
- [`src/config.ts`](src/config.ts) — modelos, critérios de roteamento e variáveis de ambiente

## 📁 Estrutura do projeto

```text
.
├── src/
│   ├── index.ts              # Sobe o servidor e dispara testes locais (inject)
│   ├── server.ts             # Rotas Fastify
│   ├── openrouterService.ts  # Chamadas à API OpenRouter
│   └── config.ts             # Configuração central
├── .env.example
├── package.json
└── tsconfig.json
```

### Descrição dos arquivos

- `src/index.ts` — Ponto de entrada da aplicação
- `src/server.ts` — Endpoints HTTP (`/chat/recommend` e `/chat/compare`)
- `src/openrouterService.ts` — Regras de negócio e chamadas à API
- `src/config.ts` — Listas de modelos, prompts e preferências de roteamento

---

## 🚀 Como executar

### Requisitos

- **Node.js** 20 ou superior (recomendado: 22+)
- Conta e **API key** no [OpenRouter](https://openrouter.ai/settings/keys)

### 1. Instale as dependências

```bash
npm install
```

### 2. Configure o ambiente

Duplique o `.env.example` e renomeie para `.env`:

```bash
cp .env.example .env
```

Preencha as variáveis:

```env
OPENROUTER_API_KEY=sua-api-key-aqui
HTTP_REFERER=http://localhost:3000
TITLE=Orkestra
PORT=3000
```

| Variável | Descrição |
|----------|-----------|
| `OPENROUTER_API_KEY` | Chave da API OpenRouter |
| `HTTP_REFERER` | URL do seu app (exigido pelo OpenRouter) |
| `TITLE` | Nome exibido nas requisições (`X-OpenRouter-Title`) |
| `PORT` | Porta do servidor local |

### 3. Inicie em modo desenvolvimento

```bash
npm run dev
```

O servidor sobe em `http://localhost:3000` (ou a porta definida no `.env`). Ao iniciar, o `index.ts` executa automaticamente os dois fluxos no terminal para teste rápido.

### 4. Debug no VS Code

Use a configuração **Debug orkestra** em `.vscode/launch.json` (já carrega o `.env` com `--env-file`).

---

## ✨ Funcionalidades

### 1. Recomendação do OpenRouter — `POST /chat/recommend`

O router escolhe o melhor endpoint entre os candidatos, conforme o critério:

- `price` — menor custo
- `throughput` — maior velocidade de geração
- `latency` — menor latência

Até **3 modelos** por requisição (limite da API no array `models`). Configure em `routingCandidates` e `recommendSorts` no `config.ts`.

**Exemplo:**

```bash
curl -X POST http://localhost:3000/chat/recommend \
  -H "Content-Type: application/json" \
  -d '{"question": "Qual LLM é melhor para tradução?"}'
```

Com critérios e candidatos customizados no body:

```json
{
  "question": "Qual LLM é melhor para tradução?",
  "sorts": ["price", "latency"],
  "candidates": [
    "google/gemma-4-31b-it:free",
    "nvidia/nemotron-3-ultra-550b-a55b:free"
  ]
}
```

### 2. Comparativo manual — `POST /chat/compare`

Roda **cada modelo** que você listar, em paralelo, com a mesma pergunta. Ideal para ver respostas lado a lado. Sem limite de 3 modelos.

**Exemplo:**

```bash
curl -X POST http://localhost:3000/chat/compare \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Qual LLM é melhor para tradução?",
    "models": [
      "google/gemma-4-31b-it:free",
      "openrouter/owl-alpha"
    ]
  }'
```

Se omitir `models`, usa a lista `compareModels` do `config.ts`.

---

## 🔀 Os dois modos em resumo

| Modo | Endpoint | Quem escolhe o modelo | Uso |
|------|----------|------------------------|-----|
| Recomendação | `/chat/recommend` | OpenRouter (por preço, throughput ou latência) | “O que o router recomenda?” |
| Comparativo | `/chat/compare` | Você (lista de IDs) | “Quero testar estes modelos eu mesmo” |

---

## ⚙️ Configuração dos modelos

Edite [`src/config.ts`](src/config.ts):

- `routingCandidates` — candidatos à recomendação (máx. 3)
- `compareModels` — modelos do comparativo manual
- `recommendSorts` — critérios a testar na recomendação
- `provider.sort` — ex.: `partition: "none"` para comparar candidatos globalmente
- `temperature`, `maxTokens`, `systemPrompt` — parâmetros das chamadas

Documentação de roteamento do OpenRouter: [Provider Routing](https://openrouter.ai/docs/guides/routing/provider-selection)

---

## 🛠 Tecnologias utilizadas

- TypeScript
- Node.js
- [Fastify](https://fastify.dev/)
- [OpenRouter SDK](https://openrouter.ai/docs)
- [tsx](https://github.com/privatenumber/tsx) (execução e watch em desenvolvimento)

---

## ⚠️ Observações

- O arquivo `.env` não é versionado. Nunca commite sua `OPENROUTER_API_KEY`.
- Modelos `:free` podem sofrer rate limit; erros individuais aparecem no comparativo sem derrubar os demais.
- Custos e tokens usados vêm no campo `usage` das respostas da API OpenRouter.

---

Se precisar de ajuda ou encontrar problemas, abra uma issue no repositório. 🚀
