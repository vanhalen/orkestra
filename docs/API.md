# Contrato da API (v1)

Contrato HTTP da v1. Evolui ao longo das sprints; mudanças incompatíveis serão sinalizadas no histórico/CHANGELOG do projeto.

## Convenções

- Base: `/v1`. Respostas e bodies em JSON.
- **Auth (BYOK):** todo endpoint que chama o OpenRouter exige o header
  `Authorization: Bearer sk-or-...` (a API key do OpenRouter do usuário). A key **não é armazenada nem logada**.
  `GET /v1/models` e `GET /health` não exigem auth.
- **Erro uniforme:**
  ```json
  { "error": { "code": "string", "message": "humano-legível" } }
  ```
  Códigos: `invalid_key` (401), `bad_request` (400), `upstream_error` (502), `timeout` (504), `rate_limited` (429), `internal` (500).

---

## `GET /health`
Liveness. → `200 { "status": "ok" }`.

---

## `GET /v1/models`
Catálogo normalizado e filtrável (alimenta o seletor do frontend e a recomendação). Cacheado em memória.

**Query (todos opcionais):**
| Param | Tipo | Efeito |
|-------|------|--------|
| `supports` | CSV de `tools,json,web,file,image` | só modelos com essas capacidades |
| `free` | `true` | só modelos de preço zero |
| `maxPrice` | número | preço (prompt+completion) por token ≤ valor |
| `minContext` | número | `context_length` ≥ valor |
| `q` | string | busca por id/name |

**Resposta `200`:**
```json
{
  "count": 312,
  "models": [
    {
      "id": "google/gemini-2.5-flash",
      "name": "Google: Gemini 2.5 Flash",
      "contextLength": 1048576,
      "pricing": { "prompt": 0.0000003, "completion": 0.0000025, "image": 0 },
      "inputModalities": ["text", "image", "file"],
      "capabilities": { "tools": true, "json": true, "web": false, "file": true, "image": true }
    }
  ]
}
```

---

## `POST /v1/recommend`
Escolhe o melhor modelo para uma tarefa (heurística; validação opcional). **Não executa** a tarefa por padrão.

**Body:**
```json
{
  "task": "Extrair campos estruturados de notas fiscais em PDF",
  "priority": "cheapest",
  "requirements": { "inputs": ["pdf"], "wantJson": true, "minContext": 32000 },
  "filters": { "free": false, "maxPrice": 0.000005 },
  "candidates": ["google/gemini-2.5-flash", "..."],
  "validate": false,
  "topN": 3
}
```
| Campo | Obrig. | Descrição |
|-------|:--:|-----------|
| `task` | ✔ | Descrição da tarefa (usada para derivar requisitos e no probe de validação) |
| `priority` | | `cheapest` (default) · `fastest` · `largest_context` · `balanced` |
| `requirements` | | `inputs` (`pdf`/`image`), `wantJson`, `tools`, `web`, `minContext` |
| `filters` | | `free`, `maxPrice` |
| `candidates` | | restringe o universo a estes modelos (senão, catálogo inteiro) |
| `validate` | | `true` → roda probe curto nos finalistas e reordena pelo resultado real |
| `topN` | | tamanho do shortlist (default 3) |

**Resposta `200`:**
```json
{
  "best": { "id": "google/gemini-2.5-flash", "pricing": { "...": 0 }, "capabilities": {} },
  "shortlist": [ { "id": "...", "score": 0.91, "reason": "mais barato que atende PDF+JSON" } ],
  "rationale": "Filtrado por suporte a 'file' e 'structured_outputs'; ordenado por menor custo.",
  "validated": false
}
```

---

## `POST /v1/run`
Executa a tarefa e devolve a resposta + qual modelo respondeu. É a rota "LLM pronta para o trabalho". Confiável por design (fallback + timeout).

**Body:**
```json
{
  "prompt": "Liste os itens e valores desta nota.",
  "models": ["google/gemini-2.5-flash", "openai/gpt-4o-mini"],
  "auto": { "priority": "cheapest", "requirements": { "inputs": ["pdf"] } },
  "files": [ { "filename": "nota.pdf", "data": "data:application/pdf;base64,..." } ],
  "responseFormat": "json",
  "temperature": 0.2,
  "maxTokens": 1024
}
```
- Fornecer **`models`** (cadeia de fallback explícita) **ou** **`auto`** (o Orkestra recomenda internamente e usa o shortlist como cadeia). Pelo menos um.
- `files` → entrada de PDF/arquivo (ver [OPENROUTER.md](OPENROUTER.md)).
- `responseFormat: "json"` → força saída estruturada quando o modelo suporta.

**Resposta `200`:**
```json
{
  "answer": "…resposta do modelo…",
  "modelUsed": "google/gemini-2.5-flash",
  "usage": { "prompt_tokens": 1200, "completion_tokens": 180 },
  "costUsd": 0.00041,
  "latencyMs": 1340,
  "attempts": [ { "model": "…", "ok": false, "error": "rate-limited" } ]
}
```
`attempts` mostra a cadeia de fallback percorrida (transparência da regra "tenta a próxima").

---

## `POST /v1/compare`
Roda vários modelos em paralelo com a mesma pergunta. Falha de um não derruba os outros.

**Body:**
```json
{
  "question": "Qual a melhor estratégia de cache para uma API REST?",
  "models": ["google/gemini-2.5-flash", "anthropic/claude-3.5-haiku", "meta-llama/llama-3.3-70b"],
  "temperature": 0.2,
  "maxTokens": 512
}
```

**Resposta `200`:**
```json
{
  "question": "…",
  "results": [
    { "model": "google/gemini-2.5-flash", "content": "…", "error": null, "latencyMs": 980, "usage": {}, "costUsd": 0.0002 },
    { "model": "anthropic/claude-3.5-haiku", "content": null, "error": "timeout", "latencyMs": 30000, "usage": null, "costUsd": 0 }
  ]
}
```

---

## Notas de segurança
- A key nunca aparece em respostas, logs ou no campo `attempts`.
- `files` em base64 respeitam o limite de body; payloads acima → `413`/`400`.
- Rate limit por IP em todas as rotas.
