# pulumi-todo-lab

## 概要
このプロジェクトは、Pulumiを利用したインフラストラクチャのコード（IaC）を学ぶためのTODOアプリケーションです。ローカル環境からAWS（EC2、S3、CloudFront）への移行を前提とした設計が行われています。また、tRPCを使用して型安全なAPI設計を実現しています。

## 目的
- Pulumiを利用したIaCの学習
- ローカルからAWSへの移行を前提とした設計練習
- tRPCによる型安全なAPI設計の習得

## 技術スタック
- **Backend**
  - TypeScript
  - Fastify
  - tRPC
  - Prisma
  - PostgreSQL

- **Frontend**
  - React
  - MUI
  - React Hook Form
  - Valibot

- **Infra / Tooling**
  - Pulumi
  - Vitest

## 機能
- TODO管理（基本CRUD）
- 状態管理（`todo`、`doing`、`done`）

## 環境構成
- **ローカル環境**
  - APIサーバ（Fastify）
  - PostgreSQL（Docker）

## 完成条件
- ローカル環境でCRUDが一通り動作すること
- フロントエンドからtRPC経由で操作できること
- Pulumiを利用してAWS環境にデプロイできること

## ローカル環境でのセットアップと実行

### 前提条件

- Node.js >= 14.0.0
- pnpm
- Docker & Docker Compose

### 1. 依存関係のインストール

```bash
# ルートから全パッケージをインストール
pnpm install
```

### 2. データベースの起動

Docker Composeを使用してPostgreSQLを起動します：

```bash
docker-compose up -d
```

データベースが起動したことを確認：

```bash
docker-compose ps
```

### 3. バックエンドのセットアップ

#### 環境変数の設定

```bash
cd backend
cp .env.example .env
```

`.env`ファイルを編集（必要に応じて）：

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/todo_db?schema=public"
PORT=3000
```

#### データベースマイグレーション

```bash
pnpm prisma migrate dev
```

#### バックエンドサーバーの起動

```bash
pnpm dev
```

バックエンドは `http://localhost:3000` で起動します。

### 5. フロントエンドの起動

別のターミナルで：

```bash
cd frontend
pnpm dev
```

フロントエンドは `http://localhost:3000` で起動し、ブラウザが自動的に開きます。

### クイックスタート（すべてを一度に実行）

プロジェクトルートから：

```bash
# データベースを起動
docker-compose up -d

# バックエンドとフロントエンドを同時に起動
pnpm dev
```

このコマンドは `concurrently` を使用して、バックエンドとフロントエンドを同時に起動します。

### テストの実行

```bash
# すべてのテストを実行（backend + frontend）
pnpm test

# バックエンドのみ
pnpm test:backend

# フロントエンドのみ
pnpm test:frontend
```

### データベースのリセット

開発中にデータベースをリセットしたい場合：

```bash
cd backend
pnpm prisma migrate reset
```

### 停止方法

```bash
# バックエンド・フロントエンドを停止: Ctrl+C

# データベースを停止
docker-compose down

# データベースのデータも削除する場合
docker-compose down -v
```

## ディレクトリ構造

```
pulumi-todo-lab/
├── backend/           # バックエンドAPI（Fastify + tRPC + Prisma）
├── frontend/          # フロントエンド（React + Material-UI）
├── infra/            # インフラストラクチャコード（Pulumi）
├── doc/              # ドキュメント
├── scripts/          # 開発用スクリプト
├── docker-compose.yml # PostgreSQL用Docker設定
└── package.json      # モノレポ設定
```

詳細な手順は各ディレクトリ内のREADMEを参照してください：

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [Infra README](./infra/pulumi/README.md)