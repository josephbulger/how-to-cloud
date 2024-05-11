import { DataAwsCallerIdentity } from "@cdktf/provider-aws/lib/data-aws-caller-identity";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { SsoadminAccountAssignment } from "@cdktf/provider-aws/lib/ssoadmin-account-assignment";
import { Construct } from "constructs";
import { IdentityCenter } from ".";
import { IdentitystoreGroupMembership } from "@cdktf/provider-aws/lib/identitystore-group-membership";
import { DataAwsIdentitystoreUser } from "@cdktf/provider-aws/lib/data-aws-identitystore-user";

export class IdentityCenterAssignments extends Construct {
  constructor(
    scope: Construct,
    name: string,
    config: {
      provider: AwsProvider;
      storeId: string;
      storeArn: string;
      caller: DataAwsCallerIdentity;
      identityCenter: IdentityCenter;
    }
  ) {
    super(scope, name);

    new SsoadminAccountAssignment(scope, `${name}-ga-admin`, {
      provider: config.provider,
      principalType: "GROUP",
      targetType: "AWS_ACCOUNT",
      targetId: config.caller.accountId,
      permissionSetArn: config.identityCenter.permissions.admin.arn,
      instanceArn: config.storeArn,
      principalId: config.identityCenter.groups.admin.groupId,
    });

    const juser = new DataAwsIdentitystoreUser(scope, `${name}-iu-joseph`, {
      identityStoreId: config.storeId,
      alternateIdentifier: {
        uniqueAttribute: {
          attributePath: "UserName",
          attributeValue: "joseph@awsdemo.com",
        },
      },
    });

    new IdentitystoreGroupMembership(scope, `${name}-gm-joseph`, {
      identityStoreId: config.storeId,
      groupId: config.identityCenter.groups.admin.groupId,
      memberId: juser.userId,
    });
  }
}
