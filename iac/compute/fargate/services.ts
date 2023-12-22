import { EcsService } from "@cdktf/provider-aws/lib/ecs-service";
import { Subnet } from "@cdktf/provider-aws/lib/subnet";
import { Construct } from "constructs";
import { Tfvars } from "../../variables";

export class HowToCloudEcsService extends Construct {
  public service: EcsService;

  constructor(
    scope: Construct,
    name: string,
    vars: Tfvars,
    clusterArn: string,
    taskDefinitionArn: string,
    targetGroupArn: string,
    subnets: Subnet[],
    securityGroupId: string,
    desired: number = 1
  ) {
    super(scope, name);

    this.service = new EcsService(this, name, {
      name: `${name}-service`,
      cluster: clusterArn,
      taskDefinition: taskDefinitionArn,
      desiredCount: desired,
      launchType: "FARGATE",

      loadBalancer: [
        {
          targetGroupArn,
          containerName: `${name}-container`,
          containerPort: vars.containerPort,
        },
      ],

      networkConfiguration: {
        subnets: subnets.map((subnet) => subnet.id),
        assignPublicIp: false,
        securityGroups: [securityGroupId],
      },
    });
  }
}
