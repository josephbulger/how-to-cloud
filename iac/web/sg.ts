import { Fn, Token } from "cdktf"
import { Construct } from "constructs"
import { Tfvars } from "../variables"
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group"
import { Account } from "../account"
import { SecurityGroupRule } from "@cdktf/provider-aws/lib/security-group-rule"

export class SecurityGroups extends Construct {
  public webFrontEnd: SecurityGroup
  
  constructor(
    scope: Construct,
    name: string,
    vars: Tfvars,
    account: Account
  ) {
    super(scope, name)

    const project = `${Fn.lookup(vars.tags, "project", "")}`

    const allowIngress80 = (
      securityGroupId: string,
      constructId: string
    ) => (
      new SecurityGroupRule(this, constructId, {
        securityGroupId,
        type: "ingress",
        protocol: "tcp",
        fromPort: 80,
        toPort: 80,
        cidrBlocks: ["0.0.0.0/0"],
        ipv6CidrBlocks: ["::/0"],
        description: "Allow HTTP traffic",
      })
    )

    const allowEgressAll = (
      securityGroupId: string,
      constructId: string
    ) => (
      new SecurityGroupRule(this, constructId, {
        securityGroupId,
        type: "egress",
        protocol: "-1",
        fromPort: 0,
        toPort: 0,
        cidrBlocks: ["0.0.0.0/0"],
        ipv6CidrBlocks: ["::/0"],
        description: "Allow any outbound traffic",
      })
    )

    const allowInboundSelf = (
      securityGroupId: string,
      constructId: string
    ) => (
      new SecurityGroupRule(this, constructId, {
        securityGroupId,
        type: "ingress",
        protocol: "-1",
        fromPort: 0,
        toPort: 0,
        selfAttribute: true,
        description: "Allow any outbound traffic from others with same security group"
      })
    )

    this.webFrontEnd = new SecurityGroup(this, "web_front_end_alb_security_group", {
      namePrefix: `${project}-ecs-frontend-alb`,
      description: "security group for web front end load balancer",
      vpcId: Token.asString(account.vpc.vpcIdOutput),
    })

    new SecurityGroupRule(this, "client_service_allow_alb_9090", {
      securityGroupId: this.webFrontEnd.id,
      type: "ingress",
      protocol: "tcp",
      fromPort: 8080,
      toPort: 8080,
      sourceSecurityGroupId: this.webFrontEnd.id,
      description: "Allow HTTP traffic on 8080 from the web front end ALB",
    })
    
    allowIngress80(this.webFrontEnd.id, "web_front_end_alb_allow_80")
    allowEgressAll(this.webFrontEnd.id, "web_front_end_alb_allow_outbound")
    allowInboundSelf(this.webFrontEnd.id, "web_front_end_service_allow_inbound_self")
  }
}
