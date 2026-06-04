# Orkestra

> Camada de **seleção, comparação e recomendação de LLMs** sobre o [OpenRouter](https://openrouter.ai/) — você traz sua própria API key (BYOK).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-orange)

O Orkestra não hospeda modelos: usa o catálogo e o roteamento do OpenRouter e adiciona a inteligência para responder *"qual modelo devo usar para esta tarefa, com este orçamento e estas restrições?"*.

**Cenário típico:** você precisa extrair informação de um PDF e quer o modelo **mais barato e mais rápido** que dê conta. Você descreve a tarefa + restrições e o Orkestra retorna o modelo ideal — pronto para uso ou já com a resposta executada.

## 🚦 Status

Projeto em desenvolvimento ativo, evoluindo de um protótipo para a plataforma completa.

- **v1 (atual, no código):** protótipo funcional com duas rotas — `POST /chat/recommend` e `POST /chat/compare` — usando uma key configurada via `.env`.
- **v2 (em construção):** API redesenhada com **BYOK por requisição**, rotas `recommend` / `run` / `compare`, catálogo filtrável e uma tela de divulgação em Vue.

O desenho completo e o plano estão em [`docs/`](docs/). **Esta documentação descreve a v1 em execução**; para a direção do projeto, veja [`docs/VISAO.md`](docs/VISAO.md) e [`docs/ROADMAP.md`](docs/ROADMAP.md).

## 📚 Documentação

| Documento | Conteúdo |
|-----------|----------|
| [docs/VISAO.md](docs/VISAO.md) | Produto, público e os verbos recommend / run / compare |
| [docs/ARQUITETURA.md](docs/ARQUITETURA.md) | Estrutura, módulos, segurança e confiabilidade |
| [docs/API.md](docs/API.md) | Contrato das rotas (v1 da nova API) |
| [docs/OPENROUTER.md](docs/OPENROUTER.md) | Capacidades do OpenRouter utilizadas |
| [docs/DECISOES.md](docs/DECISOES.md) | Decisões de arquitetura (ADR) |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Sprints e tarefas |

## 🚀 Como executar (protótipo atual)

### Requisitos

- **Node.js 22+** (mínimo 20)
- Uma **API key** do [OpenRouter](https://openrouter.ai/settings/keys)

### Passos

```bash
npm install
cp .env.example .env      # preencha as variáveis
npm run dev               # sobe a API em http://localhost:3000 (porta do .env)
```

Variáveis do `.env` (protótipo v1):

| Variável | Descrição |
|----------|-----------|
| `OPENROUTER_API_KEY` | Chave da API OpenRouter |
| `HTTP_REFERER` | URL do seu app (exigido pelo OpenRouter) |
| `TITLE` | Nome exibido nas requisições (`X-OpenRouter-Title`) |
| `PORT` | Porta do servidor local |

> Na **v2**, a key deixa de vir do `.env` e passa a ser enviada por requisição (BYOK) — ver [ADR-001](docs/DECISOES.md).

### Rotas do protótipo

```bash
# Recomendação do OpenRouter (por preço / throughput / latência)
curl -X POST http://localhost:3000/chat/recommend \
  -H "Content-Type: application/json" \
  -d '{"question": "Qual LLM é melhor para tradução?"}'

# Comparativo lado a lado de vários modelos
curl -X POST http://localhost:3000/chat/compare \
  -H "Content-Type: application/json" \
  -d '{"question": "Qual LLM é melhor para tradução?", "models": ["google/gemma-4-31b-it:free"]}'
```

## 🛠 Tecnologias

- **TypeScript** + **Node.js 22**
- [Fastify](https://fastify.dev/) 5
- [OpenRouter SDK](https://openrouter.ai/docs)
- [tsx](https://github.com/privatenumber/tsx) (execução/watch em desenvolvimento)
- _v2:_ Vue 3 + Vite + Tailwind (tela de divulgação)

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja o [CONTRIBUTING.md](CONTRIBUTING.md). Para mudanças não triviais, abra uma issue antes.

## ⚠️ Segurança

- Nunca commite sua `OPENROUTER_API_KEY`. O `.env` não é versionado.
- Modelos `:free` podem sofrer rate limit; erros individuais aparecem por modelo sem derrubar os demais.

## 📄 Licença

[MIT](LICENSE) © 2026 Rodrigo Chagas
