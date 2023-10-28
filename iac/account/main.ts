import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { DataAwsIamRole } from "@cdktf/provider-aws/lib/data-aws-iam-role";

import { Vpc } from "./.gen/modules/vpc";

import { State } from "./state";
import { Ecr } from "./ecr";

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    const roleId = "devOps";

    new AwsProvider(this, "AWS", {
      region: "us-east-1",
    });

    new Vpc(this, "htc-vpc", {
      name: "htc-vpc",
      cidr: "10.0.0.0/16",
      azs: ["us-east-1a", "us-east-1b", "us-east-1c"],
      privateSubnets: ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"],
      publicSubnets: ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"],
      enableNatGateway: true,
    });

    const role = new DataAwsIamRole(this, "htc-devops-role", {
      name: roleId,
    });

    new State(this, "htc-state", {
      role: role
    });

    new Ecr(this, "htc-ecr", {
      role: role
    });
  }
}

const app = new App();
new MyStack(app, "how-to-cloud");
app.synth();
