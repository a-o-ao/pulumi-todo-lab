import * as pulumi from "@pulumi/pulumi";
import * as path from "path";
import { VpcStack } from "./aws/vpc";
import { SecurityGroups } from "./aws/security";
import { RdsStack } from "./aws/rds";
import { EcrStack } from "./aws/ecr";
import { EcsStack } from "./aws/ecs";
import { S3Stack } from "./aws/s3";
import { CloudFrontStack } from "./aws/cloudfront";
import { DockerBuildStack } from "./deploy/docker-build";
import { FrontendDeployStack } from "./deploy/frontend-deploy";

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

// 5. Docker イメージのビルド＆プッシュ（自動化）
const projectRoot = path.resolve(__dirname, "../.."); // infra/pulumi から2階層上がプロジェクトルート
const dockerBuildStack = new DockerBuildStack({
    projectName,
    environment,
    repositoryUrl: ecrStack.repositoryUrl,
    contextPath: projectRoot,
});

// 6. ECS + EC2
const ecsStack = new EcsStack({
    projectName,
    environment,
    vpcId: vpcStack.vpc.id,
    subnetIds: [vpcStack.publicSubnet1.id],
    securityGroupIds: [securityGroups.ecsSecurityGroup.id],
    instanceType,
    imageUri: dockerBuildStack.imageUri,
    databaseUrl: rdsStack.connectionString,
});

// 7. S3 (Frontend)
const s3Stack = new S3Stack({
    projectName,
    environment,
});

// 8. CloudFront
const cloudFrontStack = new CloudFrontStack({
    projectName,
    environment,
    s3BucketDomainName: s3Stack.bucketDomainName,
    s3BucketId: s3Stack.bucketName,
    ec2PublicDns: ecsStack.publicDns,
});

// 9. フロントエンドのビルド＆デプロイ（自動化）
const frontendPath = path.resolve(__dirname, "../../frontend");
const frontendDeployStack = new FrontendDeployStack({
    projectName,
    environment,
    bucketName: s3Stack.bucketName,
    frontendPath: frontendPath,
    apiUrl: cloudFrontStack.domainName.apply((d: string) => `https://${d}`),
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
export const cloudFrontUrl = cloudFrontStack.domainName.apply((d: string) => `https://${d}`);