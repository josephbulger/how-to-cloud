import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { TerraformStack } from "cdktf";
import { Construct } from "constructs";
import { IdentityCenter } from "../identity-center";

export class RootStack extends TerraformStack {
  identityCenter: IdentityCenter;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const providerAsRoot = new AwsProvider(this, `${id}-provider`);

    this.identityCenter = new IdentityCenter(this, `${id}-ic`, {
      provider: providerAsRoot,
      org: id,
    });
  }
}
