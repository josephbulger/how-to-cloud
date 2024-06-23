import { App, S3Backend } from "cdktf";
import { HowToCloudStack } from "./stacks/howtocloud";
import { RootStack } from "./stacks/root";
import { AccountStack } from "./stacks/account";
import { DevOpsStack } from "./stacks/devops";

const organization = "widget-factory";
const githubOrg = "repo:widget-factory";
const backend = "devops-backend-bucket-[junk-prefix-nums-autogenned-by-AWS]";

const app = new App();

const rootStack = new RootStack(app, organization);
const accountStack = new AccountStack(app, `${organization}-account`, {
  identityCenter: rootStack.identityCenter,
  githubOrg: githubOrg,
});
const devOpsStack = new DevOpsStack(app, `${organization}-devops`);

new HowToCloudStack(app, "how-to-cloud");

new S3Backend(accountStack, {
  bucket: backend,
  key: "account",
});

new S3Backend(rootStack, {
  bucket: backend,
  key: "root",
});

new S3Backend(devOpsStack, {
  bucket: backend,
  key: "devops",
  workspaceKeyPrefix: "devops",
});

app.synth();
