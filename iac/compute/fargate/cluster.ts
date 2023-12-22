import * as ecs from '@cdktf/provider-aws/lib/ecs-cluster';
import { Construct } from "constructs"

export class EcsCluster extends Construct {
  public cluster: ecs.EcsCluster

  constructor(
    scope: Construct,
    name: string
  ) {
    super(scope, name)

    this.cluster = new ecs.EcsCluster(this, name, {
      name: `${name}-cluster`,
    })
  }
}