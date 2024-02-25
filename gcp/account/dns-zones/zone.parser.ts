export let parse = function (text: string) {
  text = removeComments(text);
  text = flatten(text);
  var zoneDetails = parseRRs(text);
  for (const r in zoneDetails) {
    if (["$origin", "$ttl", "soa", "ns"].indexOf(r) == -1) {
      const groups = groupRecords(zoneDetails[r]);
      zoneDetails[r] = groups;
    }
  }
  zoneDetails.rrDetails = [];
  buildRRData(zoneDetails);
  return zoneDetails;
};

let removeComments = function (text: string) {
  const lines = text.split("\n");
  let ret = "";
  for (const line of lines) {
    if (line.trim().startsWith(";")) {
      continue;
    }
    const tokens = splitArgs(line, ";", true);
    for (const token of tokens) {
      ret += token;
      if (token.endsWith("\\")) {
        ret += ";";
      } else {
        ret += "\n";
        break;
      }
    }
  }
  return ret;
};

let flatten = function (text: string) {
  let re = /SOA[\s\S]*?\([\s\S]*?\)/gim;
  let match = re.exec(text);
  if (match !== null) {
    let soa = match[0].replace(/\s+/gm, " ");
    soa = soa.replace(/\(|\)/gim, " ");
    return (
      text.substring(0, match.index) +
      soa +
      text.substring(match.index + match[0].length)
    );
  } else {
    return text;
  }
};

let normalizeRR = function (rr: any) {
  let rrArray = splitArgs(rr, null, true);
  let hasName = false;
  let hasTtl = false;
  if (rr.match(/^\s+/)) {
    hasName = false;
  } else {
    hasName = true;
  }

  if (hasName) {
    if (!isNaN(+rrArray[1])) {
      hasTtl = true;
    }
  } else {
    if (!isNaN(+rrArray[0])) {
      hasTtl = true;
    }
  }

  let rrTypeIndex = 0;
  if (hasName) {
    ++rrTypeIndex;
  }
  if (hasTtl) {
    ++rrTypeIndex;
  }
  let rrType = rrArray[rrTypeIndex];
  if (rrType === "IN") {
    rrType = rrArray[rrTypeIndex + 1];
  }

  let typeIndex = rrArray.indexOf(rrType, hasName ? 1 : 0);
  if (typeIndex === 0 || rrArray[typeIndex - 1] !== "IN") {
    rrArray.splice(typeIndex, 0, "IN");
    ++typeIndex;
  }

  return {
    rrType,
    tokens: rrArray,
    hasName: hasName,
    hasTtl: hasTtl,
    typeIndex: typeIndex,
  };
};

let parseRRs = function (text: string) {
  let ret: any = {};
  let rrs = text.split("\n");
  for (let rr of rrs) {
    if (!rr.trim()) {
      continue;
    }
    let rrArray = splitArgs(rr, null, true);
    if (rr.startsWith("$ORIGIN")) {
      ret.$origin = rrArray[1];
    } else if (rr.startsWith("$TTL")) {
      ret.$ttl = rrArray[1];
    } else {
      const nrr = normalizeRR(rr);
      switch (nrr.rrType) {
        case "SOA":
          ret.soa = parseSOA(rrArray);
          break;
        case "TXT":
          ret.txt = ret.txt || [];
          ret.txt.push(parseTXT(nrr, ret.txt));
          break;
        case "NS":
          ret.ns = ret.ns || [];
          ret.ns.push(parseNS(nrr, ret.ns));
          break;
        case "A":
          ret.a = ret.a || [];
          ret.a.push(parseA(nrr, ret.a));
          break;
        case "AAAA":
          ret.aaaa = ret.aaaa || [];
          ret.aaaa.push(parseAAAA(nrr, ret.aaaa));
          break;
        case "CNAME":
          ret.cname = ret.cname || [];
          ret.cname.push(parseCNAME(nrr, ret.cname));
          break;
        case "MX":
          ret.mx = ret.mx || [];
          ret.mx.push(parseMX(nrr, ret.mx));
          break;
        case "PTR":
          ret.ptr = ret.ptr || [];
          ret.ptr.push(parsePTR(nrr, ret.ptr, ret.$origin));
          break;
        case "SRV":
          ret.srv = ret.srv || [];
          ret.srv.push(parseSRV(nrr, ret.srv));
          break;
        case "SPF":
          ret.spf = ret.spf || [];
          ret.spf.push(parseSPF(nrr, ret.spf));
          break;
        case "CAA":
          ret.caa = ret.caa || [];
          ret.caa.push(parseCAA(nrr, ret.caa));
          break;
        case "DS":
          ret.ds = ret.ds || [];
          ret.ds.push(parseDS(nrr, ret.ds));
          break;
      }
    }
  }
  return ret;
};

let parseSOA = function (rrTokens: any) {
  let soa: any = {};
  let l = rrTokens.length;
  soa.name = rrTokens[0];
  soa.minimum = parseInt(rrTokens[l - 1], 10);
  soa.expire = parseInt(rrTokens[l - 2], 10);
  soa.retry = parseInt(rrTokens[l - 3], 10);
  soa.refresh = parseInt(rrTokens[l - 4], 10);
  soa.serial = parseInt(rrTokens[l - 5], 10);
  soa.rname = rrTokens[l - 6];
  soa.mname = rrTokens[l - 7];
  if (!isNaN(rrTokens[1])) soa.ttl = parseInt(rrTokens[1], 10);
  return soa;
};

let parseNS = function (rrData: any, recordsSoFar: any) {
  let rrTokens = rrData.tokens;
  if (!rrData.hasName) {
    if (recordsSoFar.length) {
      rrTokens.unshift(recordsSoFar[recordsSoFar.length - 1].name);
    } else {
      rrTokens.unshift("@");
    }
  }

  let l = rrTokens.length;
  let result: any = {
    name: rrTokens[0],
    host: rrTokens[l - 1],
  };

  if (rrData.hasTtl) result.ttl = parseInt(rrTokens[1], 10);
  return result;
};

let parseA = function (rrData: any, recordsSoFar: any) {
  let rrTokens = rrData.tokens;
  if (!rrData.hasName) {
    if (recordsSoFar.length) {
      rrTokens.unshift(recordsSoFar[recordsSoFar.length - 1].name);
    } else {
      rrTokens.unshift("@");
    }
  }

  let l = rrTokens.length;
  let result: any = {
    name: rrTokens[0],
    ip: rrTokens[l - 1],
  };

  if (rrData.hasTtl) result.ttl = parseInt(rrTokens[1], 10);
  return result;
};

let parseAAAA = function (rrData: any, recordsSoFar: any) {
  let rrTokens = rrData.tokens;
  if (!rrData.hasName) {
    if (recordsSoFar.length) {
      rrTokens.unshift(recordsSoFar[recordsSoFar.length - 1].name);
    } else {
      rrTokens.unshift("@");
    }
  }

  let l = rrTokens.length;
  let result: any = {
    name: rrTokens[0],
    ip: rrTokens[l - 1],
  };

  if (rrData.hasTtl) result.ttl = parseInt(rrTokens[1], 10);
  return result;
};

let parseCNAME = function (rrData: any, recordsSoFar: any) {
  let rrTokens = rrData.tokens;
  if (!rrData.hasName) {
    if (recordsSoFar.length) {
      rrTokens.unshift(recordsSoFar[recordsSoFar.length - 1].name);
    } else {
      rrTokens.unshift("@");
    }
  }

  let l = rrTokens.length;
  let result: any = {
    name: rrTokens[0],
    alias: rrTokens[l - 1],
  };

  if (rrData.hasTtl) result.ttl = parseInt(rrTokens[1], 10);
  return result;
};

let parseMX = function (rrData: any, recordsSoFar: any) {
  let rrTokens = rrData.tokens;
  if (!rrData.hasName) {
    if (recordsSoFar.length) {
      rrTokens.unshift(recordsSoFar[recordsSoFar.length - 1].name);
    } else {
      rrTokens.unshift("@");
    }
  }

  let l = rrTokens.length;
  let result: any = {
    name: rrTokens[0],
    preference: parseInt(rrTokens[l - 2], 10),
    host: rrTokens[l - 1],
  };

  if (rrData.hasTtl) result.ttl = parseInt(rrTokens[1], 10);
  return result;
};

let parseTXT = function (rrData: any, recordsSoFar: any) {
  let rrTokens = rrData.tokens;
  const txtArray = rrTokens.slice(rrData.typeIndex + 1);
  if (!rrData.hasName) {
    if (recordsSoFar.length) {
      rrTokens.unshift(recordsSoFar[recordsSoFar.length - 1].name);
    } else {
      rrTokens.unshift("@");
    }
  }

  let result: any = {
    name: rrTokens[0],
    txt: txtArray.join(" "),
  };

  if (rrData.hasTtl) result.ttl = parseInt(rrTokens[1], 10);
  return result;
};

let parsePTR = function (rrData: any, recordsSoFar: any, currentOrigin: any) {
  let rrTokens = rrData.tokens;
  if (!rrData.hasName && recordsSoFar[recordsSoFar.length - 1]) {
    rrTokens.unshift(recordsSoFar[recordsSoFar.length - 1].name);
  }

  let l = rrTokens.length;
  let result: any = {
    name: rrTokens[0],
    fullname: rrTokens[0] + "." + currentOrigin,
    host: rrTokens[l - 1],
  };

  if (rrData.hasTtl) result.ttl = parseInt(rrTokens[1], 10);
  return result;
};

let parseSRV = function (rrData: any, recordsSoFar: any) {
  let rrTokens = rrData.tokens;
  if (!rrData.hasName) {
    if (recordsSoFar.length) {
      rrTokens.unshift(recordsSoFar[recordsSoFar.length - 1].name);
    } else {
      rrTokens.unshift("@");
    }
  }

  let l = rrTokens.length;
  let result: any = {
    name: rrTokens[0],
    target: rrTokens[l - 1],
    priority: parseInt(rrTokens[l - 4], 10),
    weight: parseInt(rrTokens[l - 3], 10),
    port: parseInt(rrTokens[l - 2], 10),
  };

  if (rrData.hasTtl) result.ttl = parseInt(rrTokens[1], 10);
  return result;
};

let parseSPF = function (rrData: any, recordsSoFar: any) {
  let rrTokens = rrData.tokens;
  const txtArray = rrTokens.slice(rrData.typeIndex + 1);
  if (!rrData.hasName) {
    if (recordsSoFar.length) {
      rrTokens.unshift(recordsSoFar[recordsSoFar.length - 1].name);
    } else {
      rrTokens.unshift("@");
    }
  }

  let result: any = {
    name: rrTokens[0],
    data: txtArray.join(" "),
  };

  if (rrData.hasTtl) result.ttl = parseInt(rrTokens[1], 10);
  return result;
};

let parseCAA = function (rrData: any, recordsSoFar: any) {
  let rrTokens = rrData.tokens;
  if (!rrData.hasName) {
    if (recordsSoFar.length) {
      rrTokens.unshift(recordsSoFar[recordsSoFar.length - 1].name);
    } else {
      rrTokens.unshift("@");
    }
  }

  let l = rrTokens.length;
  let result: any = {
    name: rrTokens[0],
    flags: parseInt(rrTokens[l - 3], 10),
    tag: rrTokens[l - 2],
    value: rrTokens[l - 1],
  };

  if (rrData.hasTtl) result.ttl = parseInt(rrTokens[1], 10);
  return result;
};

let parseDS = function (rrData: any, recordsSoFar: any) {
  let rrTokens = rrData.tokens;
  if (!rrData.hasName) {
    if (recordsSoFar.length) {
      rrTokens.unshift(recordsSoFar[recordsSoFar.length - 1].name);
    } else {
      rrTokens.unshift("@");
    }
  }

  let l = rrTokens.length;
  let result: any = {
    name: rrTokens[0],
    key_tag: rrTokens[l - 4],
    algorithm: rrTokens[l - 3],
    digest_type: rrTokens[l - 2],
    digest: rrTokens[l - 1],
  };

  if (rrData.hasTtl) result.ttl = parseInt(rrTokens[1], 10);
  return result;
};

let splitArgs = function (input: any, sep: any, keepQuotes: any): string[] {
  let separator = sep || /\s/g;
  let singleQuoteOpen = false;
  let doubleQuoteOpen = false;
  let tokenBuffer = [];
  let ret = [];

  let arr = input.split("");
  for (let i = 0; i < arr.length; ++i) {
    let element = arr[i];
    let matches = element.match(separator);
    if (element === "'" && !doubleQuoteOpen) {
      if (keepQuotes === true) {
        tokenBuffer.push(element);
      }
      singleQuoteOpen = !singleQuoteOpen;
      continue;
    } else if (element === '"' && !singleQuoteOpen) {
      if (keepQuotes === true) {
        tokenBuffer.push(element);
      }
      doubleQuoteOpen = !doubleQuoteOpen;
      continue;
    }

    if (!singleQuoteOpen && !doubleQuoteOpen && matches) {
      if (tokenBuffer.length > 0) {
        ret.push(tokenBuffer.join(""));
        tokenBuffer = [];
      }
    } else {
      tokenBuffer.push(element);
    }
  }
  if (tokenBuffer.length > 0) {
    ret.push(tokenBuffer.join(""));
  } else if (!!sep) {
    ret.push("");
  }
  return ret;
};

function groupRecords(records: { name: string }[]) {
  const groups = records.reduce((groups: any, item: { name: string }) => {
    const group = groups[item.name] || [];
    group.push(item);
    groups[item.name] = group;
    return groups;
  }, {});

  return groups;
}

function buildRRData(zoneDetails: any) {
  for (const key in zoneDetails) {
    if (["$origin", "$ttl", "soa", "ns", "rrDetails"].indexOf(key) == -1) {
      const type = key.toUpperCase();
      for (const r in zoneDetails[key]) {
        let result = {
          type: type,
          rrdatas: getMapping(key, zoneDetails[key][r]),
          name: r,
          ttl: zoneDetails[key][r][0].ttl || zoneDetails.$ttl,
        };
        zoneDetails.rrDetails.push(result);
      }
    }
  }
}

function getMapping(type: string, array: any[]) {
  switch (type) {
    case "cname":
      return array.map((x: { alias: any }) => `${x.alias}`);
    case "mx":
      return array.map(
        (x: { host: any; preference: any }) => `${x.preference} ${x.host}`
      );
    case "spf":
      return array.map((x: { data: any }) => `${x.data}`);
    case "srv":
      return array.map(
        (x) => `${x.priority} ${x.weight} ${x.port} ${x.target}`
      );
    case "txt":
      return array.map((x: { txt: any }) => `${x.txt}`);
    case "a":
      return array.map((x: { ip: any }) => `${x.ip}`);
    default:
      return array.map((x) => x);
  }
}

export default {
  parse,
};
