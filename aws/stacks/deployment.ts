import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { TerraformStack, TerraformVariable } from "cdktf";
import { Construct } from "constructs";
import { API } from "../serverless/api";
import { Route53Zone } from "@cdktf/provider-aws/lib/route53-zone";

export class DeploymentStack extends TerraformStack {
  constructor(scope: Construct, id: string, config: { ecrUri: string }) {
    super(scope, id);

    const tag = new TerraformVariable(this, "tag", {
      type: "string",
      default: "nothing",
      description: "What image tag should be used for the deployment",
    });

    new AwsProvider(this, `${id}-provider`);

    let zone = new Route53Zone(this, `${id}-zone-jb-aws`, {
      name: "aws.josephbulger.com",
    });

    new API(this, `${id}-api`, {
      ecrUri: config.ecrUri,
      tag: tag.value,
      hostedZone: zone.name,
      domain: `apigw.examples.how2cloud.${zone.name}`,
    });
  }
}
