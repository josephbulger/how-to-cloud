import { DnsRecordSet } from "@cdktf/provider-google/lib/dns-record-set";
import { GoogleProvider } from "@cdktf/provider-google/lib/provider";
import { Construct } from "constructs";
import { DnsZone } from "./dns.zone";

export class DnsRecord extends Construct {
    public record;

    constructor(scope: Construct, name: string, config: { provider: GoogleProvider, zone: DnsZone, name: string, type: string, ttl: number, rrdatas: string[] }) {
        super(scope, name);

        const record = new DnsRecordSet(this, `${name}`, {
            provider: config.provider,
            managedZone: config.zone.zoneName,
            name: config.name,
            type: config.type,
            ttl: config.ttl,
            rrdatas: config.rrdatas
        });

        this.record = record;
    }
}
