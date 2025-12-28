#!/bin/bash

# 環境変数の読み込み
set -a
source .env.example
set +a

# Dockerコンテナの起動
docker-compose up -d

# データベースの初期化
bash scripts/db-init.sh

# APIサーバの起動
npm run start --prefix backend &

# フロントエンドの起動
npm run dev --prefix frontend &

# プロセスの監視
wait