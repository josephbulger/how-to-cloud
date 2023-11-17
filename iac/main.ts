import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { DataAwsIamRole } from "@cdktf/provider-aws/lib/data-aws-iam-role";

import { State } from "./state";

import { Tfvars } from "./variables";

import { Account } from "./account";
import { WebFrontEnd } from "./web";

class MyStack extends TerraformStack {

  constructor(scope: Construct, name: string) {
    super(scope, name);

    const vars = new Tfvars(this, "vars");

    new AwsProvider(this, "AWS", {
      region: vars.region
    });
    
    const account = new Account(this, "account");

    new WebFrontEnd(this, "web", vars, account);

    const role = new DataAwsIamRole(this, "devops-role", {
      name: vars.role,
    });

    new State(this, "state", {
      role: role
    });
  }
}

const app = new App();
new MyStack(app, "how-to-cloud");
app.synth();
