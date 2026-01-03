import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

export interface EcsArgs {
  projectName: string;
  environment: string;
  vpcId: pulumi.Input<string>;
  subnetIds: pulumi.Input<string>[];
  securityGroupIds: pulumi.Input<string>[];
  instanceType: string;
  imageUri: pulumi.Input<string>;
  databaseUrl: pulumi.Input<string>;
}

export class EcsStack {
  public readonly cluster: aws.ecs.Cluster;
  public readonly service: aws.ecs.Service;
  public readonly taskDefinition: aws.ecs.TaskDefinition;
  public readonly ec2Instance: aws.ec2.Instance;
  public readonly publicIp: pulumi.Output<string>;
  public readonly publicDns: pulumi.Output<string>;

  constructor(args: EcsArgs) {
    const name = `${args.projectName}-${args.environment}`;

    // ECS Cluster
    this.cluster = new aws.ecs.Cluster(`${name}-cluster`, {
      name: `${name}-cluster`,
      settings: [{
        name: "containerInsights",
        value: "enabled",
      }],
      tags: {
        Name: `${name}-cluster`,
        Environment: args.environment,
      },
    });

    // IAM Role for ECS Task Execution
    const taskExecutionRole = new aws.iam.Role(`${name}-task-execution-role`, {
      assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
          Effect: "Allow",
          Principal: {
            Service: "ecs-tasks.amazonaws.com",
          },
          Action: "sts:AssumeRole",
        }],
      }),
    });

    new aws.iam.RolePolicyAttachment(`${name}-task-execution-policy`, {
      role: taskExecutionRole.name,
      policyArn: "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
    });

    // CloudWatch Log Group
    const logGroup = new aws.cloudwatch.LogGroup(`${name}-backend-logs`, {
      name: `/ecs/${name}-backend`,
      retentionInDays: 7,
    });

    // Task Definition
    this.taskDefinition = new aws.ecs.TaskDefinition(`${name}-backend-task`, {
      family: `${name}-backend`,
      networkMode: "bridge",
      requiresCompatibilities: ["EC2"],
      cpu: "256",
      memory: "512",
      executionRoleArn: taskExecutionRole.arn,
      containerDefinitions: pulumi.interpolate`[
                {
                    "name": "backend",
                    "image": "${args.imageUri}",
                    "cpu": 256,
                    "memory": 512,
                    "essential": true,
                    "portMappings": [
                        {
                            "containerPort": 3000,
                            "hostPort": 3000,
                            "protocol": "tcp"
                        }
                    ],
                    "environment": [
                        {
                            "name": "DATABASE_URL",
                            "value": "${args.databaseUrl}"
                        },
                        {
                            "name": "PORT",
                            "value": "3000"
                        },
                        {
                            "name": "NODE_ENV",
                            "value": "production"
                        }
                    ],
                    "logConfiguration": {
                        "logDriver": "awslogs",
                        "options": {
                            "awslogs-group": "${logGroup.name}",
                            "awslogs-region": "ap-northeast-1",
                            "awslogs-stream-prefix": "ecs"
                        }
                    }
                }
            ]`,
    });

    // IAM Role for EC2 Instance
    const ec2Role = new aws.iam.Role(`${name}-ec2-role`, {
      assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
          Effect: "Allow",
          Principal: {
            Service: "ec2.amazonaws.com",
          },
          Action: "sts:AssumeRole",
        }],
      }),
    });

    new aws.iam.RolePolicyAttachment(`${name}-ec2-policy`, {
      role: ec2Role.name,
      policyArn: "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role",
    });

    const instanceProfile = new aws.iam.InstanceProfile(`${name}-instance-profile`, {
      role: ec2Role.name,
    });

    // User Data for EC2 (ECS Agent設定)
    const userData = pulumi.interpolate`#!/bin/bash
echo ECS_CLUSTER=${this.cluster.name} >> /etc/ecs/ecs.config
echo ECS_ENABLE_CONTAINER_METADATA=true >> /etc/ecs/ecs.config
`;

    // EC2 Instance (ECS Container Instance)
    // 最新のECS最適化AMIを取得
    const ecsAmi = aws.ec2.getAmi({
      mostRecent: true,
      owners: ["amazon"],
      filters: [
        {
          name: "name",
          values: ["amzn2-ami-ecs-hvm-*-x86_64-ebs"],
        },
      ],
    });

    this.ec2Instance = new aws.ec2.Instance(`${name}-ecs-instance`, {
      ami: ecsAmi.then(ami => ami.id),
      instanceType: args.instanceType,
      subnetId: args.subnetIds[0],
      vpcSecurityGroupIds: args.securityGroupIds,
      iamInstanceProfile: instanceProfile.name,
      userData: userData,
      tags: {
        Name: `${name}-ecs-instance`,
        Environment: args.environment,
      },
    });

    this.publicIp = this.ec2Instance.publicIp;
    this.publicDns = this.ec2Instance.publicDns;

    // ECS Service
    this.service = new aws.ecs.Service(`${name}-backend-service`, {
      name: `${name}-backend`,
      cluster: this.cluster.arn,
      taskDefinition: this.taskDefinition.arn,
      desiredCount: 1,
      launchType: "EC2",
      tags: {
        Name: `${name}-backend-service`,
        Environment: args.environment,
      },
    }, {
      dependsOn: [this.ec2Instance],
    });
  }
}
