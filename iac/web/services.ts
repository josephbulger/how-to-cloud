import { ecsService } from "@cdktf/provider-aws"
import { Fn } from "cdktf"
import { Construct } from "constructs"
import { Tfvars } from "../variables"

export class Service extends Construct {
  public service: ecsService.EcsService

  constructor(
    scope: Construct,
    name: string,
    vars: Tfvars,
    clusterArn: string,
    taskDefinitionArn: string,
    targetGroupArn: string,
    subnets: string[],
    securityGroupId: string
  ) {
    super(scope, name)

    const project = `${Fn.lookup(vars.tags, "project", "")}`

    this.service = new ecsService.EcsService(this, name, {
      name: `${project}-service`,
      cluster: clusterArn,
      taskDefinition: taskDefinitionArn,
      desiredCount: 1,
      launchType: "FARGATE",

      loadBalancer: [
        {
          targetGroupArn,
          containerName: "service",
          containerPort: 8080,
        },
      ],

      networkConfiguration: {
        subnets: subnets,
        assignPublicIp: false,
        securityGroups: [securityGroupId],
      },
    })
  }
}