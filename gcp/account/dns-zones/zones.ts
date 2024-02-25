import { GoogleProvider } from "@cdktf/provider-google/lib/provider";
import { Construct } from "constructs";
import * as fs from "fs";
import { parse } from "./zone.parser";
import { DnsZone } from "./dns.zone";
import { DnsRecord } from "./dns.record";
import { globSync } from "glob";

export class Zones extends Construct {
  constructor(
    scope: Construct,
    name: string,
    config: { provider: GoogleProvider }
  ) {
    super(scope, name);

    const files = globSync(`${__dirname}/**/*.zone`);

    for (const file of files) {
      const json = fs.readFileSync(file, "utf8");
      const zoneDetails = parse(json);
      console.log(zoneDetails);

      const zoneName = zoneDetails.$origin.replaceAll(".", "-");

      const zone = new DnsZone(this, `${zoneName}zone`, {
        provider: config.provider,
        url: zoneDetails.$origin,
      });

      for (const r of zoneDetails.rrDetails) {
        var index = 1;
        new DnsRecord(this, `${zoneName}cname-${index++}`, {
          provider: config.provider,
          zone: zone,
          name: r.name,
          type: r.type,
          ttl: r.ttl,
          rrdatas: r.rrdatas,
        });
      }
    }
  }
}
