# Todo App - 自動デプロイガイド

このプロジェクトは、バックエンドとフロントエンドのビルド＆デプロイを完全に自動化しています。

## 🚀 クイックスタート

### 前提条件

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- AWS CLI（設定済み）
- Docker
- Pulumi CLI

### 1. 依存関係のインストール

```bash
cd pulumi-todo-lab
pnpm install
```

### 2. Pulumi の初期設定

```bash
cd infra/pulumi

# Pulumi にログイン
pulumi login

# スタックを選択/作成
pulumi stack select dev
# または
pulumi stack init dev
```

### 3. 設定の確認

`Pulumi.dev.yaml` で以下を確認：

- `aws:region`: ap-northeast-1
- `projectName`: todo-app-20260102
- `environment`: dev
- `dbUsername`: todouser
- `dbPassword`: (本番環境では AWS Secrets Manager を推奨)
- `instanceType`: t3.small
- `dbInstanceClass`: db.t3.micro

### 4. デプロイ実行（全自動）

```bash
pulumi up
```

このコマンドで以下が自動実行されます：

1. ✅ VPC、サブネット、セキュリティグループの作成
2. ✅ RDS PostgreSQL データベースの作成
3. ✅ ECR リポジトリの作成
4. ✅ **バックエンドの Docker イメージビルド＆ECR プッシュ**
5. ✅ ECS クラスター＆EC2 インスタンスの作成
6. ✅ S3 バケットの作成
7. ✅ CloudFront ディストリビューションの作成
8. ✅ **フロントエンドのビルド＆S3 アップロード**

⏱️ 初回デプロイ: 約 10-15 分

### 5. デプロイ後の作業

#### データベースマイグレーション

```bash
# パスフレーズを設定
$env:PULUMI_CONFIG_PASSPHRASE = "<あなたが設定したパスフレーズ>"

# 接続文字列を取得
cd infra/pulumi
$env:DATABASE_URL = pulumi stack output rdsDatabaseUrl --show-secrets

# マイグレーションを実行
cd ../../backend
pnpm prisma migrate deploy
```

#### アプリケーションの確認

```bash
cd ../../infra/pulumi
pulumi stack output cloudFrontUrl
```

出力された URL をブラウザで開いてください。

## 📊 デプロイ出力

```bash
pulumi stack output
```

- `cloudFrontUrl`: アプリケーションの URL
- `ec2PublicIp`: バックエンド EC2 の IP
- `rdsDatabaseUrl`: データベース接続文字列（シークレット）
- `ecrRepositoryUrl`: ECR リポジトリ
- `rdsEndpoint`: RDS エンドポイント
- `s3BucketName`: S3 バケット名

## 🔄 更新デプロイ

コードを変更したら、再度デプロイするだけです：

```bash
cd infra/pulumi
pulumi up
```

Pulumi が変更を検出し、必要なリソースのみを更新します：
- バックエンドのコードが変更 → Docker イメージを再ビルド＆プッシュ
- フロントエンドのコードが変更 → 再ビルド＆S3 にアップロード

## 🧹 リソースの削除

```bash
cd infra/pulumi
pulumi destroy
```

すべての AWS リソースが削除されます。

## 💰 月間コスト見積もり

- EC2 t3.small: ~$15/月
- RDS db.t3.micro: ~$15/月
- CloudFront: ~$1/月
- S3: ~$0.5/月
- **合計: 約 $32-36/月**

## 🐛 トラブルシューティング

### Docker イメージのビルドが失敗する

- Docker Desktop が起動しているか確認
- `docker ps` でDocker が動作しているか確認

### フロントエンドのビルドが失敗する

- `cd frontend && pnpm install` を実行
- ビルドエラーがないか確認: `pnpm build`

### ECS タスクが起動しない

```bash
# ログを確認
aws logs tail /ecs/todo-app-dev-backend --follow
```

### RDS に接続できない

- セキュリティグループの設定を確認
- VPC とサブネットの設定を確認

## 📚 関連ドキュメント

- [Pulumi AWS ドキュメント](https://www.pulumi.com/docs/clouds/aws/)
- [AWS ECS ベストプラクティス](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
