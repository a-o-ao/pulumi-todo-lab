# Backend - TODOアプリケーション

## 概要

TypeScriptで実装された、TODOアプリケーションのバックエンドAPIサーバーです。Fastify、tRPC、Prisma、PostgreSQLを使用しています。

## 技術スタック

- **Node.js** (>= 14.0.0)
- **TypeScript** (5.9.3)
- **Fastify** (4.22.0) - 高速なWebフレームワーク
- **tRPC** (11.8.1) - 型安全なRPC通信
- **Prisma** (3.10.0) - ORMとデータベース管理
- **PostgreSQL** - データベース
- **Valibot** (1.2.0) - スキーマバリデーション
- **Vitest** (4.0.16) - テストフレームワーク

## プロジェクト構造

```
backend/
├── src/
│   ├── app.ts              # Fastifyアプリケーションの設定
│   ├── server.ts           # サーバーのエントリーポイント
│   ├── db/
│   │   └── index.ts        # データベース接続
│   ├── prisma/
│   │   └── client.ts       # Prismaクライアント
│   ├── trpc/
│   │   ├── router.ts       # tRPCルーターの定義
│   │   ├── context.ts      # tRPCコンテキスト
│   │   └── todo.ts         # TODOエンドポイント
│   ├── types/
│   │   └── index.ts        # 型定義
│   └── utils/
│       └── errors.ts       # エラーハンドリング
├── prisma/
│   ├── schema.prisma       # Prismaスキーマ定義
│   └── migrations/         # データベースマイグレーション
├── tests/
│   ├── todo.spec.ts        # TODOバリデーションテスト
│   └── errors.spec.ts      # エラーハンドリングテスト
├── Dockerfile              # Dockerイメージ定義
├── package.json
└── tsconfig.json
```

## セットアップ

### 前提条件

- Node.js >= 14.0.0
- pnpm
- PostgreSQL

### インストール

1. 依存関係をインストール

```bash
pnpm install
```

2. 環境変数を設定

`.env`ファイルを作成し、以下の環境変数を設定してください：

```env
DATABASE_URL="postgresql://username:password@localhost:5432/todo_db?schema=public"
PORT=3000
```

3. データベースマイグレーション

```bash
pnpm prisma migrate dev
```

## 実行方法

### 開発モード

```bash
pnpm dev
```

サーバーは `http://localhost:3000` で起動します。

### ビルド

```bash
pnpm build
```

### 本番モード

```bash
pnpm start
```

### テスト

```bash
pnpm test
```

## API仕様

### tRPC エンドポイント

すべてのエンドポイントは `/trpc` プレフィックス配下で利用できます。

#### `todo.getAll`

すべてのTODOを取得

```typescript
// リクエスト
trpc.todo.getAll.query()

// レスポンス
Todo[]
```

#### `todo.getById`

IDを指定してTODOを取得

```typescript
// リクエスト
trpc.todo.getById.query({ id: 'uuid' })

// レスポンス
Todo | null
```

#### `todo.create`

新しいTODOを作成

```typescript
// リクエスト
trpc.todo.create.mutate({
  title: string,          // 必須
  description?: string,   // 任意
  dueDate?: string       // 任意 (ISO 8601形式)
})

// レスポンス
Todo
```

#### `todo.update`

既存のTODOを更新

```typescript
// リクエスト
trpc.todo.update.mutate({
  id: string,            // 必須
  title: string,         // 必須
  description?: string,  // 任意
  dueDate?: string,     // 任意
  status: 'todo' | 'doing' | 'done'  // 必須
})

// レスポンス
Todo
```

#### `todo.delete`

TODOを削除

```typescript
// リクエスト
trpc.todo.delete.mutate({ id: 'uuid' })

// レスポンス
Todo
```

### ヘルスチェック

```
GET /health
```

レスポンス:
```json
{
  "status": "ok"
}
```

## データモデル

### Todo

| フィールド    | 型        | 必須 | デフォルト | 説明                           |
|--------------|-----------|------|-----------|-------------------------------|
| id           | String    | ✓    | uuid()    | 一意識別子                     |
| title        | String    | ✓    | -         | TODOのタイトル                 |
| description  | String?   |      | ""        | TODOの詳細説明                 |
| status       | String    | ✓    | "todo"    | ステータス (todo/doing/done)   |
| dueDate      | DateTime? |      | null      | 期限日時                       |
| createdAt    | DateTime  | ✓    | now()     | 作成日時                       |
| updatedAt    | DateTime  | ✓    | now()     | 更新日時                       |

## バリデーション

Valibotを使用してリクエストデータのバリデーションを行っています。

### 作成時のバリデーション

- `title`: 1文字以上の文字列（必須）
- `description`: 文字列（任意）
- `dueDate`: 文字列（任意）

### 更新時のバリデーション

- `id`: 文字列（必須）
- `title`: 1文字以上の文字列（必須）
- `description`: 文字列（任意）
- `dueDate`: 文字列（任意）
- `status`: `'todo'` | `'doing'` | `'done'`（必須）

## テスト

テストは`tests/`ディレクトリ配下にあります。

```bash
# すべてのテストを実行
pnpm test

# ウォッチモード
pnpm test --watch
```

### テストカバレッジ

- **Todo バリデーション**: 19テスト
- **エラーハンドリング**: 9テスト

合計: 28テスト

## Docker

### イメージのビルド

```bash
docker build -t todo-backend .
```

### コンテナの実行

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://username:password@host:5432/todo_db" \
  todo-backend
```

## トラブルシューティング

### データベース接続エラー

`DATABASE_URL`環境変数が正しく設定されているか確認してください。

```bash
# Prismaクライアントの再生成
pnpm prisma generate

# データベース接続テスト
pnpm prisma db push
```

### マイグレーションエラー

```bash
# マイグレーションをリセット
pnpm prisma migrate reset

# 新しいマイグレーションを作成
pnpm prisma migrate dev --name init
```

## 開発

### Prismaスキーマの変更

1. `prisma/schema.prisma`を編集
2. マイグレーションを作成

```bash
pnpm prisma migrate dev --name migration_name
```

3. Prismaクライアントを再生成

```bash
pnpm prisma generate
```

### 新しいエンドポイントの追加

1. `src/trpc/todo.ts`にprocedureを追加
2. バリデーションスキーマを定義
3. テストを作成（`tests/`）
4. 実装してテストを実行
