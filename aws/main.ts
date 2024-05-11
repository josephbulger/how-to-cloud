import { App } from "cdktf";
import { HowToCloudStack } from "./stacks/howtocloud";
import { RootStack } from "./stacks/root";
import { AccountStack } from "./stacks/account";

const organization = "widget-factory";

const app = new App();

const rootStack = new RootStack(app, organization);
const accountStack = new AccountStack(
  app,
  `${organization}-account`,
  rootStack
);
accountStack.addDependency(rootStack);

new HowToCloudStack(app, "how-to-cloud");

app.synth();
