import { App } from "cdktf";
import { HowToCloudStack } from "./stacks/account";
import { RootStack } from "./stacks/root";

const organization = "widget-factory";

const app = new App();

new RootStack(app, organization);
new HowToCloudStack(app, "how-to-cloud");

app.synth();
