import { Construct } from "constructs";
import { TerraformStack } from "cdktf";
import { IdentityCenterGroups } from "../identity-center/groups";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";

export class RootStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const providerAsRoot = new AwsProvider(this, `${id}-provider`, {
      profile: "root",
    });

    new IdentityCenterGroups(this, `${id}-identity-center`, {
      provider: providerAsRoot,
      org: id,
    });
  }
}
