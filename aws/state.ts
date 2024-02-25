import { Construct } from "constructs";
import { S3Bucket } from "@cdktf/provider-aws/lib/s3-bucket";
import { S3BucketPolicy } from "@cdktf/provider-aws/lib/s3-bucket-policy";
import { DataAwsIamRole } from "@cdktf/provider-aws/lib/data-aws-iam-role";

export class State extends Construct {
  constructor(scope: Construct, name: string, config: { role: DataAwsIamRole }) {
    super(scope, name);

    const stateBucket = new S3Bucket(this, "state", {
      bucket: "state",
      versioning: {
        enabled: true,
      },
      serverSideEncryptionConfiguration: {
        rule: {
          applyServerSideEncryptionByDefault: {
            sseAlgorithm: "AES256",
          },
        },
      }
    });

    new S3BucketPolicy(this, "state-policy", {
      bucket: stateBucket.id,
      policy: `{
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Principal":{
              "AWS": "${config.role.arn}"
            },
            "Action": [ "s3:*" ],
            "Resource": [
              "${stateBucket.arn}",
              "${stateBucket.arn}/*"
            ]
          }
        ]
      }`,
    });
  }
}
