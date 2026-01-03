import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Amazon ECS に最適化された AL2023 AMI を SSM Parameter Store から取得
const ecsAmiId = aws.ssm.getParameterOutput({
    name: "/aws/service/ecs/optimized-ami/amazon-linux-2023/recommended/image_id",
});

// EC2インスタンスの設定
const instance = new aws.ec2.Instance("todo-app-instance", {
    ami: ecsAmiId.value, // Amazon ECS に最適化された AL2023 AMI
    instanceType: "t2.micro",
    tags: {
        Name: "TodoAppInstance",
    },
});

// セキュリティグループの設定
const securityGroup = new aws.ec2.SecurityGroup("todo-app-sg", {
    ingress: [
        {
            protocol: "tcp",
            fromPort: 80,
            toPort: 80,
            cidrBlocks: ["0.0.0.0/0"], // HTTPトラフィックを許可
        },
        {
            protocol: "tcp",
            fromPort: 22,
            toPort: 22,
            cidrBlocks: ["0.0.0.0/0"], // SSHトラフィックを許可
        },
    ],
    egress: [
        {
            protocol: "-1", // 全てのトラフィックを許可
            fromPort: 0,
            toPort: 0,
            cidrBlocks: ["0.0.0.0/0"],
        },
    ],
});

// EC2インスタンスにセキュリティグループを適用
const instanceWithSecurityGroup = new aws.ec2.Instance("todo-app-instance-with-sg", {
    ami: instance.ami,
    instanceType: instance.instanceType,
    vpcSecurityGroupIds: [securityGroup.id],
    tags: instance.tags,
});

// 出力
export const instanceId = instanceWithSecurityGroup.id;
export const publicIp = instanceWithSecurityGroup.publicIp;
export const publicDns = instanceWithSecurityGroup.publicDns;