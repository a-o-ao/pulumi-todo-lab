import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

export interface S3Args {
    projectName: string;
    environment: string;
}

export class S3Stack {
    public readonly bucket: aws.s3.Bucket;
    public readonly bucketName: pulumi.Output<string>;
    public readonly bucketDomainName: pulumi.Output<string>;

    constructor(args: S3Args) {
        const name = `${args.projectName}-${args.environment}`;

        // S3 Bucket for Frontend
        this.bucket = new aws.s3.Bucket(`${name}-frontend`, {
            bucket: `${name}-frontend`,
            acl: "private", // CloudFrontからのアクセスのみ許可
            website: {
                indexDocument: "index.html",
                errorDocument: "index.html", // SPAのルーティング対応
            },
            tags: {
                Name: `${name}-frontend`,
                Environment: args.environment,
            },
        });

        // Block Public Access (CloudFront経由のみアクセス可能にする)
        new aws.s3.BucketPublicAccessBlock(`${name}-frontend-public-access-block`, {
            bucket: this.bucket.id,
            blockPublicAcls: true,
            blockPublicPolicy: true,
            ignorePublicAcls: true,
            restrictPublicBuckets: true,
        });

        this.bucketName = this.bucket.id;
        this.bucketDomainName = this.bucket.bucketRegionalDomainName;
    }
}