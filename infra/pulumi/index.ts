import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Pulumiの設定を読み込む
const config = new pulumi.Config();
const projectName = config.require("projectName");

// S3バケットの作成
const bucket = new aws.s3.Bucket(`${projectName}-bucket`, {
    acl: "private",
});

// EC2インスタンスの作成
const server = new aws.ec2.Instance(`${projectName}-server`, {
    ami: "ami-0c55b159cbfafe01e", // 適切なAMIを選択
    instanceType: "t2.micro",
    tags: {
        Name: `${projectName}-server`,
    },
});

// CloudFrontディストリビューションの作成
const distribution = new aws.cloudfront.Distribution(`${projectName}-distribution`, {
    origins: [{
        domainName: bucket.bucketRegionalDomainName,
        originId: bucket.id,
    }],
    enabled: true,
    defaultCacheBehavior: {
        targetOriginId: bucket.id,
        viewerProtocolPolicy: "redirect-to-https",
        allowedMethods: ["GET", "HEAD"],
        cachedMethods: ["GET", "HEAD"],
        forwardedValues: {
            queryString: false,
            cookies: {
                forward: "none",
            },
        },
        minTtl: 0,
        maxTtl: 86400,
        defaultTtl: 86400,
    },
    defaultRootObject: "index.html",
});

// 出力
export const bucketName = bucket.id;
export const instancePublicIp = server.publicIp;
export const distributionDomainName = distribution.domainName;