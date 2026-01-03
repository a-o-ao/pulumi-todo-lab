# Pulumi Infrastructure for TODO Application

このディレクトリには、TODO アプリケーションのAWSインフラをPulumiでコード化した定義が含まれています。

## アーキテクチャ

### フロントエンド
- **CloudFront + S3**: React SPAをホスティング
  - S3にビルド済みの静的ファイルを配置
  - CloudFrontでHTTPS配信とグローバルCDN

### バックエンド
- **ECS + EC2**: Dockerコンテナで動作
  - ECR: Dockerイメージレジストリ
  - ECS Cluster: コンテナオーケストレーション
  - EC2 (t3.small): ECSタスクを実行
- **RDS PostgreSQL (db.t3.micro)**: データベース
  - プライベートサブネットに配置
  - 自動バックアップ有効

### ネットワーク
- **VPC**: 10.0.0.0/16
- **Public Subnets**: 2つのAZ (ap-northeast-1a, ap-northeast-1c)
- **Private Subnets**: RDS用 (2つのAZ)

## 必要な環境

- Node.js 18+
- Pulumi CLI (`npm install -g @pulumi/cli`)
- AWS CLI (設定済み)
- Docker (バックエンドイメージのビルド用)

## セットアップ

### 1. Pulumi プロジェクトの初期化

```bash
cd infra/pulumi
pnpm install
```

### 2. Pulumi スタックの設定

```bash
# Pulumi にログイン (初回のみ)
pulumi login

# スタックの選択/作成
pulumi stack select dev
# または新規作成
pulumi stack init dev
```

### 3. 設定値の確認・変更

`Pulumi.yaml` で以下を設定:

- `aws:region`: ap-northeast-1 (東京リージョン)
- `projectName`: todo-app
- `environment`: dev
- `dbUsername`: todouser
- `dbPassword`: **本番環境では AWS Secrets Manager を使用**
- `instanceType`: t3.small
- `dbInstanceClass`: db.t3.micro

### 4. バックエンドDockerイメージのビルドとプッシュ

```bash
# リポジトリURLを取得 (pulumi up 後に実行)
pulumi stack output ecrRepositoryUrl

# バックエンドイメージをビルド
cd ../../backend
docker build -t todo-backend .

# ECRにログイン
aws ecr get-login-password --region ap-northeast-1 | \
  docker login --username AWS --password-stdin <ECR_REPOSITORY_URL>

# タグ付けしてプッシュ
docker tag todo-backend:latest <ECR_REPOSITORY_URL>:latest
docker push <ECR_REPOSITORY_URL>:latest
```

### 5. インフラのデプロイ

```bash
cd infra/pulumi

# プレビュー (変更内容の確認)
pulumi preview

# デプロイ
pulumi up
```

## デプロイ後の作業

### 1. データベースマイグレーション

```bash
# EC2インスタンスにSSH接続
ssh -i <your-key.pem> ec2-user@<EC2_PUBLIC_IP>

# または、RDSに直接接続できる環境から
export DATABASE_URL=$(pulumi stack output rdsDatabaseUrl --show-secrets)
cd backend
pnpm prisma migrate deploy
```

### 2. フロントエンドのデプロイ

```bash
cd frontend

# ビルド (バックエンドURLを環境変数に設定)
export VITE_API_URL=https://<CLOUDFRONT_DOMAIN>
pnpm build

# S3にアップロード
aws s3 sync dist/ s3://$(pulumi -C ../infra/pulumi stack output s3BucketName)/ --delete
```

## 出力値

デプロイ後、以下の情報が出力されます:

```bash
pulumi stack output
```

- `cloudFrontUrl`: フロントエンドのURL
- `ec2PublicIp`: バックエンドEC2インスタンスのパブリックIP
- `ecrRepositoryUrl`: Dockerイメージのプッシュ先
- `rdsEndpoint`: RDSエンドポイント
- `rdsDatabaseUrl`: PostgreSQL接続文字列

## コスト試算

- EC2 t3.small: ~$15/月
- RDS db.t3.micro: ~$15/月
- CloudFront: ~$1/月 (トラフィック次第)
- S3: ~$0.5/月
- **合計: 約$32-36/月**

## トラブルシューティング

### ECSタスクが起動しない

```bash
# ECSタスクのログを確認
aws logs tail /ecs/todo-app-dev-backend --follow

# ECRにイメージがプッシュされているか確認
aws ecr list-images --repository-name todo-app-dev-backend
```

### RDSに接続できない

- セキュリティグループでECSからのアクセスが許可されているか確認
- VPCの設定を確認 (プライベートサブネットにRDSがあるか)

### CloudFrontでバックエンドAPIにアクセスできない

- EC2インスタンスでバックエンドが起動しているか確認
- セキュリティグループでポート3000が開いているか確認

## クリーンアップ

```bash
# すべてのリソースを削除
pulumi destroy

# スタックを削除
pulumi stack rm dev
```

## 本番環境への移行

1. **データベースパスワード**: AWS Secrets Manager に移行
2. **カスタムドメイン**: Route 53 + ACM証明書を設定
3. **Multi-AZ**: RDSのMulti-AZ有効化
4. **Auto Scaling**: ECS ServiceにAuto Scalingを設定
5. **モニタリング**: CloudWatch Alarms設定

## ファイル構成

```
infra/pulumi/
├── index.ts              # メインエントリーポイント
├── Pulumi.yaml           # プロジェクト設定
├── package.json          # 依存関係
├── tsconfig.json         # TypeScript設定
└── aws/
    ├── vpc.ts            # VPC、サブネット、ルートテーブル
    ├── security.ts       # セキュリティグループ
    ├── rds.ts            # RDS PostgreSQL
    ├── ecr.ts            # ECR レジストリ
    ├── ecs.ts            # ECS クラスター、サービス、EC2
    ├── s3.ts             # S3 バケット (フロントエンド)
    └── cloudfront.ts     # CloudFront ディストリビューション
```
