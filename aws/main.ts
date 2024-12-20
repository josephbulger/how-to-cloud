import { App, S3Backend } from "cdktf";
import { RootStack } from "./stacks/root";
import { AccountStack } from "./stacks/account";
import { DevOpsStack } from "./stacks/devops";
import { DeploymentStack } from "./stacks/deployment";

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
const deploymentStack = new DeploymentStack(app, `${organization}-deployment`, {
  ecrUri: devOpsStack.ecr.repositoryUrl,
});

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

new S3Backend(deploymentStack, {
  bucket: backend,
  key: "deployment",
});

app.synth();
