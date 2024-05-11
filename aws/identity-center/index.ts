import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { Construct } from "constructs";
import { IdentityCenterGroups } from "./groups";
import { IdentityCenterPermissions } from "./permissions";
import { DataAwsSsoadminInstances } from "@cdktf/provider-aws/lib/data-aws-ssoadmin-instances";

export class IdentityCenter extends Construct {
  groups: IdentityCenterGroups;
  permissions: IdentityCenterPermissions;
  stores: DataAwsSsoadminInstances;

  constructor(
    scope: Construct,
    name: string,
    config: {
      provider: AwsProvider;
      org: string;
    }
  ) {
    super(scope, name);

    this.stores = new DataAwsSsoadminInstances(scope, `${name}-stores`, config);

    this.groups = new IdentityCenterGroups(
      scope,
      `${name}-g`,
      Object.assign(config, { stores: this.stores })
    );

    this.permissions = new IdentityCenterPermissions(
      scope,
      `${name}-p`,
      Object.assign(config, { stores: this.stores })
    );
  }
}
