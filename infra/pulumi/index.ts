import * as pulumi from "@pulumi/pulumi";
import { VpcStack } from "./aws/vpc";
import { SecurityGroups } from "./aws/security";
import { RdsStack } from "./aws/rds";
import { EcrStack } from "./aws/ecr";
import { EcsStack } from "./aws/ecs";
import { S3Stack } from "./aws/s3";
import { CloudFrontStack } from "./aws/cloudfront";

// Pulumi設定読み込み
const config = new pulumi.Config();
const projectName = config.require("projectName");
const environment = config.require("environment");
const dbUsername = config.require("dbUsername");
const dbPassword = config.require("dbPassword");
const dbName = config.require("dbName");
const instanceType = config.require("instanceType");
const dbInstanceClass = config.require("dbInstanceClass");

// 1. VPCとネットワーク
const vpcStack = new VpcStack({
    projectName,
    environment,
});

// 2. セキュリティグループ
const securityGroups = new SecurityGroups({
    projectName,
    environment,
    vpcId: vpcStack.vpc.id,
});

// 3. RDS PostgreSQL
const rdsStack = new RdsStack({
    projectName,
    environment,
    dbName,
    dbUsername,
    dbPassword,
    instanceClass: dbInstanceClass,
    subnetIds: [vpcStack.privateSubnet1.id, vpcStack.privateSubnet2.id],
    securityGroupIds: [securityGroups.rdsSecurityGroup.id],
});

// 4. ECR (Docker イメージレジストリ)
const ecrStack = new EcrStack({
    projectName,
    environment,
});

// 5. ECS + EC2
// NOTE: 初回デプロイ時は、ECRにイメージをpushしてから実行してください
// デフォルトイメージとして nginx を使用 (実際にはバックエンドのイメージに差し替え)
const imageUri = ecrStack.repositoryUrl.apply(url => `${url}:latest`);

const ecsStack = new EcsStack({
    projectName,
    environment,
    vpcId: vpcStack.vpc.id,
    subnetIds: [vpcStack.publicSubnet1.id],
    securityGroupIds: [securityGroups.ecsSecurityGroup.id],
    instanceType,
    imageUri,
    databaseUrl: rdsStack.connectionString,
});

// 6. S3 (Frontend)
const s3Stack = new S3Stack({
    projectName,
    environment,
});

// 7. CloudFront
const cloudFrontStack = new CloudFrontStack({
    projectName,
    environment,
    s3BucketDomainName: s3Stack.bucketDomainName,
    s3BucketId: s3Stack.bucketName,
    ec2PublicDns: ecsStack.publicDns,
});

// エクスポート
export const vpcId = vpcStack.vpc.id;
export const rdsEndpoint = rdsStack.endpoint;
export const rdsDatabaseUrl = rdsStack.connectionString;
export const ecrRepositoryUrl = ecrStack.repositoryUrl;
export const ecsClusterName = ecsStack.cluster.name;
export const ec2InstanceId = ecsStack.ec2Instance.id;
export const ec2PublicIp = ecsStack.publicIp;
export const s3BucketName = s3Stack.bucketName;
export const cloudFrontDomain = cloudFrontStack.domainName;
export const cloudFrontUrl = cloudFrontStack.domainName.apply(d => `https://${d}`);