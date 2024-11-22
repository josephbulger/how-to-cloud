import { DataAwsEcrLifecyclePolicyDocument } from "@cdktf/provider-aws/lib/data-aws-ecr-lifecycle-policy-document";
import { EcrLifecyclePolicy } from "@cdktf/provider-aws/lib/ecr-lifecycle-policy";
import { EcrRepository } from "@cdktf/provider-aws/lib/ecr-repository";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { TerraformStack, TerraformVariable } from "cdktf";
import { Construct } from "constructs";

export class DevOpsStack extends TerraformStack {
  ecr: EcrRepository;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new TerraformVariable(this, "tag", {
      type: "string",
      default: "nothing",
      description: "What image tag should be used for the deployment",
    });

    new AwsProvider(this, `${id}-provider`);

    let ecr = new EcrRepository(this, `${id}-api-ecr`, {
      name: "api",
      imageTagMutability: "IMMUTABLE",
    });

    let doc = new DataAwsEcrLifecyclePolicyDocument(
      this,
      `${id}-api-ecr-lifecycle-doc`,
      {
        rule: [
          {
            priority: 1,
            description: "hold only last 3",
            selection: [
              {
                countNumber: 3,
                countType: "imageCountMoreThan",
                tagStatus: "any",
              },
            ],
          },
        ],
      }
    );

    new EcrLifecyclePolicy(this, `${id}-api-ecr-lifecycle`, {
      repository: ecr.name,
      policy: doc.json,
    });

    this.ecr = ecr;
  }
}
