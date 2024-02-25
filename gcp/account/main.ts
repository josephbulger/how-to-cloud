import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { GoogleProvider } from "@cdktf/provider-google/lib/provider";
import { Zones } from "./dns-zones/zones";

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const provider = new GoogleProvider(this, "google", {
      region: "us-east1",
      zone: "us-east1-a",
      project: `${id}`,
    });

    new Zones(this, `${id}-zones`, { provider: provider });
  }
}

const app = new App();
new MyStack(app, "how-to-cloud-account");
app.synth();
