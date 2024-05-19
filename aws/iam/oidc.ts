import { DataAwsIamPolicy } from "@cdktf/provider-aws/lib/data-aws-iam-policy";
import { DataAwsIamPolicyDocument } from "@cdktf/provider-aws/lib/data-aws-iam-policy-document";
import { IamOpenidConnectProvider } from "@cdktf/provider-aws/lib/iam-openid-connect-provider";
import { IamRole } from "@cdktf/provider-aws/lib/iam-role";
import { IamRolePolicyAttachment } from "@cdktf/provider-aws/lib/iam-role-policy-attachment";
import { Construct } from "constructs";

export class OIDCProvider extends Construct {
  constructor(scope: Construct, name: string, config: { githubOrg: string }) {
    super(scope, name);

    const oidcProvider = new IamOpenidConnectProvider(
      scope,
      `${name}-provider`,
      {
        url: "https://token.actions.githubusercontent.com",
        clientIdList: ["sts.amazonaws.com"],
        thumbprintList: ["1b511abead59c6ce207077c0bf0e0043b1382612"],
      }
    );

    const assumePolicy = new DataAwsIamPolicyDocument(
      scope,
      `${name}-assume-policy`,
      {
        statement: [
          {
            actions: ["sts:AssumeRoleWithWebIdentity"],
            principals: [
              {
                type: "Federated",
                identifiers: [oidcProvider.arn],
              },
            ],
            condition: [
              {
                test: "StringEquals",
                variable: "token.actions.githubusercontent.com:aud",
                values: ["sts.amazonaws.com"],
              },
              {
                test: "StringLike",
                variable: "token.actions.githubusercontent.com:sub",
                values: [`${config.githubOrg}/*`],
              },
            ],
          },
        ],
      }
    );

    const role = new IamRole(scope, `${name}-trust-role`, {
      namePrefix: `${name}-trust-role`,
      assumeRolePolicy: assumePolicy.json,
    });

    const policy = new DataAwsIamPolicy(scope, `${name}-trust-policy`, {
      name: "PowerUserAccess",
    });

    new IamRolePolicyAttachment(scope, `${name}-rpa`, {
      role: role.name,
      policyArn: policy.arn,
    });
  }
}
