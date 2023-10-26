import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { EcrRepository } from "@cdktf/provider-aws/lib/ecr-repository";
import { EcrRepositoryPolicy } from "@cdktf/provider-aws/lib/ecr-repository-policy";
import { S3Bucket } from "@cdktf/provider-aws/lib/s3-bucket";
import { S3BucketPolicy } from "@cdktf/provider-aws/lib/s3-bucket-policy";
import { S3BucketIntelligentTieringConfiguration } from "@cdktf/provider-aws/lib/s3-bucket-intelligent-tiering-configuration";
import { DataAwsCallerIdentity } from "@cdktf/provider-aws/lib/data-aws-caller-identity";
import { DataAwsIamPolicyDocument } from "@cdktf/provider-aws/lib/data-aws-iam-policy-document";
import { DataAwsIamRole } from "@cdktf/provider-aws/lib/data-aws-iam-role";

import { Vpc } from "./.gen/modules/terraform-aws-modules/aws/vpc";

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    const roleId = "devOps";

    new AwsProvider(this, "AWS", {
      region: "us-east-1",
    });

    new Vpc(this, "htc-vpc", {
      name: "htc-vpc",
      cidr: "10.0.0.0/16",
      azs: ["us-east-1a", "us-east-1b", "us-east-1c"],
      privateSubnets: ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"],
      publicSubnets: ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"],
      enableNatGateway: true,
    });

    const ecr = new EcrRepository(this, "htc-ecr", {
      name: "htc-ecr",
      imageTagMutability: "MUTABLE",
    });

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

    const s3role = new DataAwsIamRole(this, "htc-devops-role", {
      name: roleId,
    });

    new S3BucketPolicy(this, "htc-state-s3-policy", {
      bucket: stateBucket.id,
      policy: `{
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Principal":{
              "AWS": "${s3role.arn}"
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

    const identity = new DataAwsCallerIdentity(this, "htc-identity", {});

    const policy = new DataAwsIamPolicyDocument(this, "htc-state-policy", {
      statement: [
        {
          actions: [
            "ecr:GetDownloadUrlForLayer",
            "ecr:BatchGetImage",
            "ecr:BatchCheckLayerAvailability",
            "ecr:PutImage",
            "ecr:InitiateLayerUpload",
            "ecr:UploadLayerPart",
            "ecr:CompleteLayerUpload",
            "ecr:DescribeRepositories",
            "ecr:GetRepositoryPolicy",
            "ecr:ListImages",
            "ecr:DescribeImages",
            "ecr:DeleteRepository",
            "ecr:BatchDeleteImage",
            "ecr:SetRepositoryPolicy",
            "ecr:DeleteRepositoryPolicy",
            "ecr:GetLifecyclePolicy",
            "ecr:PutLifecyclePolicy",
            "ecr:DeleteLifecyclePolicy",
            "ecr:GetLifecyclePolicyPreview",
            "ecr:StartLifecyclePolicyPreview",
          ],

          principals: [
            {
              type: "AWS",

              identifiers: [
                `arn:aws:iam::${identity.accountId}:role/${roleId}`,
              ],
            },
          ],
        },
      ],
    });

    new EcrRepositoryPolicy(this, "htc-ecr-policy", {
      repository: ecr.name,
      policy: policy.json,
    });
  }
}

const app = new App();
new MyStack(app, "how-to-cloud");
app.synth();
