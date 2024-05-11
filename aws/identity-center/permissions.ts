import { DataAwsSsoadminInstances } from "@cdktf/provider-aws/lib/data-aws-ssoadmin-instances";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { SsoadminManagedPolicyAttachment } from "@cdktf/provider-aws/lib/ssoadmin-managed-policy-attachment";
import { SsoadminPermissionSet } from "@cdktf/provider-aws/lib/ssoadmin-permission-set";
import { Fn } from "cdktf";
import { Construct } from "constructs";

export class IdentityCenterPermissions extends Construct {
  admin: SsoadminPermissionSet;
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

    const arnId = Fn.element(config.stores.arns, 0);

    this.admin = new SsoadminPermissionSet(scope, `${name}-admin`, {
      name: `${name}-admin`,
      instanceArn: arnId,
    });

    new SsoadminManagedPolicyAttachment(scope, `${name}-admin-policy`, {
      instanceArn: arnId,
      managedPolicyArn: "arn:aws:iam::aws:policy/AdministratorAccess",
      permissionSetArn: this.admin.arn,
    });
  }
}
