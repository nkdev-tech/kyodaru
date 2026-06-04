# 今日もだるい（kyodaru）

ぼやくだけで体調が記録されるAI対話型アプリ。

気圧や天気で体調が左右されやすく、毎日AIチャットに不調をぼやいている人向け。「記録する」という意識ゼロでぼやくだけで記録され、気圧・天気との相関をAIが分析してフィードバックしてくれる。

## 既存アプリとの違い

| 既存アプリ | 今日もだるい |
|---|---|
| フォームに入力する | 自然言語でぼやくだけ |
| 頭痛専用 | なんとなく不調も記録できる |
| データを見せるだけ | AIが傾向を教えてくれる |
| 受動的な記録 | AIが深掘り質問してくれる |

## 機能

### MVP

| # | 機能 | 内容 |
|---|---|---|
| 1 | ぼやき入力 | 自然言語で自由入力 |
| 2 | AI要約保存 | ぼやきをAIが短く要約してDBに保存 |
| 3 | 体調レベル判定 | ぼやきからAIが1〜5で体調レベルを判定 |
| 4 | 気圧・天気自動取得 | 入力時に現在地の気圧・天気を自動記録（Open-Meteo API） |
| 5 | 薬の手動登録 | よく飲む薬を自分で登録（名前・アイコン色） |
| 6 | 服用記録 | ぼやくついでに飲んだ薬を選択して記録 |
| 7 | 月カレンダー表示 | 体調レベル・服薬アイコンを月表示、タップで詳細モーダル |

### 将来追加

| # | 機能 |
|---|---|
| 8 | 傾向分析・AIフィードバック |
| 9 | レポート・グラフ表示 |
| 10 | 気圧下降の事前プッシュ通知 |
| 11 | 週カレンダー表示 |

## 画面構成

```
BottomNavigation
├── ホーム        今日の天気・気圧 / ぼやき入力欄
│   └── ぼやき入力 → 送信 → ホームに戻る
├── カレンダー    月表示（体調レベル・服薬アイコン）
│   └── 日付タップ → 詳細モーダル（ぼやき要約・気圧・服用薬・体調レベル）
└── 設定          薬管理（一覧・追加・削除）

将来：ホーム / カレンダー / レポート / 設定
```

## 技術スタック

| レイヤー | 技術 |
|---|---|
| モバイル | Expo / React Native / NativeWind / React Native Reusables |
| API | Hono + @hono/zod-openapi / Cloudflare Workers |
| DB | Cloudflare D1（SQLite）/ Drizzle ORM |
| 認証 | better-auth + @better-auth/expo + expo-secure-store |
| 状態管理 | TanStack Query |
| AI | Google Gemini API（gemini-2.0-flash、無料枠） |
| 天気・気圧 | Open-Meteo API（無料） |
| APIクライアント生成 | orval |
| Linter/Formatter（api） | Biome |
| Linter/Formatter（mobile） | ESLint + Prettier |
| テスト（api） | Vitest |
| テスト（mobile） | Jest（設定のみ、必要に応じて追加） |
| CI | GitHub Actions |

## DB設計

### entries（ぼやきの記録）

| カラム | 型 | 内容 |
|---|---|---|
| id | TEXT | PK |
| user_id | TEXT | FK |
| raw_text | TEXT | 元のぼやき全文 |
| summary | TEXT | AI要約 |
| condition_level | INTEGER | 体調レベル（1〜5、AIが判定） |
| pressure | REAL | 気圧（hPa） |
| weather | TEXT | 天気 |
| created_at | INTEGER | 記録日時（1日複数記録可） |

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

## リポジトリ構成

```
kyodaru/
├── api/      # Hono
├── mobile/   # Expo
├── docs/
└── README.md
```

## デプロイ・費用

| 対象 | デプロイ先 | 費用 |
|---|---|---|
| api | Cloudflare Workers | 無料枠で十分 |
| mobile | EAS（Expo Application Services） | 無料枠あり（ビルド月15回まで） |
| Apple Developer | TestFlight / App Store | 99ドル/年 |
| Google Gemini API | - | 無料（1,500 req/日まで） |
| Open-Meteo | - | 完全無料 |

## 開発ロードマップ

| マイルストーン | ゴール | 難易度 |
|---|---|---|
| M1 | Expo + NativeWind で画面1枚表示 | ★★★ |
| M2 | ぼやきを入力してD1に保存できる | ★★ |
| M3 | 保存したぼやきをカレンダーに表示 | ★★ |
| M4 | Gemini APIが要約・体調レベルを返す | ★★ |
| M5 | 気圧・天気データを自動取得して記録 | ★★ |
| M6 | 薬の登録・服用記録ができる | ★ |
| M7 | UIを整えてTestFlightで動く | ★★★ |
| M8 | レポートタブでデータを可視化する | ★★ |
