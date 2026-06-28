# mobile

Expo / React Native によるモバイルアプリ。

## ローカル開発

```bash
npm run start     # Expo 開発サーバー起動
npm run ios       # iOS シミュレーター
npm run android   # Android エミュレーター
```

API のURLは `EXPO_PUBLIC_API_URL` で指定する（ローカルは `.env` に記載）。

## ビルド（EAS）

ビルドプロファイルは `eas.json` で定義。`EXPO_PUBLIC_API_URL` はビルド時にバンドルへ焼き込まれるため、各プロファイルの `env` で指定している。

| プロファイル | 用途 | API URL |
|---|---|---|
| development | dev client（実機/シミュレータ開発） | `http://localhost:8787` |
| preview | 内部配布（リリース確認） | `https://api.kyodaru.com` |
| production | ストア / TestFlight 提出 | `https://api.kyodaru.com` |

```bash
# iOS ビルド（プロファイル省略時は production）
npx eas-cli build --platform ios
npx eas-cli build --platform ios --profile preview
```

ビルド番号は `appVersionSource: "remote"` + `production.autoIncrement` で EAS が自動採番する。

## TestFlight へ提出

```bash
npx eas-cli submit --platform ios
```

提出には App Store Connect API Key を使用（EAS が生成・保管）。輸出コンプライアンスは `app.json` の `ITSAppUsesNonExemptEncryption: false` で設定済み。

## モノレポでのビルド注意

EAS はモノレポルートで `npm ci` を実行するため、放置すると `api` ワークスペースの依存（`miniflare` 経由の `sharp` 等）まで入りビルドが失敗する。リポジトリルートの `.easignore` で `api/` を除外して回避している。
