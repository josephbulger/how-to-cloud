import { DnsManagedZone } from "@cdktf/provider-google/lib/dns-managed-zone";
import { GoogleProvider } from "@cdktf/provider-google/lib/provider";
import { Construct } from "constructs";

export class DnsZone extends Construct {
    public zoneName;
    public dnsName;

    constructor(scope: Construct, name: string, config: { provider: GoogleProvider, url: string }) {
        super(scope, name);   
        
        const zone = new DnsManagedZone(this, `${name}`, { 
            provider: config.provider,
            dnsName: config.url,
            name: `${name}`
        });

        this.zoneName = zone.name;
        this.dnsName = zone.dnsName;
    }
}
