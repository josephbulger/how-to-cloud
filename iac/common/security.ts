import { SecurityGroupRule } from "@cdktf/provider-aws/lib/security-group-rule"
import { Construct } from "constructs"

export const allowIngressOnPort = (
  scope: Construct,
  securityGroupId: string,
  constructId: string,
  port: number
) => (
  new SecurityGroupRule(scope, constructId, {
    securityGroupId,
    type: "ingress",
    protocol: "tcp",
    fromPort: port,
    toPort: port,
    cidrBlocks: ["0.0.0.0/0"],
    ipv6CidrBlocks: ["::/0"],
    description: "Allow HTTP traffic",
  })
)

export const allowEgressAll = (
  scope: Construct,
  securityGroupId: string,
  constructId: string
) => (
  new SecurityGroupRule(scope, constructId, {
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

export const allowInboundSelf = (
  scope: Construct,
  securityGroupId: string,
  constructId: string
) => (
  new SecurityGroupRule(scope, constructId, {
    securityGroupId,
    type: "ingress",
    protocol: "-1",
    fromPort: 0,
    toPort: 0,
    selfAttribute: true,
    description: "Allow any traffic from anywhere in same security group"
  })
)