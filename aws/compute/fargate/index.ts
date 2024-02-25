import { Construct } from "constructs";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { Tfvars } from "../../variables";
import { Network } from "../../common/vpc";
import { SecurityGroups } from "./security-groups";
import { EcsCluster } from "./cluster";
import { HowToCloudEcsTaskDefinition } from "./task-definitions";
import { HowToCloudEcsService } from "./services";
import { EcsMonitoringIamTaskExecRole } from "./iam";
import { HowToCloudAlb } from "../../common/lbs";
import { Ecr } from "../../account/ecr";

export class HowToCloudFargateExample extends Construct {
  constructor(scope: Construct, name: string, ecr: Ecr) {
    super(scope, name);

    const vars = new Tfvars(this, "main");

    new AwsProvider(this, "AWS", {
      region: vars.region,
    });

    const vpc = new Network(this, "network", vars);

    const securityGroups = new SecurityGroups(
      this,
      "security",
      vars,
      vpc.vpc.id
    );

    const monitoringIamRole = new EcsMonitoringIamTaskExecRole(
      this,
      "task-monitoring-role"
    );

    const { cluster } = new EcsCluster(this, "cluster");

    const webAlb = new HowToCloudAlb(
      this,
      "web-alb",
      vars,
      false,
      vpc,
      securityGroups.webAlb.id
    );

    const backendAlb = new HowToCloudAlb(
      this,
      "backend-alb",
      vars,
      true,
      vpc,
      securityGroups.webAlb.id
    );

    const taskDefinition = new HowToCloudEcsTaskDefinition(
      this,
      "task-definition",
      vars,
      monitoringIamRole.role.arn,
      ecr
    );

    new HowToCloudEcsService(
      this,
      "web-service",
      vars,
      cluster.arn,
      taskDefinition.definition.arn,
      webAlb.targetGroup.arn,
      vpc.privateSubnets,
      securityGroups.webService.id
    );

    new HowToCloudEcsService(
      this,
      "backend-service",
      vars,
      cluster.arn,
      taskDefinition.definition.arn,
      backendAlb.targetGroup.arn,
      vpc.privateSubnets,
      securityGroups.webService.id
    );
  }
}
