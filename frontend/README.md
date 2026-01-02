# Frontend - TODOアプリケーション

## 概要

React + TypeScriptで実装された、TODOアプリケーションのフロントエンドです。tRPC、Material-UI、Viteを使用しています。

## 技術スタック

- **React** (18.0.0) - UIライブラリ
- **TypeScript** (4.0.0) - 型安全な開発
- **Vite** (3.0.0) - 高速なビルドツール
- **tRPC** (11.8.1) - 型安全なAPI通信
- **TanStack Query** (5.90.12) - データフェッチング・キャッシング
- **Material-UI** (5.0.0) - UIコンポーネントライブラリ
- **React Hook Form** (7.0.0) - フォーム管理
- **Valibot** (1.0.0) - スキーマバリデーション
- **Vitest** (4.0.16) - テストフレームワーク

## プロジェクト構造

```
frontend/
├── src/
│   ├── App.tsx             # メインアプリケーションコンポーネント
│   ├── main.tsx            # エントリーポイント
│   ├── components/         # 再利用可能なコンポーネント
│   │   ├── TodoEditor.tsx  # TODO編集フォーム
│   │   └── TodoTable.tsx   # TODO一覧テーブル
│   ├── pages/              # ページコンポーネント
│   │   ├── TodoForm.tsx    # TODO作成・更新フォーム
│   │   └── TodoList.tsx    # TODO一覧ページ
│   ├── services/           # 外部サービス連携
│   │   └── trpcClient.ts   # tRPCクライアント設定
│   └── types/              # 型定義
│       └── index.ts
├── tests/
│   ├── App.spec.tsx        # Appコンポーネントのテスト
│   └── test-utils.tsx      # テストユーティリティ
├── index.html              # HTMLエントリーポイント
├── vite.config.ts          # Vite設定
├── vitest.config.ts        # Vitest設定
└── package.json
```

## セットアップ

### 前提条件

- Node.js >= 14.0.0
- pnpm
- バックエンドサーバーが稼働していること

### インストール

```bash
pnpm install
```

### 環境設定

バックエンドAPIのURLは `src/services/trpcClient.ts` で設定されています。

デフォルト: `http://localhost:3000/trpc`

別のURLを使用する場合は、以下を変更してください：

```typescript
const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://your-backend-url/trpc',
    }),
  ],
});
```

## 実行方法

### 開発モード

```bash
pnpm dev
```

ブラウザで `http://localhost:3000` が自動的に開きます。

### ビルド

```bash
pnpm build
```

ビルド成果物は `dist/` ディレクトリに出力されます。

### プレビュー

ビルド後のアプリケーションをプレビュー：

```bash
pnpm serve
```

### テスト

```bash
pnpm test
```

## 機能

### TODO管理

- ✅ TODO一覧の表示
- ✅ 新規TODOの作成
- ✅ TODOの編集
- ✅ TODOの削除
- ✅ ステータス管理（todo / doing / done）
- ✅ 期限日の設定

### フォームバリデーション

React Hook FormとValibotを使用した、クライアントサイドバリデーション：

- タイトルは必須（1文字以上）
- 詳細説明は任意
- 期限日は任意

## コンポーネント

### App.tsx

メインアプリケーションコンポーネント。Material-UIのレイアウトとページコンポーネントを組み合わせています。

### TodoForm.tsx

TODO作成・更新用のフォームコンポーネント。以下の機能を提供：

- React Hook Formによるフォーム管理
- Valibotによるバリデーション
- Material-UI TextFieldコンポーネント
- tRPCによるデータ送信

### TodoList.tsx

TODO一覧を表示するコンポーネント。以下の機能を提供：

- tRPC経由でのデータ取得
- ローディング状態の表示
- エラーハンドリング
- テーブル形式での表示

### TodoEditor.tsx

TODOの編集機能を提供するコンポーネント（基本実装）。

### TodoTable.tsx

React Queryを使用したTODO一覧テーブルコンポーネント。

## tRPCクライアント

型安全なAPI通信のため、tRPCを使用しています。

### 使用例

```typescript
// TODO一覧の取得
const { data, isLoading, error } = trpc.todo.getAll.useQuery();

// TODO作成
const createMutation = trpc.todo.create.useMutation({
  onSuccess: () => {
    // 成功時の処理
  }
});

createMutation.mutate({
  title: 'タイトル',
  description: '詳細',
  dueDate: '2026-12-31'
});
```

## スタイリング

Material-UIを使用したコンポーネントベースのスタイリング：

- `CssBaseline` - ブラウザのデフォルトスタイルをリセット
- `Container` - レスポンシブなコンテナ
- `TextField` - Material-UI標準のテキスト入力
- `Button` - Material-UI標準のボタン

## テスト

Testing Library とVitestを使用したコンポーネントテスト。

> ⚠️ **注意**: 現在、フロントエンドのテストコードは基本的なものしか実装されていません。TodoEditorやTodoFormなどの主要コンポーネントのテストは未完成です。tRPCのモックや複雑なコンポーネントのテストについては、今後の実装課題となっています。

### テストの実行

```bash
# 全テストを実行
pnpm test

# ウォッチモード
pnpm test --watch
```

### 現在のテストカバレッジ

- ✅ `App.spec.tsx` - 基本的なレンダリングテスト（1テスト）
- ⚠️ コンポーネント単体テスト - 未実装
- ⚠️ フォームバリデーションテスト - 未実装
- ⚠️ tRPC統合テスト - 未実装

### テストユーティリティ

`tests/test-utils.tsx` にtRPCとReact Queryのプロバイダーをラップしたカスタムレンダー関数を用意しています。

```typescript
import { render, screen } from './test-utils';

it('renders component', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeDefined();
});
```

## ビルドとデプロイ

### 本番ビルド

```bash
pnpm build
```

最適化されたビルド成果物が `dist/` ディレクトリに生成されます。

## トラブルシューティング

### バックエンドに接続できない

1. バックエンドサーバーが起動しているか確認
2. `src/services/trpcClient.ts` のURLが正しいか確認
3. CORSが有効になっているか確認（バックエンド側）

### ビルドエラー

```bash
# node_modulesをクリーンアップ
rm -rf node_modules
pnpm install

# キャッシュをクリア
rm -rf dist
pnpm build
```

### 型エラー

バックエンドの型定義が変更された場合、フロントエンドの再ビルドが必要です：

```bash
pnpm install
```

## 開発のヒント

### ホットリロード

Viteの開発サーバーは自動的にホットリロードを提供します。ファイルを保存すると即座にブラウザに反映されます。

### デバッグ

React Developer Toolsを使用して、コンポーネントの状態やpropsを確認できます。

### パフォーマンス最適化

- React Queryが自動的にデータをキャッシュ
- Viteが最適化されたバンドルを生成
- Material-UIのTree Shakingにより未使用コンポーネントを除外

## 依存関係の更新

```bash
# パッケージの更新確認
pnpm outdated

# 依存関係を更新
pnpm update
```
