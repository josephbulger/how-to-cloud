import { S3Bucket } from "@cdktf/provider-aws/lib/s3-bucket";
import { S3BucketVersioningA } from "@cdktf/provider-aws/lib/s3-bucket-versioning";
import { Construct } from "constructs";

export class Backend extends Construct {
  arn: string;
  name: string;
  constructor(scope: Construct, name: string) {
    super(scope, name);

    const bucket = new S3Bucket(scope, `${name}-dbb`, {
      bucketPrefix: "devops-backend-bucket",
      lifecycle: {
        preventDestroy: true,
      },
    });

    new S3BucketVersioningA(scope, `${name}-dbb-v`, {
      bucket: bucket.id,
      versioningConfiguration: {
        status: "Enabled",
      },
    });

    this.arn = bucket.arn;
    this.name = bucket.bucket;
  }
}
