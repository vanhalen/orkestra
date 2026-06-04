# Deploy

O Orkestra é stateless (BYOK — não guarda segredos de usuário), então o deploy é simples. Há duas topologias.

## Requisitos

- Node.js 22+ no servidor.
- Nenhuma API key do OpenRouter no servidor: ela é enviada por requisição (BYOK).

## Opção A — Porta única (API serve a SPA)

Recomendado para demo/divulgação. A API serve o build do front em `web/dist` automaticamente (ver `plugins/staticWeb.ts`).

```bash
# 1. build do front
cd web && npm install && npm run build && cd ..

# 2. instala e sobe a API (serve /v1, /docs e a SPA na mesma porta)
npm install
npm run dev          # ou rode src/index.ts com um process manager (pm2, systemd...)
```

Tudo fica em `http://SEU_HOST:PORT`:
- SPA na raiz `/`
- API em `/v1/*`, `/health`
- Docs OpenAPI em `/docs`

Como front e API ficam na mesma origem, não há questão de CORS.

## Opção B — Separados (front estático + API)

Hospede o `web/dist` em qualquer CDN/host estático (Netlify, Vercel, Pages...) e a API em outro serviço.

- No build do front, defina `VITE_API_URL` apontando para a URL pública da API.
- Na API, defina `WEB_ORIGIN` com a origem do front para liberar o CORS.

```bash
# front
cd web && VITE_API_URL=https://api.seu-dominio.com npm run build

# API
WEB_ORIGIN=https://app.seu-dominio.com PORT=8080 node --import tsx src/index.ts
```

## Variáveis de ambiente (servidor)

Todas opcionais (têm default) — ver [`.env.example`](../.env.example):

| Variável | Default | Uso |
|----------|---------|-----|
| `PORT` / `HOST` | `3000` / `0.0.0.0` | bind |
| `WEB_ORIGIN` | `*` | origem permitida no CORS (use a URL do front em produção) |
| `REQUEST_TIMEOUT_MS` | `30000` | timeout por chamada a modelo |
| `CATALOG_TTL_MS` | `300000` | cache do catálogo |
| `RATE_LIMIT_MAX` | `120` | requisições/IP/minuto |
| `MAX_BODY_BYTES` | `10485760` | limite de body (PDFs base64) |

## Checklist

- [ ] `npm test`, `npm run typecheck`, `npm run lint` verdes.
- [ ] `npm run smoke` (smoke E2E contra o catálogo real).
- [ ] Build do front (`web/`) gerado se for usar a Opção A.
- [ ] `WEB_ORIGIN` restrito em produção (não usar `*`).
- [ ] Rodar atrás de HTTPS (proxy reverso) — a key trafega no header.
