import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

export interface SecurityGroupArgs {
  projectName: string;
  environment: string;
  vpcId: pulumi.Input<string>;
}

export class SecurityGroups {
  public readonly ecsSecurityGroup: aws.ec2.SecurityGroup;
  public readonly rdsSecurityGroup: aws.ec2.SecurityGroup;

  constructor(args: SecurityGroupArgs) {
    const name = `${args.projectName}-${args.environment}`;

    // ECS/EC2 Security Group
    this.ecsSecurityGroup = new aws.ec2.SecurityGroup(`${name}-ecs-sg`, {
      vpcId: args.vpcId,
      description: "Security group for ECS tasks",
      ingress: [
        {
          protocol: "tcp",
          fromPort: 3000,
          toPort: 3000,
          cidrBlocks: ["0.0.0.0/0"], // 本番環境では CloudFront IP範囲に制限
          description: "Allow HTTP traffic to backend API",
        },
        {
          protocol: "tcp",
          fromPort: 22,
          toPort: 22,
          cidrBlocks: ["0.0.0.0/0"], // 本番環境では管理者IPに制限
          description: "SSH access for management",
        },
      ],
      egress: [
        {
          protocol: "-1",
          fromPort: 0,
          toPort: 0,
          cidrBlocks: ["0.0.0.0/0"],
          description: "Allow all outbound traffic",
        },
      ],
      tags: {
        Name: `${name}-ecs-sg`,
      },
    });

    // RDS Security Group
    this.rdsSecurityGroup = new aws.ec2.SecurityGroup(`${name}-rds-sg`, {
      vpcId: args.vpcId,
      description: "Security group for RDS PostgreSQL",
      ingress: [
        {
          protocol: "tcp",
          fromPort: 5432,
          toPort: 5432,
          securityGroups: [this.ecsSecurityGroup.id],
          description: "Allow PostgreSQL from ECS",
        },
      ],
      egress: [
        {
          protocol: "-1",
          fromPort: 0,
          toPort: 0,
          cidrBlocks: ["0.0.0.0/0"],
        },
      ],
      tags: {
        Name: `${name}-rds-sg`,
      },
    });
  }
}
