# api

Hono + Cloudflare Workers によるバックエンドAPI。

## ローカル開発

```bash
npm run dev       # wrangler dev
```

## 本番デプロイ

Worker名は `kyodaru-api`。本番URLは `https://api.kyodaru.com`。

```bash
# 本番D1へマイグレーション適用
npx wrangler d1 migrations apply kyodaru --remote

# デプロイ
npm run deploy
```
