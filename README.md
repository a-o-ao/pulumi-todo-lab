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

## テスト
- tRPCプロシージャのユニットテスト
- バリデーションテスト
- Job登録ロジックのテスト

## 使い方
1. 環境変数を設定するために`.env.example`をコピーして`.env`を作成します。
2. Dockerを使用してPostgreSQLを起動します。
3. バックエンドサーバーを起動します。
4. フロントエンドアプリケーションを起動します。

詳細な手順は各ディレクトリ内のREADMEやドキュメントを参照してください。