import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// CloudFront distribution configuration
const cloudfrontDistribution = new aws.cloudfront.Distribution("todoAppDistribution", {
    origins: [{
        originId: "s3Origin",
        domainName: "your-s3-bucket-name.s3.amazonaws.com", // Replace with your S3 bucket name
        s3OriginConfig: {
            originAccessIdentity: new aws.cloudfront.OriginAccessIdentity("s3OriginAccessIdentity").id,
        },
    }],
    enabled: true,
    defaultRootObject: "index.html",
    defaultCacheBehavior: {
        targetOriginId: "s3Origin",
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
    restrictions: {
        geoRestriction: {
            restrictionType: "none",
        },
    },
    viewerCertificate: {
        cloudfrontDefaultCertificate: true,
    },
});

// Export the CloudFront distribution domain name
export const cloudfrontDomainName = cloudfrontDistribution.domainName;