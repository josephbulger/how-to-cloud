import { Construct } from "constructs";
import { DataAwsIamRole } from "@cdktf/provider-aws/lib/data-aws-iam-role";

import { Ecr } from "./ecr";

import { Tfvars } from "../variables";

export class Account extends Construct {
  public ecr: Ecr

  constructor(scope: Construct, name: string, vars: Tfvars) {
    super(scope, name);

    const role = new DataAwsIamRole(this, "devops-role", {
      name: vars.role,
      tags: vars.tags
    });

    this.ecr = new Ecr(this, "ecr", {
      role: role
    });
  }
}