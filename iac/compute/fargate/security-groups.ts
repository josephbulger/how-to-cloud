import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group"
import { SecurityGroupRule } from "@cdktf/provider-aws/lib/security-group-rule"
import { Construct } from "constructs"
import { Tfvars } from "../../variables"
import { allowIngressOnPort, allowEgressAll, allowInboundSelf } from "../../common/security"

export class SecurityGroups extends Construct {
  public webAlb: SecurityGroup
  public webService: SecurityGroup
  public backendAlb: SecurityGroup
  public backendService: SecurityGroup
  
  constructor(
    scope: Construct,
    name: string,
    vars: Tfvars,
    vpcId: string
  ) {
    super(scope, name)

    this.webAlb = new SecurityGroup(this, `${name}-web-alb`, {
      namePrefix: `${name}-web-alb`,
      description: "security group for web application load balancer",
      vpcId,
    })
    allowIngressOnPort(this, this.webAlb.id, "web_alb_allow_port", vars.lbPort)
    allowEgressAll(this, this.webAlb.id, "web_alb_allow_outbound")

    this.webService = new SecurityGroup(this, `${name}-web-service`, {
      namePrefix: `${name}-web-service`,
      description: "security group for web service",
      vpcId,
    })

    new SecurityGroupRule(this, "web_service_allow_alb_container_port", {
      securityGroupId: this.webService.id,
      type: "ingress",
      protocol: "tcp",
      fromPort: vars.containerPort,
      toPort: vars.containerPort,
      sourceSecurityGroupId: this.webAlb.id,
      description: "Allow HTTP traffic on container port from the web ALB",
    })
    allowInboundSelf(this, this.webService.id, "web_service_allow_inbound_self")
    allowEgressAll(this, this.webService.id, "web_service_allow_outbound")

    this.backendAlb = new SecurityGroup(this, `${name}-backend-alb`, {
      namePrefix: `${name}-backend-alb`,
      description: "security group for backend ALB",
      vpcId,
    })

    new SecurityGroupRule(this, "backend_alb_allow_port", {
      securityGroupId: this.backendAlb.id,
      type: "ingress",
      protocol: "tcp",
      fromPort: vars.lbPort,
      toPort: vars.lbPort,
      cidrBlocks: ["0.0.0.0/0"],
      description: "Allow HTTP traffic on http port for the backend service",
    })
    allowEgressAll(this, this.backendAlb.id, "backend_alb_allow_outbound")

    this.backendService = new SecurityGroup(this, `${name}-backend-service`, {
      namePrefix: `${name}-backend-service`,
      description: "security group for backend services",
      vpcId,
    })

    new SecurityGroupRule(this, "backend_service_allow_alb_container_port", {
      securityGroupId: this.backendService.id,
      type: "ingress",
      protocol: "tcp",
      fromPort: vars.containerPort,
      toPort: vars.containerPort,
      sourceSecurityGroupId: this.backendAlb.id,
      description: "Allow HTTP traffic on container port from the backend services alb",
    })
    allowInboundSelf(this, this.backendService.id, "backend_service_allow_inbound_self")
    allowEgressAll(this, this.backendService.id, "backend_service_allow_outbound")

  }
}

