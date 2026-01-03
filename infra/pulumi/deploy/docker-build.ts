import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as path from "path";
import * as command from "@pulumi/command";

export interface DockerBuildArgs {
  projectName: string;
  environment: string;
  repositoryUrl: pulumi.Output<string>;
  contextPath: string; // Dockerfileがあるディレクトリのパス（プロジェクトルートからの相対パス）
}

export class DockerBuildStack {
  public readonly imageUri: pulumi.Output<string>;

  constructor(args: DockerBuildArgs) {
    const name = `${args.projectName}-${args.environment}`;

    pulumi.log.info(`Docker build context: ${args.contextPath}`);
    pulumi.log.info(`Dockerfile path: ${path.join(args.contextPath, "backend", "Dockerfile")}`);

    // ECR認証情報を取得
    const authToken = aws.ecr.getAuthorizationTokenOutput({
      registryId: args.repositoryUrl.apply((url: string) => url.split(".")[0]),
    });

    const registry = args.repositoryUrl.apply((url: string) => url.split("/")[0]);
    const imageName = args.repositoryUrl.apply((url: string) => `${url}:latest`);

    // docker build (CLI) を実行
    const build = new command.local.Command(`${name}-docker-build`, {
      dir: args.contextPath,
      create: pulumi.interpolate`docker build --no-cache -f backend/Dockerfile -t ${imageName} .`,
      update: pulumi.interpolate`docker build --no-cache -f backend/Dockerfile -t ${imageName} .`,
    });

    // docker push (CLI) を実行
    new command.local.Command(`${name}-docker-push`, {
      dir: args.contextPath,
      create: pulumi.interpolate`echo ${authToken.password} | docker login --username ${authToken.userName} --password-stdin ${registry} && docker push ${imageName}`,
      update: pulumi.interpolate`echo ${authToken.password} | docker login --username ${authToken.userName} --password-stdin ${registry} && docker push ${imageName}`,
    }, { dependsOn: [build] });

    this.imageUri = imageName;
  }
}
