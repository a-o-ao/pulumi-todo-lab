import * as pulumi from "@pulumi/pulumi";
import * as command from "@pulumi/command";
import * as synced from "@pulumi/synced-folder";

export interface FrontendDeployArgs {
  projectName: string;
  environment: string;
  bucketName: pulumi.Input<string>;
  frontendPath: string; // frontendディレクトリのパス
  apiUrl: pulumi.Input<string>; // CloudFront URLまたはバックエンドURL
}

export class FrontendDeployStack {
  public readonly syncedFolder: synced.S3BucketFolder;

  constructor(args: FrontendDeployArgs) {
    const name = `${args.projectName}-${args.environment}`;

    // フロントエンドのビルドコマンドを実行
    const buildCommand = new command.local.Command(`${name}-frontend-build`, {
      dir: args.frontendPath,
      create: pulumi.interpolate`powershell -Command "$env:VITE_API_URL='${args.apiUrl}'; pnpm install; pnpm build"`,
      // ファイルの変更を検知してビルドを再実行
      triggers: [Date.now()], // 常に再ビルド（開発環境用）
    });

    // ビルドしたファイルをS3にアップロード
    this.syncedFolder = new synced.S3BucketFolder(`${name}-frontend-sync`, {
      path: pulumi.interpolate`${args.frontendPath}/dist`,
      bucketName: args.bucketName,
      acl: "private", // CloudFront OAI経由でアクセス
      managedObjects: true, // 削除されたファイルもS3から削除
    }, {
      dependsOn: [buildCommand],
    });
  }
}
