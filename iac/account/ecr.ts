import { Construct } from "constructs";
import { EcrRepository } from "@cdktf/provider-aws/lib/ecr-repository";
import { EcrRepositoryPolicy } from "@cdktf/provider-aws/lib/ecr-repository-policy";
import { DataAwsCallerIdentity } from "@cdktf/provider-aws/lib/data-aws-caller-identity";
import { DataAwsIamPolicyDocument } from "@cdktf/provider-aws/lib/data-aws-iam-policy-document";
import { DataAwsIamRole } from "@cdktf/provider-aws/lib/data-aws-iam-role";

export class Ecr extends Construct {
  public url: string;
  public arn: string;

  constructor(scope: Construct, name: string, config: { role: DataAwsIamRole }) {
    super(scope, name);

    const ecr = new EcrRepository(this, `${name}-ecr`, {
      name: `${name}-ecr`,
      imageTagMutability: "MUTABLE"
    });

    this.url = ecr.repositoryUrl;
    this.arn = ecr.arn;

    const identity = new DataAwsCallerIdentity(this, "identity", {});

    const policy = new DataAwsIamPolicyDocument(this, `${name}-state-policy`, {
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
                `arn:aws:iam::${identity.accountId}:role/${config.role.name}`,
              ],
            },
          ],
        },
      ],
    });

    new EcrRepositoryPolicy(this, `${name}-ecr-policy`, {
      repository: ecr.name,
      policy: policy.json,
    });
  }
}
