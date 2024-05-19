import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { Fn, TerraformStack } from "cdktf";
import { Construct } from "constructs";
import { DataAwsCallerIdentity } from "@cdktf/provider-aws/lib/data-aws-caller-identity";
import { DataAwsSsoadminInstances } from "@cdktf/provider-aws/lib/data-aws-ssoadmin-instances";
import { IdentityCenterAssignments } from "../identity-center/assignments";
import { IdentityCenter } from "../identity-center";
import { OIDCProvider } from "../iam/oidc";

export class AccountStack extends TerraformStack {
  constructor(
    scope: Construct,
    id: string,
    config: { identityCenter: IdentityCenter; githubOrg: string }
  ) {
    super(scope, id);

    const provider = new AwsProvider(this, `${id}-provider`);

    const caller = new DataAwsCallerIdentity(this, `${id}-caller`);

    const stores = new DataAwsSsoadminInstances(this, `${id}-stores`);

    const storeArn = Fn.element(stores.arns, 0);
    const storeId = Fn.element(stores.identityStoreIds, 0);

    new IdentityCenterAssignments(this, `${id}-ica`, {
      provider: provider,
      storeArn: storeArn,
      storeId: storeId,
      caller: caller,
      identityCenter: config.identityCenter,
    });

    new OIDCProvider(this, `${id}-oidc`, config);
  }
}
