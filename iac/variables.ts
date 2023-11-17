import * as cdktf from "cdktf"
import { Construct } from "constructs"

export class Tfvars extends Construct {
  public tags?: { [key: string]: string }
  public cidr: string
  public region: string
  public role: string

  constructor(
    scope: Construct,
    name: string
  ) {
    super(scope, name)

    this.region = "us-east-1"

    this.role = "devops"

    this.tags = new cdktf.TerraformVariable(this, "tags", {
      default: {
        project: "how-to-cloud",
        "cost-center": "00001234",
        contact: "poc@business.com"
      },
      description: "default tags",
    }).value

    this.cidr = new cdktf.TerraformVariable(this, "cidr", {
      default: "10.0.0.0/16",
      description: "vpc cidr block",
    }).value
  }
}