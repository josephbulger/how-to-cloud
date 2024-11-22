import { DataAwsIamPolicy } from "@cdktf/provider-aws/lib/data-aws-iam-policy";
import { DataAwsIamPolicyDocument } from "@cdktf/provider-aws/lib/data-aws-iam-policy-document";
import { IamOpenidConnectProvider } from "@cdktf/provider-aws/lib/iam-openid-connect-provider";
import { IamPolicy } from "@cdktf/provider-aws/lib/iam-policy";
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

    const denyItselfPolicyDocument = new DataAwsIamPolicyDocument(
      scope,
      `${name}-di-policy-doc`,
      {
        statement: [
          {
            effect: "Deny",
            actions: ["iam:*"],
            resources: [role.arn, oidcProvider.arn],
          },
        ],
      }
    );

    const denyItselfPolicy = new IamPolicy(scope, `${name}-di-policy`, {
      policy: denyItselfPolicyDocument.json,
    });

    const moreIamPolicyDocument = new DataAwsIamPolicyDocument(
      scope,
      `${name}-more-iam-policy-doc`,
      {
        statement: [
          {
            effect: "Allow",
            actions: [
              "iam:CreatePolicy",
              "iam:CreatePolicyVersion",
              "iam:DeletePolicy",
              "iam:DeletePolicyVersion",
              "iam:UpdatePolicy",
              "iam:UpdatePolicyVersion",
              "iam:CreateRole",
              "iam:DeleteRole",
              "iam:UpdateRole",
              "iam:AttachRolePolicy",
              "iam:DetachRolePolicy",
              "iam:List*",
              "iam:Get*",
            ],
            resources: ["*"],
          },
        ],
      }
    );

    const moreIamPolicy = new IamPolicy(scope, `${name}-more-iam-policy`, {
      policy: moreIamPolicyDocument.json,
    });

    const policy = new DataAwsIamPolicy(scope, `${name}-trust-policy`, {
      name: "PowerUserAccess",
    });

    new IamRolePolicyAttachment(scope, `${name}-rpa`, {
      role: role.name,
      policyArn: policy.arn,
    });

    new IamRolePolicyAttachment(scope, `${name}-dipa`, {
      role: role.name,
      policyArn: denyItselfPolicy.arn,
    });

    new IamRolePolicyAttachment(scope, `${name}-miam`, {
      role: role.name,
      policyArn: moreIamPolicy.arn,
    });
  }
}
