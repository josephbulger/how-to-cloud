import { ecsCluster } from "@cdktf/provider-aws"
import { Fn } from "cdktf"
import { Construct } from "constructs"
import { Tfvars } from "../variables"

export class Cluster extends Construct {
  public cluster: ecsCluster.EcsCluster

  constructor(
    scope: Construct,
    name: string,
    vars: Tfvars
  ) {
    super(scope, name)

    const project = `${Fn.lookup(vars.tags, "project", "")}`

    this.cluster = new ecsCluster.EcsCluster(this, name, {
      name: `${project}-cluster`,
    })
  }
}