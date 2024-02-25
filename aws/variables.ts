import * as cdktf from "cdktf"
import { Construct } from "constructs"

export class Tfvars extends Construct {
  public tags?: { [key: string]: string }
  public cidr: string
  public region: string
  public role: string
  public containerPort: number
  public lbPort: number
  public certificateArn: string
  public lbProtocol: string
  public cpu: number
  public memory: number

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

    this.containerPort = new cdktf.TerraformVariable(this, "containerPort", {
      default: 8080,
      description: "The port the container will listen on, used for load balancer health check"
    }).value;

    this.lbPort = new cdktf.TerraformVariable(this, "lbPort", {
      default: 80,
      description: "The port the load balancer will listen on"
    }).value;

    this.lbProtocol = new cdktf.TerraformVariable(this, "lbProtocol", {
      default: "HTTP",
      description: "The http protocol the load balancer will use"
    }).value;

    this.certificateArn = "get a certificate Arn for HTTPS traffic from the AWS account";

    this.cpu = new cdktf.TerraformVariable(this, "cpu", {
      default: 256,
      description: "how much cpu should each task use"
    }).value;

    this.memory = new cdktf.TerraformVariable(this, "memory", {
      default: 512,
      description: "how much memory should each task use"
    }).value;
  }
}