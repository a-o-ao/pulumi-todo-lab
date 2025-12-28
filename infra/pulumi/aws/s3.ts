import * as aws from "@pulumi/aws";

const bucket = new aws.s3.Bucket("todo-app-bucket", {
    acl: "private",
    versioning: {
        enabled: true,
    },
    website: {
        indexDocument: "index.html",
        errorDocument: "error.html",
    },
});

export const bucketName = bucket.id;
export const bucketEndpoint = bucket.websiteEndpoint;