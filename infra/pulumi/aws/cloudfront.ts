import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

export interface CloudFrontArgs {
    projectName: string;
    environment: string;
    s3BucketDomainName: pulumi.Input<string>;
    s3BucketId: pulumi.Input<string>;
    ec2PublicDns: pulumi.Input<string>;
}

export class CloudFrontStack {
    public readonly distribution: aws.cloudfront.Distribution;
    public readonly domainName: pulumi.Output<string>;
    public readonly oai: aws.cloudfront.OriginAccessIdentity;

    constructor(args: CloudFrontArgs) {
        const name = `${args.projectName}-${args.environment}`;

        // Origin Access Identity (S3へのアクセス制御)
        this.oai = new aws.cloudfront.OriginAccessIdentity(`${name}-oai`, {
            comment: `OAI for ${name}`,
        });

        // S3 Bucket Policy (CloudFrontからのアクセスを許可)
        new aws.s3.BucketPolicy(`${name}-frontend-policy`, {
            bucket: args.s3BucketId,
            policy: pulumi.all([args.s3BucketId, this.oai.iamArn]).apply(([bucketId, oaiArn]) =>
                JSON.stringify({
                    Version: "2012-10-17",
                    Statement: [
                        {
                            Effect: "Allow",
                            Principal: {
                                AWS: oaiArn,
                            },
                            Action: "s3:GetObject",
                            Resource: `arn:aws:s3:::${bucketId}/*`,
                        },
                    ],
                })
            ),
        });

        // CloudFront Distribution
        this.distribution = new aws.cloudfront.Distribution(`${name}-cdn`, {
            enabled: true,
            defaultRootObject: "index.html",
            priceClass: "PriceClass_200", // 米国、欧州、アジア

            // Origin 1: S3 (Frontend)
            origins: [
                {
                    originId: "s3-origin",
                    domainName: args.s3BucketDomainName,
                    s3OriginConfig: {
                        originAccessIdentity: this.oai.cloudfrontAccessIdentityPath,
                    },
                },
                // Origin 2: EC2 (Backend API)
                {
                    originId: "ec2-origin",
                    domainName: args.ec2PublicDns,
                    customOriginConfig: {
                        httpPort: 3000,
                        httpsPort: 443,
                        originProtocolPolicy: "http-only", // EC2はHTTP
                        originSslProtocols: ["TLSv1.2"],
                    },
                },
            ],

            // Behavior 1: API requests → EC2
            orderedCacheBehaviors: [
                {
                    pathPattern: "/trpc/*",
                    targetOriginId: "ec2-origin",
                    viewerProtocolPolicy: "redirect-to-https",
                    allowedMethods: ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"],
                    cachedMethods: ["GET", "HEAD", "OPTIONS"],
                    compress: true,
                    forwardedValues: {
                        queryString: true,
                        headers: ["*"], // すべてのヘッダーを転送
                        cookies: {
                            forward: "all",
                        },
                    },
                    minTtl: 0,
                    defaultTtl: 0,
                    maxTtl: 0, // APIはキャッシュしない
                },
                {
                    pathPattern: "/health",
                    targetOriginId: "ec2-origin",
                    viewerProtocolPolicy: "redirect-to-https",
                    allowedMethods: ["GET", "HEAD"],
                    cachedMethods: ["GET", "HEAD"],
                    compress: true,
                    forwardedValues: {
                        queryString: false,
                        cookies: {
                            forward: "none",
                        },
                    },
                    minTtl: 0,
                    defaultTtl: 0,
                    maxTtl: 0,
                },
            ],

            // Default Behavior: Static files → S3
            defaultCacheBehavior: {
                targetOriginId: "s3-origin",
                viewerProtocolPolicy: "redirect-to-https",
                allowedMethods: ["GET", "HEAD", "OPTIONS"],
                cachedMethods: ["GET", "HEAD"],
                compress: true,
                forwardedValues: {
                    queryString: false,
                    cookies: {
                        forward: "none",
                    },
                },
                minTtl: 0,
                defaultTtl: 86400, // 1日
                maxTtl: 31536000, // 1年
            },

            // Custom Error Response (SPAのルーティング対応)
            customErrorResponses: [
                {
                    errorCode: 403,
                    responseCode: 200,
                    responsePagePath: "/index.html",
                },
                {
                    errorCode: 404,
                    responseCode: 200,
                    responsePagePath: "/index.html",
                },
            ],

            restrictions: {
                geoRestriction: {
                    restrictionType: "none",
                },
            },

            viewerCertificate: {
                cloudfrontDefaultCertificate: true,
                // カスタムドメインを使う場合は、ACM証明書を設定
                // acmCertificateArn: "arn:aws:acm:us-east-1:...",
                // sslSupportMethod: "sni-only",
            },

            tags: {
                Name: `${name}-cdn`,
                Environment: args.environment,
            },
        });

        this.domainName = this.distribution.domainName;
    }
}