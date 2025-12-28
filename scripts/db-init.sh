#!/bin/bash

# 環境変数の読み込み
source ../backend/.env.example

# PostgreSQLデータベースの初期化
echo "データベースの初期化を開始します..."

# データベースの作成
psql -U $DB_USER -h $DB_HOST -p $DB_PORT -c "CREATE DATABASE $DB_NAME;"

# Prismaマイグレーションの実行
npx prisma migrate deploy

# 初期データの挿入（必要に応じて）
# psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -f ./scripts/seed.sql

echo "データベースの初期化が完了しました。"