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
| AI | Google Gemini API（gemini-2.0-flash） |
| 天気・気圧 | Open-Meteo API |
| APIクライアント生成 | orval |

## 開発方針

- **バイブコーディングしない** — 生成AIのAPIとモバイルアプリ開発はどちらも初経験のため、学習を最優先にする。コードを何となく動かすのではなく、なぜそう書くのかを理解しながら進める
- **TDD** — テストを先に書いてから実装する
- **コードはユーザーから求められるまで提案しない**
- コードを提案するときは、何をしているか・なぜそう書くかを簡潔に説明する

## issueの進め方（アシスタントが主導）

1. **完了条件を決める** — ユーザーと合意する（このステップでは superpowers スキルを使わない）。設定系issueは「何を設定するか」＋「動作確認方法（あれば）」、機能issueはUI観点（例：〇〇画面で〇〇できる）で定める
2. **issueの概要欄に完了条件を書き込む** — `gh issue edit` で更新
3. **ブランチを切る** — `git checkout -b issue-<番号>-<概要>` など
4. **やることリストを提示する**
5. **テストを書く（TDD）** — 実装より先にテストを書く
6. **実装する**
7. **PRを作成する** — アシスタントが `gh pr create` で作成。タイトルは対応するissueと同じにする
8. **新しいチャットでレビューを行う**

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

### logs（ぼやきの記録）
| カラム | 型 | 内容 |
|---|---|---|
| id | TEXT | PK |
| user_id | TEXT | FK |
| raw_text | TEXT | 元のぼやき全文 |
| summary | TEXT | AI要約 |
| condition_level | INTEGER | 体調レベル（1〜5） |
| pressure | REAL | 気圧（hPa） |
| weather | TEXT | 天気 |
| logged_at | INTEGER | 記録日時 |

### medicines（薬マスタ）
| カラム | 型 | 内容 |
|---|---|---|
| id | TEXT | PK |
| user_id | TEXT | FK |
| name | TEXT | 薬の名前 |
| color | TEXT | アイコン色（例：#FF6B6B） |
| created_at | INTEGER | 作成日時 |

### medicine_logs（服用記録）
| カラム | 型 | 内容 |
|---|---|---|
| id | TEXT | PK |
| log_id | TEXT | FK → logs |
| medicine_id | TEXT | FK → medicines |

※ 認証関連テーブルは better-auth が自動生成
