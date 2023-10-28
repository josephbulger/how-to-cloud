import { Construct } from "constructs";
import { S3Bucket } from "@cdktf/provider-aws/lib/s3-bucket";
import { S3BucketPolicy } from "@cdktf/provider-aws/lib/s3-bucket-policy";
import { S3BucketIntelligentTieringConfiguration } from "@cdktf/provider-aws/lib/s3-bucket-intelligent-tiering-configuration";
import { DataAwsIamRole } from "@cdktf/provider-aws/lib/data-aws-iam-role";

export class State extends Construct {
  constructor(scope: Construct, name: string, config: { role: DataAwsIamRole }) {
    super(scope, name);

    const stateBucket = new S3Bucket(this, "htc-s3-state", {
      bucket: "htc-state",
      versioning: {
        enabled: true,
      },
      serverSideEncryptionConfiguration: {
        rule: {
          applyServerSideEncryptionByDefault: {
            sseAlgorithm: "AES256",
          },
        },
      },
      lifecycleRule: [
        {
          id: "clean-partials-after-a-while",
          prefix: "",
          enabled: true,
          abortIncompleteMultipartUploadDays: 3,
        },
      ],
    });

    new S3BucketIntelligentTieringConfiguration(this, "htc-s3-state-tiering", {
      bucket: stateBucket.id,
      name: "htc-s3-state-tiering",
      tiering: [

      ]
    })

    new S3BucketPolicy(this, "htc-state-s3-policy", {
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
