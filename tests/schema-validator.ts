import { jadn } from '../lib/api';

const schema = 'tests/schema/oc2ls-v1.0-wd14_update.jadn';

const cmd = {
    "action": "allow",
    "target": {
        // "idn_email_addr": "用户@例子.广告"  # (Chinese, Unicode)
        // "idn_email_addr": "अजय@डाटा.भारत"  # (Hindi, Unicode)
        // "idn_email_addr": "квіточка@пошта.укр"  # (Ukrainian, Unicode)
        // "idn_email_addr": "θσερ@εχαμπλε.ψομ"  # (Greek, Unicode)
        // "idn_email_addr": "Dörte@Sörensen.example.com"  # (German, Unicode)
        // "idn_email_addr": "коля@пример.рф"  # (Russian, Unicode)
        // "ipv4_connection": {"src_addr": "172.20.0.100", "src_port": 65539}  // Invalid port
        "device": {"hostname": "test.example.com", "device_id": "device"}
    },
    "args": {
        "start_time": 1533144553,  // 2018-08-01T17:29:13.150Z
        "stop_time": 1533155353,  // 2018-08-01T20:29:13.150Z
        "duration": 0,
        "response_requested": "ack"
    },
    // "actuator": {"endpoint": {"asset_id": "endpoint6.example.com"}}
}

const rsp = {
    "status": 200,
    "status_text": "string",
    "results": {
        // "x-command": {"ref": "INTERNALREFERENCEVALUEABC123"}
        "pairs": {"scan": ["file"], "query": ["features"]}
    }
}

const schemaObj = jadn.load(schema);
console.log(Object.entries(schemaObj.analyze()).map(([k, v]) => `${k}: ${v}` ).join('\n'));

console.log('\n\n');

// console.log(Object.entries(schemaObj.types).map(([k, v]) => `${k}: ${v}`));

// Validate
const cmdSpecific = schemaObj.validateAs(cmd, 'OpenC2-Command');
const rspSpecific = schemaObj.validateAs(rsp, 'OpenC2-Response');
const cmdGeneric = schemaObj.validate(cmd);
const rspGeenric = schemaObj.validate(rsp);

const results = `
Validate (specific)
"OpenC2-Command" - ${JSON.stringify(cmd, null, 2)}
Command is ${cmdSpecific.length === 0 ? 'Valid' : 'Invalid'}

"OpenC2-Response" - ${JSON.stringify(rsp, null, 2)}
Response is ${rspSpecific.length === 0 ? 'Valid' : 'Invalid'}
--------------------------------------------------
Validate (generic)
${JSON.stringify(cmd, null, 2)}
Message is ${cmdGeneric ? 'Valid' : 'Invalid'}

${JSON.stringify(rsp, null, 2)}
Message is ${rspGeenric ? 'Valid' : 'Invalid'}
`;
console.log(results);
// console.log(schemaObj.dumps())