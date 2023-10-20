import { Construct } from "constructs";
import { App, TerraformStack, TerraformOutput } from "cdktf";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { EcrRepository } from "@cdktf/provider-aws/lib/ecr-repository";

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new AwsProvider(this, "AWS", {
      region: "us-east-1",
    });

    new EcrRepository(this, "how-to-cloud", {
      name: "how-to-cloud-ecr"
    });

    new TerraformOutput(this, "testing", {
      value: "hello world",
    });
  }
}

const app = new App();
new MyStack(app, "how-to-cloud");
app.synth();
