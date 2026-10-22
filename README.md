# todo-app

自分用の todo リスト（Web アプリ）。仕様は [SPEC.md](SPEC.md)、開発計画は [PLAN.md](PLAN.md) を参照。

## 使用している技術

| 分類 | 技術 | バージョン |
|---|---|---|
| フレームワーク | [Next.js](https://nextjs.org/)（App Router・Cache Components） | 16.4.2 |
| UI ライブラリ | [React](https://react.dev/) | 19.3.0 |
| 言語 | TypeScript | 5.9 |
| ランタイム | Node.js（[Volta](https://volta.sh/) で固定） | 22.23.3 |
| スタイル | [Tailwind CSS](https://tailwindcss.com/) | 4.3 |
| UI 部品 | [shadcn/ui](https://ui.shadcn.com/)（[Base UI](https://base-ui.com/) ベース） | 4.22 |
| 入力チェック | [Zod](https://zod.dev/) | 4.6 |
| ログイン状態の管理 | [jose](https://github.com/panva/jose)（署名付き Cookie） | 6.2 |
| DB | [Neon](https://neon.com/)（PostgreSQL） | PostgreSQL 18 |
| ORM | [Drizzle ORM](https://orm.drizzle.team/)・drizzle-kit | 0.45・0.31 |
| コードチェック | ESLint | 9 |

## ローカルでのアプリ起動方法

### 1. 必要なもの

- Node.js 22.23.3
  - [Volta](https://volta.sh/) を入れていれば、このフォルダでは自動でこのバージョンが使われます
- npm（Node.js に付属）

### 2. 依存パッケージを入れる

```bash
npm ci
```

### 3. 環境変数を設定する

`.env.example` をコピーして `.env.local` を作ります。

```bash
cp .env.example .env.local
```

`.env.local` を開いて、次の値を入れます。**`.env.local` は Git に入れないでください**（`.gitignore` で除外しています）。

| 変数 | 内容 |
|---|---|
| `APP_PASSWORD` | ログイン用のパスワード。ローカル開発中は短いものでよい |
| `SESSION_SECRET` | ログイン状態（Cookie）の署名に使う、32 文字以上のランダムな文字列 |
| `DATABASE_URL` | Neon の接続先（Neon の画面の「Connect」でコピーした `postgresql://` で始まる文字列）。パスワードを含むので、人に見せない |

`SESSION_SECRET` は、次のコマンドで作れます。

```bash
openssl rand -base64 32
```

### 4. DB にテーブルを作る

`DATABASE_URL` の DB に、テーブルを作ります（最初の1回と、テーブルの定義を変えたときに実行します）。

```bash
npm run db:migrate
```

### 5. 開発サーバーを起動する

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開き、`APP_PASSWORD` に設定したパスワードでログインします。

## そのほかのコマンド

| コマンド | 内容 |
|---|---|
| `npm run build` | 本番用にビルドする |
| `npm run start` | ビルドしたアプリを起動する（先に `npm run build` が必要） |
| `npm run lint` | ESLint でコードをチェックする |
| `npm run db:generate` | `src/lib/db/schema.ts` の変更から、テーブルを変える SQL（`drizzle/`）を作る |
| `npm run db:migrate` | `drizzle/` の SQL を DB に反映する |
