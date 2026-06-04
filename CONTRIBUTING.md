# Contribuindo com o Orkestra

Obrigado pelo interesse! Este guia cobre o essencial para contribuir.

> **Status:** o projeto está em desenvolvimento ativo, migrando de um protótipo (v1) para a plataforma descrita em [`docs/VISAO.md`](docs/VISAO.md). Veja o plano em [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Antes de começar

- Leia a [visão](docs/VISAO.md), a [arquitetura](docs/ARQUITETURA.md) e as [decisões (ADR)](docs/DECISOES.md) — eles explicam *o quê* e *por quê*.
- Para mudanças não triviais, **abra uma issue antes** descrevendo a proposta, para alinharmos a direção e evitar retrabalho.

## Princípios do projeto

- Código **simples, legível e bem abstraído**; nada repetitivo, tudo reutilizável.
- **Nunca travar**: toda chamada a modelo tem timeout e fallback (ver [ARQUITETURA.md](docs/ARQUITETURA.md)).
- **Segurança em primeiro lugar**: a API key do usuário é BYOK — nunca a registre em log, resposta ou disco (ver [ADR-001](docs/DECISOES.md)).
- Decisões arquiteturais relevantes viram **ADR** em `docs/DECISOES.md`.

## Ambiente de desenvolvimento

Requisitos: **Node.js 22+** e uma API key do [OpenRouter](https://openrouter.ai/settings/keys).

```bash
npm install
cp .env.example .env   # preencha as variáveis
npm run dev            # sobe a API em modo watch
```

## Fluxo de contribuição

1. Faça um fork e crie um branch a partir de `main` (ex.: `feat/recommend-endpoint`).
2. Implemente seguindo a [arquitetura](docs/ARQUITETURA.md) e os princípios acima.
3. Garanta que passa nos checks locais (à medida que forem adicionados na Sprint 0):
   - `npm run typecheck` — type-check
   - `npm run lint` — lint
   - `npm test` — testes
4. Faça commits claros (recomendado: [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `docs:`, `refactor:`, `test:`...).
5. Abra um Pull Request descrevendo a mudança e referenciando a issue/tarefa do roadmap.

## Reportando bugs e ideias

Use as **issues** do repositório. Para bugs, inclua passos para reproduzir, comportamento esperado e o que aconteceu. **Nunca cole sua API key** em issues, logs ou prints.

## Licença

Ao contribuir, você concorda que sua contribuição será licenciada sob a [Licença MIT](LICENSE) do projeto.
