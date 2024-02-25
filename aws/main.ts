import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { DataAwsIamRole } from "@cdktf/provider-aws/lib/data-aws-iam-role";
import { State } from "./state";
import { Tfvars } from "./variables";
import { Account } from "./account";
import { HowToCloudFargateExample } from "./compute/fargate";

class HowToCloudStack extends TerraformStack {

  constructor(scope: Construct, name: string) {
    super(scope, name);

    const vars = new Tfvars(this, `${name}-vars`);

    new AwsProvider(this, "AWS", {
      region: vars.region
    });
    
    const account = new Account(this, `${name}-account`, vars);

    new HowToCloudFargateExample(this, `${name}-fargate`, account.ecr);

    const role = new DataAwsIamRole(this, `devops-role`, {
      name: vars.role,
    });

    new State(this, `${name}-state`, {
      role: role
    });
  }
}

const app = new App();
new HowToCloudStack(app, "how-to-cloud");
app.synth();
