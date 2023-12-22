import { Alb } from "@cdktf/provider-aws/lib/alb";
import { Construct } from "constructs";
import { Tfvars } from "../variables";
import { Network } from "./vpc";
import { LbTargetGroup } from "@cdktf/provider-aws/lib/lb-target-group";
import { LbListener } from "@cdktf/provider-aws/lib/lb-listener";

export class HowToCloudAlb extends Construct {
  public lb: Alb;
  public targetGroup: LbTargetGroup;
  public listener: LbListener;

  constructor(
    scope: Construct,
    name: string,
    vars: Tfvars,
    internal: Boolean,
    vpc: Network,
    securityGroupId: string
  ) {
    super(scope, name);

    this.lb = new Alb(this, `${name}`, {
      securityGroups: [securityGroupId],
      namePrefix: `${name}`,
      loadBalancerType: "application",
      subnets: (internal ? vpc.privateSubnets : vpc.publicSubnets).map((subnet) => subnet.id),
      internal: internal == true,
      idleTimeout: 60,
      ipAddressType: "dualstack",
      tags: vars.tags,
    });

    this.targetGroup = new LbTargetGroup(this, `${name}-targets`, {
      namePrefix: `${name}-targets`,
      port: vars.containerPort,
      protocol: vars.lbProtocol,
      vpcId: vpc.vpcId.toString(),
      deregistrationDelay: "30",
      targetType: "ip",

      healthCheck: {
        enabled: true,
        path: "/",
        healthyThreshold: 3,
        unhealthyThreshold: 3,
        timeout: 30,
        interval: 60,
        protocol: vars.lbProtocol,
      },

      tags: vars.tags,
    });

    this.listener = new LbListener(this, `${name}-listener`, {
      loadBalancerArn: this.lb.arn,
      port: vars.lbPort,
      protocol: vars.lbProtocol,
      certificateArn: vars.certificateArn,

      defaultAction: [
        {
          type: "forward",
          targetGroupArn: this.targetGroup.arn,
        },
      ],
    });
  }
}
