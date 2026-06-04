# OpenRouter — Capacidades que o Orkestra usa

Cheatsheet das partes do [OpenRouter](https://openrouter.ai/docs) que sustentam o Orkestra. Fonte de verdade técnica para a implementação.

## 1. Catálogo de modelos — `GET /api/v1/models`

Endpoint **público** (não exige auth). Retorna todos os modelos com metadados. Por modelo:

| Campo | Uso no Orkestra |
|-------|-----------------|
| `id`, `name` | Identificação / exibição |
| `context_length` | Filtro de contexto mínimo exigido pela tarefa |
| `pricing.{prompt,completion,image,request}` | Custo (string USD por token/unidade) → ordenação por "mais barato", estimativa de custo |
| `architecture.input_modalities` | Capacidades de entrada: `text`, `image`, `file` → exigir `file` para tarefas de PDF |
| `architecture.output_modalities` | Modalidade de saída |
| `supported_parameters[]` | Detecção de features: `tools`, `structured_outputs`, `web_search`/`web_search_options`, `reasoning`, `response_format`... |
| `top_provider.{context_length,is_moderated,max_completion_tokens}` | Limites reais do provedor |

**Filtros de query suportados:** `category`, `supported_parameters` (CSV), `output_modalities`.

**Detecção de capacidade (regra do selector):**
- Aceita PDF/arquivo → `architecture.input_modalities` inclui `"file"`.
- Aceita imagem → inclui `"image"`.
- Suporta ferramentas → `supported_parameters` inclui `"tools"`.
- Suporta JSON estruturado → inclui `"structured_outputs"` (ou `"response_format"`).
- Busca na web → inclui `"web_search"`/`"web_search_options"`.

> O catálogo é estável e cacheável na borda — o Orkestra pode cachear em memória com TTL.

## 2. Roteamento de provedor (`provider`)

- `provider.sort`: `"price"` | `"throughput"` | `"latency"` — prioriza o endpoint por critério.
- Atalhos no slug: `:floor` (= price) e `:nitro` (= throughput).
- `provider.sort` como objeto com `partition: "none"` → ordena endpoints **globalmente** entre vários modelos (usado na recomendação multi-candidato).
- `preferred_max_latency`, `preferred_min_throughput` → preferências de performance (não garantem, mas priorizam).

## 3. Fallback de modelos (confiabilidade)

- Parâmetro **`models: string[]`** (ordem de prioridade). Se o primeiro falhar (erro, rate-limit, moderação, downtime), o OpenRouter **tenta o próximo automaticamente**.
- A resposta traz **`response.model`** = o modelo que **de fato** respondeu (e que é cobrado).
- O OpenRouter **não expõe timeout por requisição** → o Orkestra implementa **timeout no cliente** (AbortController) e, se estourar, segue para o próximo candidato. Isso atende a regra "nunca travar".
- `openrouter/auto` é um roteador automático que também aceita config de provider.

## 4. Entrada de PDF / arquivos

Mensagem com content do tipo `file`:

```json
{
  "type": "file",
  "file": { "filename": "doc.pdf", "file_data": "<URL ou data:...;base64,...>" }
}
```

Plugin de parsing (opcional):

```json
{ "plugins": [{ "id": "file-parser", "pdf": { "engine": "mistral-ocr" } }] }
```

Engines: `native` (modelos com suporte nativo a arquivo; cobrado como tokens), `cloudflare-ai` (PDF→markdown, **grátis**), `mistral-ocr` (melhor para PDF escaneado). **Default:** nativo se o modelo suportar, senão `mistral-ocr`. **Funciona em qualquer modelo** (quando não há suporte nativo, o OpenRouter parseia e injeta o texto).

## 5. Outras features úteis (futuras)

- **Structured outputs / `response_format`** — forçar JSON (útil para extração de PDF).
- **Tools / function calling** — tarefas que exigem ferramentas.
- **Usage** — `response.usage` traz tokens e custo reais por chamada → métricas de comparação.

## Referências

- Lista de modelos: https://openrouter.ai/docs/api/api-reference/models/get-models
- Provider routing: https://openrouter.ai/docs/guides/routing/provider-selection
- Model fallbacks: https://openrouter.ai/docs/guides/routing/model-fallbacks
- PDFs: https://openrouter.ai/docs/guides/overview/multimodal/pdfs
