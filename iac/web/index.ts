
import { Construct } from "constructs"
import { Tfvars } from "../variables"
import { Cluster } from "./cluster"
import { Account } from "../account"
import { SecurityGroups } from "./sg"

export class WebFrontEnd extends Construct {
  constructor(
    scope: Construct,
    name: string,
    vars: Tfvars,
    account: Account
  ) {
    super(scope, name)

    new Cluster(this, `${name}-cluster`, vars)

    new SecurityGroups(this, `${name}-sg`, vars, account)
  }
}