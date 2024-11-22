import { Construct } from "constructs";
import { Lambda } from "../.gen/modules/lambda";
import { Apigateway } from "../.gen/modules/apigateway";
export class API extends Construct {
  config: {};
  constructor(
    scope: Construct,
    name: string,
    config: { ecrUri: string; tag: string; domain: string; hostedZone: string }
  ) {
    super(scope, name);
    this.config = config;

    let lambda = new Lambda(scope, `${name}-function`, {
      functionName: `${name}-function`,
      createPackage: false,
      packageType: "Image",
      architectures: ["x86_64"],
      imageUri: `${config.ecrUri}:${config.tag}`,
      publish: true,
    });

    const lambdaArn = lambda.lambdaFunctionArnOutput;

    let gw = new Apigateway(scope, `${name}-gw`, {
      name: `${name}-gw`,
      protocolType: "HTTP",
      corsConfiguration: {
        allowHeaders: [
          "content-type",
          "x-amz-date",
          "authorization",
          "x-api-key",
          "x-amz-security-token",
          "x-amz-user-agent",
        ],
        allowMethods: ["*"],
        allowOrigins: ["*"],
      },

      createDomainName: true,
      createDomainRecords: true,
      createCertificate: true,

      domainName: config.domain,
      hostedZoneName: config.hostedZone,

      routes: {
        "ANY /": {
          integration: {
            uri: lambdaArn,
            payload_format_version: "2.0",
            timeout_milliseconds: 3000,
          },
        },
        $default: {
          integration: {
            uri: lambdaArn,
            payload_format_version: "2.0",
            timeout_milliseconds: 3000,
          },
        },
      },
    });

    let apiExecArn = gw.apiExecutionArnOutput;

    let triggers = {
      APIGatewayAny: {
        service: "apigateway",
        source_arn: `${apiExecArn}/*/*`,
      },
    };

    lambda.allowedTriggers = triggers;
  }
}
