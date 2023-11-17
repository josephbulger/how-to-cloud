import { Construct } from "constructs";
import { DataAwsIamRole } from "@cdktf/provider-aws/lib/data-aws-iam-role";

import { Vpc } from "../.gen/modules/vpc";

import { Ecr } from "./ecr";

import { Tfvars } from "../variables";
import { Fn } from "cdktf"

export class Account extends Construct {
  public ecr: Ecr
  public vpc: Vpc

  constructor(scope: Construct, name: string) {
    super(scope, name);

    const vars = new Tfvars(this, "vars");

    const azs = ["a", "b", "c"].map((zone) => `${vars.region}${zone}`)

    const publicSubnets = azs.map((_az, i) => Fn.cidrsubnet(vars.cidr, 8, i + 1));

    const privateSubnets = azs.map((_az, i) => Fn.cidrsubnet(vars.cidr, 8, i + publicSubnets.length + 1));

    this.vpc = new Vpc(this, "account-vpc", {
      name: "account-vpc",
      cidr: vars.cidr,
      azs: azs,
      privateSubnets: publicSubnets,
      publicSubnets: privateSubnets,
      enableNatGateway: true,
      tags: vars.tags
    });

    const role = new DataAwsIamRole(this, "devops-role", {
      name: vars.role,
      tags: vars.tags
    });

    this.ecr = new Ecr(this, "ecr", {
      role: role
    });
  }
}