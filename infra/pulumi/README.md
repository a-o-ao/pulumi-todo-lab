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

[Pulumi.yaml](Pulumi.yaml) にデフォルト設定があります。環境に応じて変更が必要な場合：

**方法1: pulumi config コマンドを使用**
```bash
pulumi config set aws:region ap-northeast-1
pulumi config set pulumi-todo-lab:projectName todo-app-20260102
pulumi config set pulumi-todo-lab:dbPassword --secret your-secure-password
```

**方法2: Pulumi.dev.yaml を直接編集
（既存の設定例を参照）

### 4. インフラとアプリケーションのデプロイ（自動化済み）

Pulumiが以下をすべて自動で実行します：
1. `pulumi up` でインフラとアプリケーションをデプロイ
2. データベースマイグレーションを手動実行（初回のみ）
3. CloudFront URLでアプリケーションにアクセス

**注意**: マイグレーション実行前はバックエンドがデータベースに接続できないためエラーになります。

```bash
cd infra/pulumi

# 依存パッケージのインストール
pnpm install

# プレビュー (変更内容の確認)
pulumi preview

# デプロイ（すべて自動実行）
pulumi up
```

**注意**: 初回デプロイ時は10-15分程度かかります。Docker イメージのビルドとアップロードに時間がかかるためです。

## デプロイ後の作業

### アプリケーションの確認

デプロイが完了したら、CloudFront URLにアクセスしてアプリケーションを確認できます：

```bash
# CloudFront URLを取得
pulumi stack output cloudFrontUrl
```

ブラウザで表示されたURLにアクセスしてください。

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
# 実際のプロジェクト名を使用
aws logs tail /ecs/todo-app-20260102-dev-backend --follow

# または、Pulumiから取得
pulumi stack output ecsClusterName

# ECRにイメージがプッシュされているか確認
aws ecr list-images --repository-name todo-app-20260102-dev-backend

# ECRイメージを確認
pulumi stack output ecrRepositoryUrl
aws ecr list-images --repository-name $(pulumi stack output ecrRepositoryUrl | cut -d'/' -f2)
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
├── aws/                  # AWSリソース定義
│   ├── vpc.ts            # VPC、サブネット、ルートテーブル
│   ├── security.ts       # セキュリティグループ
│   ├── rds.ts            # RDS PostgreSQL
│   ├── ecr.ts            # ECR レジストリ
│   ├── ecs.ts            # ECS クラスター、サービス、EC2
│   ├── s3.ts             # S3 バケット (フロントエンド)
│   └── cloudfront.ts     # CloudFront ディストリビューション
└── deploy/               # デプロイロジック
    ├── docker-build.ts   # バックエンド Docker ビルド＆プッシュ
    └── frontend-deploy.ts # フロントエンド ビルド＆S3アップロード
```
