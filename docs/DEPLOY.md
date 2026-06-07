# Deploy

O Orkestra é **stateless** (BYOK — não guarda segredos de usuário) e roda em **porta única**: a API serve a SPA buildada (`web/dist`, via `plugins/staticWeb.ts`), a API em `/v1/*` e o Swagger em `/docs` — tudo na mesma origem, sem CORS.

Requisitos: nenhuma API key no servidor (é BYOK). Rodar atrás de **HTTPS**.

---

## Docker + Portainer + Traefik (recomendado)

A imagem ([`Dockerfile`](../Dockerfile)) builda a SPA e empacota tudo numa imagem só. O [`docker-compose.yml`](../docker-compose.yml) já traz as labels do Traefik (HTTPS via Let's Encrypt) e um healthcheck.

**1. DNS:** crie um registro **A** `orkestra.<seu-dominio>` → IP do servidor.

**2. Rede:** o compose usa a rede externa de borda do Traefik. Confirme o nome real (com prefixo do projeto) e ajuste em `docker-compose.yml` se necessário:

```yaml
networks:
  proxy:
    external: true
    name: stack_proxy   # a mesma rede onde o Traefik roteia
```

E nas labels: `traefik.docker.network=stack_proxy`, `...rule=Host(\`orkestra.seu-dominio\`)`, `entrypoints=websecure`, `tls.certresolver=letsencrypt`.

**3. Deploy na Portainer** (Stack a partir do Git):

- Portainer → **Stacks** → *Add stack* → **Repository**
- Repository URL: `https://github.com/vanhalen/orkestra`
- Compose path: `docker-compose.yml`
- *Deploy* — a Portainer clona, builda a imagem e sobe. O Traefik passa a rotear `orkestra.seu-dominio` → container `:3000` com HTTPS automático.

**Atualizar:** na Portainer, *Pull and redeploy* (ou re-deploy da stack). Sem publicar porta no host — o tráfego entra pelo Traefik.

### Build/teste local

```bash
docker build -t orkestra .
docker run --rm -p 3000:3000 orkestra
curl http://localhost:3000/health   # → {"status":"ok"}
```

---

## Sem Docker?

Não precisa de nada especial: `npm ci && npm run build:web && npm start` sobe a API + SPA na `PORT` configurada — basta pôr atrás de qualquer reverse proxy com HTTPS (nginx, Caddy, etc.).

---

## Front e API separados (opcional)

Se quiser o front num host estático (CDN) e a API à parte:

- Front: `cd web && VITE_API_URL=https://api.seu-dominio npm run build` → publique `web/dist`.
- API: defina `WEB_ORIGIN=https://app.seu-dominio` (libera o CORS).

---

## Variáveis de ambiente (servidor)

Todas opcionais (têm default) — ver [`.env.example`](../.env.example):

| Variável | Default | Uso |
|----------|---------|-----|
| `PORT` / `HOST` | `3000` / `0.0.0.0` | bind |
| `WEB_ORIGIN` | `*` | origem permitida no CORS (porta única = mesma origem) |
| `REQUEST_TIMEOUT_MS` | `30000` | timeout por chamada a modelo |
| `CATALOG_TTL_MS` | `300000` | cache do catálogo |
| `RATE_LIMIT_MAX` | `120` | requisições/IP/minuto |
| `MAX_BODY_BYTES` | `10485760` | limite de body (PDFs base64) |

## Checklist

- [ ] `npm test`, `npm run typecheck`, `npm run lint` verdes.
- [ ] `npm run smoke` (E2E contra o catálogo real).
- [ ] DNS `A` do subdomínio → IP do servidor.
- [ ] Rede externa do Traefik correta no `docker-compose.yml` (`stack_proxy`).
- [ ] HTTPS ativo (Traefik + Let's Encrypt) — a key trafega no header.
