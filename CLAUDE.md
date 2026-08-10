# CLAUDE.md

## プロジェクト概要

「今日もだるい（kyodaru）」— ぼやくだけで体調が記録されるAI対話型モバイルアプリ。

## リポジトリ構成

```
kyodaru/
├── api/      # Hono + Cloudflare Workers（バックエンドAPI）
├── mobile/   # Expo / React Native（モバイルアプリ）
└── README.md
```

npm workspaces でモノレポ管理。

## 技術スタック

| レイヤー | 技術 |
|---|---|
| モバイル | Expo / React Native / NativeWind / React Native Reusables |
| API | Hono + @hono/zod-openapi / Cloudflare Workers |
| DB | Cloudflare D1（SQLite）/ Drizzle ORM |
| 認証 | better-auth + @better-auth/expo + expo-secure-store |
| 状態管理 | TanStack Query |
| AI | Google Gemini API（gemini-3.1-flash-lite） |
| 天気・気圧 | Open-Meteo API |
| APIクライアント生成 | orval |
| Linter/Formatter（api） | Biome |
| Linter/Formatter（mobile） | ESLint + Prettier |
| テスト（api） | Vitest |
| テスト（mobile） | Jest（設定のみ） |
| CI | GitHub Actions |

## 開発方針

- **バイブコーディングしない** — 生成AIのAPIとモバイルアプリ開発はどちらも初経験のため、学習を最優先にする。コードを何となく動かすのではなく、なぜそう書くのかを理解しながら進める
- **TDD** — テストを先に書いてから実装する（**mobile はテストを書かない**。TDD対象はapiのみ）
- **コードはユーザーから求められるまで提案しない**
- コードを提案するときは、何をしているか・なぜそう書くかを簡潔に説明する

## API互換性・バージョニング方針

- **api はSemVerで運用する** — `api/package.json` の `version` をAPIのバージョンとして扱う
- **破壊的変更をする場合は、必ず以下をセットで行う**
  1. major バージョンを上げる
  2. `api/src/lib/config.ts` の `MIN_SUPPORTED_APP_VERSION`（mobile側のアプリバージョンのしきい値）を更新する
  3. 古いmobileアプリは強制アップデート対象になる
  - 「壊す変更を禁止」ではなく「壊すなら手続きを踏ませる」ゲート。意図的な破壊的変更は手続きを踏めば通る
- **mobile はAPIレスポンスを strict 検証しない**（orval生成のTS型に`as`するだけ、tolerant reader）。後方互換を保つための意図的な設計であり、今後もstrictな実行時検証（zodでのレスポンスパース等）を追加しない
- 上記は CI で機械的に検知する（orvalクライアントのドリフト検知、OpenAPI破壊的変更検知）

## リリース運用（CD）

**main へのマージが唯一の本番リリース点**。api と mobile を同じ main コミットから同時にトリガーすることで、片方だけ古い「バージョンずれ」を構造的に作れないようにする。

```
【日常】 日々の修正ブランチ・Dependabot ──PR──▶ develop（常設・Default branch）

【リリース】 develop から release/<version> を作成 ──PR──▶ main ──▶ [CD発火]
```

- **develop は常設の統合ブランチ**（GitHubリポジトリの Default branch）。日々の修正PRとDependabot（version updates・security updates 両方）はここに向ける。`release/<version>` は都度作って消す一時ブランチなので、リリースが決まっていない期間の安定した向き先として develop を使う
- **リリースブランチを切る** — `develop` から `release/<version>`（例：`release/1.0.0`）を作成する。`<version>` は `api/package.json` の version
- CI（api/mobile/orval-drift 等）と oasdiff（破壊的変更検知）は `develop`・`release/**` でも走る
- **まとまったら release → main にPRを出してマージ** — main への push で [ci.yml](.github/workflows/ci.yml) の CD ジョブが発火する
  - CIジョブ（api/mobile/icon-wrapping/orval-drift）が全て通った場合のみ実行（`needs` ＋ `if: push かつ main` でゲート）。`develop`・`release/**` への push/PR ではデプロイは発火しない
  - `deploy-api`: `wrangler deploy`（数十秒）→ API 先行で反映
  - `deploy-mobile`: `eas build -p ios --profile production --auto-submit`（Apple審査を挟むので自然に API より遅い）→ TestFlight 提出
- **順序保証** — API デプロイは wrangler で数十秒、mobile は EAS ビルド＋Apple審査で時間がかかるため、自然に「API が先、mobile が後」になり mobile が古い API を叩く事故を防ぐ
- **採番** — mobile は `appVersionSource: remote` ＋ production の `autoIncrement: true` で自動採番

### 必要な GitHub Secrets

| Secret | 用途 |
|---|---|
| `CLOUDFLARE_API_TOKEN` | `wrangler deploy`（Workers デプロイ権限を持つトークン） |
| `EXPO_TOKEN` | EAS CLI 認証（Expo アカウントの access token） |

※ App Store Connect の提出用認証（ASC API キー・配布証明書・プロビジョニングプロファイル）は **EAS 側の credentials に保管**する（`eas credentials -p ios` を一度実行）。GitHub Secrets には置かない。非対話ビルド前提のため、初回に credentials を EAS に登録しておく必要がある。

## issueの進め方（アシスタントが主導）

1. **完了条件を決める** — ユーザーと合意する（このステップでは superpowers スキルを使わない）。設定系issueは「何を設定するか」＋「動作確認方法（あれば）」、機能issueはUI観点（例：〇〇画面で〇〇できる）で定める
2. **issueの概要欄に完了条件を書き込む** — `gh issue edit` で更新
3. **ブランチを切る** — `git checkout -b issue-<番号>-<概要>` など
4. **やることリストを提示する**
5. **テストを書く（TDD）** — ユーザーが実装より先にテストを書く。アシスタントはコードを書かない。**mobile issueはこのステップをスキップする**。テストを書いたら必ずテストがredになることを確認してから次に進む
6. **実装する** — ユーザーが実装する。アシスタントはコードを書かない
7. **PRを作成する** — アシスタントが `gh pr create` で作成。タイトルは対応するissueと同じにする。必ず `Closes #<issue番号>` をbodyに含めてissueと紐づける
8. **新しいチャットでレビューを行う** — 破壊的変更を含むPRは「API互換性・バージョニング方針」に沿っているか確認する。あわせて `legal-compliance-review` スキルで、変更が利用規約・プライバシーポリシーの更新を要しないかを必ずチェックする
   - 本文はリポジトリ内になく外部にあるため、レビュー時に **WebFetch で取得** して差分と突き合わせる
     - 利用規約: `https://kyodaru.com/terms`
     - プライバシーポリシー: `https://kyodaru.com/privacy`

## よく使うコマンド

```bash
# api
cd api
npm run dev       # ローカル開発（wrangler dev）
npm run deploy    # Cloudflare Workers へデプロイ

# mobile
cd mobile
npm run start     # Expo 開発サーバー起動
npm run ios       # iOS シミュレーター
npm run android   # Android エミュレーター
```

## DB設計

### entries（ぼやきの記録）
| カラム | 型 | 内容 |
|---|---|---|
| id | TEXT | PK |
| user_id | TEXT | FK |
| raw_text | TEXT | 元のぼやき全文 |
| summary | TEXT | AI要約 |
| condition_level | INTEGER | 体調レベル（1〜5） |
| pressure | REAL | 気圧（hPa） |
| temperature | REAL | 気温（℃） |
| weather | TEXT | 天気（日本語ラベル） |
| created_at | INTEGER | 記録日時 |

### medicines（薬マスタ）
| カラム | 型 | 内容 |
|---|---|---|
| id | TEXT | PK |
| user_id | TEXT | FK |
| name | TEXT | 薬の名前 |
| color | TEXT | アイコン色（例：#FF6B6B） |
| created_at | INTEGER | 作成日時 |

### medicine_entries（服用記録）
| カラム | 型 | 内容 |
|---|---|---|
| id | TEXT | PK |
| entry_id | TEXT | FK → entries |
| medicine_id | TEXT | FK → medicines |

※ 認証関連テーブルは better-auth が自動生成
