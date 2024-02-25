import { Fn } from "cdktf";
import { EcsTaskDefinition } from "@cdktf/provider-aws/lib/ecs-task-definition";
import { Construct } from "constructs";
import { Tfvars } from "../../variables";
import { Ecr } from "../../account/ecr";

export class HowToCloudEcsTaskDefinition extends Construct {
  public definition: EcsTaskDefinition;

  constructor(
    scope: Construct,
    name: string,
    vars: Tfvars,
    executionRoleArn: string,
    ecr: Ecr,
    cpu?: number,
    memory?: number
  ) {
    super(scope, name);

    this.definition = new EcsTaskDefinition(this, "task_definition", {
      family: `${name}-task-definition`,
      memory: memory?.toString() ?? vars.memory.toString(),
      cpu: cpu?.toString() ?? vars.cpu.toString(),
      networkMode: "awsvpc",
      executionRoleArn,

      containerDefinitions: Fn.jsonencode([
        {
          name: "container-name",
          image: `${ecr.url}:latest`,
          cpu: 0,
          essential: true,

          portMappings: [
            {
              containerPort: vars.containerPort,
              hostPort: vars.containerPort,
              protocol: "tcp",
            },
          ],

          environment: [
            {
              name: "example",
              value: "this is where env vars get injected",
            }
          ],
        },
      ]),
    });
  }
}
