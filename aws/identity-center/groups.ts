import { DataAwsSsoadminInstances } from "@cdktf/provider-aws/lib/data-aws-ssoadmin-instances";
import { IdentitystoreGroup } from "@cdktf/provider-aws/lib/identitystore-group";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { Fn } from "cdktf";
import { Construct } from "constructs";

export class IdentityCenterGroups extends Construct {
  admin: IdentitystoreGroup;
  constructor(
    scope: Construct,
    name: string,
    config: {
      provider: AwsProvider;
      org: string;
      stores: DataAwsSsoadminInstances;
    }
  ) {
    super(scope, name);

    const storeId = Fn.element(config.stores.identityStoreIds, 0);

    this.admin = new IdentitystoreGroup(scope, `${name}-admins`, {
      identityStoreId: storeId,
      displayName: `${config.org}-admins`,
      provider: config.provider,
    });
  }
}
