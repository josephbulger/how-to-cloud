import { Construct } from "constructs"
import { EgressOnlyInternetGateway } from "@cdktf/provider-aws/lib/egress-only-internet-gateway"
import { Eip } from "@cdktf/provider-aws/lib/eip"
import { InternetGateway } from "@cdktf/provider-aws/lib/internet-gateway"
import { NatGateway } from "@cdktf/provider-aws/lib/nat-gateway"
import { Route } from "@cdktf/provider-aws/lib/route"
import { RouteTable } from "@cdktf/provider-aws/lib/route-table"
import { RouteTableAssociation } from "@cdktf/provider-aws/lib/route-table-association"
import { Subnet } from "@cdktf/provider-aws/lib/subnet"
import { Vpc } from "@cdktf/provider-aws/lib/vpc"
import { Tfvars } from "../variables"
import { Fn } from "cdktf"

export class Network extends Construct {
  public vpc: Vpc
  public igw: InternetGateway
  public eigw: EgressOnlyInternetGateway
  public azs: string[]
  public publicSubnets: Subnet[]
  public privateSubnets: Subnet[]
  public natEip: Eip
  public natGateway: NatGateway
  public publicRouteTable: RouteTable
  public publicInternetAccessRoute: Route
  public publicRouteTableAssociations: RouteTableAssociation[]
  public privateRouteTable: RouteTable
  public privateInternetAccessRoute: Route
  public privateInternetAccessIpv6Route: Route
  public privateRouteTableAssociations: RouteTableAssociation[]
  public vpcId: String

  constructor(
    scope: Construct,
    name: string,
    vars: Tfvars
  ) {
    super(scope, name);

    this.azs = ["a", "b", "c"].map((zone) => `${vars.region}${zone}`)

    this.vpc = new Vpc(this, "main", {
      assignGeneratedIpv6CidrBlock: true,
      cidrBlock: vars.cidr,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      instanceTenancy: "default",
      tags: {
        Name: `${name}-vpc`,
      },
    })

    this.vpcId = this.vpc.id;

    this.publicSubnets = this.azs.map((az, index) => {
      return new Subnet(this, "public_subnet_" + az, {
        assignIpv6AddressOnCreation: true,
        availabilityZone: az,
        cidrBlock: Fn.cidrsubnet(this.vpc.cidrBlock, 4, index),
        ipv6CidrBlock: Fn.cidrsubnet(this.vpc.ipv6CidrBlock, 8, index),
        mapPublicIpOnLaunch: true,
        tags: {
          Name: `${name}-public-${az}`,
        },
        vpcId: this.vpc.id,
      })
    })

    this.privateSubnets = this.azs.map((az, index) => {
      return new Subnet(this, "private_subnet_" + az, {
        availabilityZone: az,
        cidrBlock: Fn.cidrsubnet(
          this.vpc.cidrBlock,
          4,
          index + this.publicSubnets.length
        ),
        tags: {
          Name: `${name}-private-${az}`,
        },
        vpcId: this.vpc.id,
      })
    })

    this.igw = new InternetGateway(this, "igw", {
      vpcId: this.vpc.id,
      tags: {
        Name: `${name}-igw`,
      },
    })

    this.publicRouteTable = new RouteTable(this, "public", {
      vpcId: this.vpc.id,
      tags: { Name: `${name}-public-rtb`}
    })

    this.publicInternetAccessRoute = new Route(this, "public_internet_access", {
      destinationCidrBlock: "0.0.0.0/0",
      gatewayId: this.igw.id,
      routeTableId: this.publicRouteTable.id,
    })

    this.publicRouteTableAssociations = this.publicSubnets.map((subnet) => {
      return new RouteTableAssociation(this, `public_route_table_association_${subnet.availabilityZoneInput}`, {
        subnetId: subnet.id,
        routeTableId: this.publicRouteTable.id
      })
    })

    this.eigw = new EgressOnlyInternetGateway(this, "eigw", {
      vpcId: this.vpc.id,
      tags: { Name: `${name}-eigw`},
    })

    this.natEip = new Eip(this, "nat_eip", {
      vpc: true,
      tags: { Name: `${name}-nat-eip`}
    })

    this.natGateway = new NatGateway(this, "nat", {
      allocationId: this.natEip.id,
      dependsOn: [this.natEip, this.igw],
      subnetId: this.publicSubnets[0].id,
      tags: { Name: `${name}-nat`}
    })

    this.privateRouteTable = new RouteTable(this, "private", {
      vpcId: this.vpc.id,
      tags: { Name: `${name}-private-rtb`}
    })

    this.privateInternetAccessRoute = new Route(this, "private_internet_access", {
      destinationCidrBlock: "0.0.0.0/0",
      natGatewayId: this.natGateway.id,
      routeTableId: this.privateRouteTable.id,
    })

    this.privateInternetAccessIpv6Route = new Route(this, "private_internet_access_ipv6", {
      destinationIpv6CidrBlock: "::/0",
      egressOnlyGatewayId: this.eigw.id,
      routeTableId: this.privateRouteTable.id,
    })

    this.privateRouteTableAssociations = this.privateSubnets.map((subnet) => {
      return new RouteTableAssociation(this, `private_route_table_association_${subnet.availabilityZoneInput}`, {
        subnetId: subnet.id,
        routeTableId: this.privateRouteTable.id
      })
    })
  }
}