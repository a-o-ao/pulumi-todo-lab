import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

export interface EcrArgs {
  projectName: string;
  environment: string;
}

export class EcrStack {
  public readonly repository: aws.ecr.Repository;
  public readonly repositoryUrl: pulumi.Output<string>;

  constructor(args: EcrArgs) {
    const name = `${args.projectName}-${args.environment}`;

    // ECR Repository
    this.repository = new aws.ecr.Repository(`${name}-backend`, {
      name: `${name}-backend`,
      imageScanningConfiguration: {
        scanOnPush: true,
      },
      imageTagMutability: "MUTABLE",
      tags: {
        Name: `${name}-backend`,
        Environment: args.environment,
      },
    });

    // Lifecycle Policy (古いイメージを自動削除)
    new aws.ecr.LifecyclePolicy(`${name}-backend-lifecycle`, {
      repository: this.repository.name,
      policy: JSON.stringify({
        rules: [
          {
            rulePriority: 1,
            description: "Keep last 5 images",
            selection: {
              tagStatus: "any",
              countType: "imageCountMoreThan",
              countNumber: 5,
            },
            action: {
              type: "expire",
            },
          },
        ],
      }),
    });

    this.repositoryUrl = this.repository.repositoryUrl;
  }
}
