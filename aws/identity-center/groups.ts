import { DataAwsSsoadminInstances } from "@cdktf/provider-aws/lib/data-aws-ssoadmin-instances";
import { IdentitystoreGroup } from "@cdktf/provider-aws/lib/identitystore-group";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { Fn } from "cdktf";
import { Construct } from "constructs";

export class IdentityCenterGroups extends Construct {
  constructor(
    scope: Construct,
    name: string,
    config: {
      provider: AwsProvider;
      org: string;
    }
  ) {
    super(scope, name);

    const stores = new DataAwsSsoadminInstances(
      scope,
      `${name}-stores`,
      config
    );
    const storeId = Fn.element(stores.identityStoreIds, 0);

    new IdentitystoreGroup(scope, `${name}-admins`, {
      identityStoreId: storeId,
      displayName: `${config.org}-admins`,
      provider: config.provider,
    });
  }
}
