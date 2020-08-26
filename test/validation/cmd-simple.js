import { ValidationError } from '../../lib/jadnschema/exceptions'


const command = {
    "action": "allow",
    "target": {
        // "idn_email_addr": "用户@例子.广告"  // (Chinese, Unicode)
        // "idn_email_addr": "अजय@डाटा.भारत"  // (Hindi, Unicode)
        // "idn_email_addr": "квіточка@пошта.укр"  // (Ukrainian, Unicode)
        // "idn_email_addr": "θσερ@εχαμπλε.ψομ"  // (Greek, Unicode)
        // "idn_email_addr": "Dörte@Sörensen.example.com"  // (German, Unicode)
        // "idn_email_addr": "коля@пример.рф"  // (Russian, Unicode)
        // "ipv4_connection": {"src_addr": "172.20.0.100", "src_port": 65539}  // Invalid port
        // "ipv4_connection": {"src_addr": "172.20.0.100", "src_port": 8080}
        "ipv4_connection": {"src_addr": "172.20.0.100/33", "src_port": 65539}  // Invalid src_addr & port
        // "ipv4_net": "172.20.0.100/24"
        // "ipv6_net": "fd5b:6aef:acfd:75e0::/64"
        // "device": {"hostname": "test.example.com", "device_id": "device"}
        // "mac_addr": "FD:F1:2A:D6:54:C8" // EUI-48
        // "mac_addr": "a5:dc:b4:00:00:04:01:f2" // EUI-64
    },
    "args": {
        "start_time": 1533144553,  // 2018-08-01T17:29:13.150Z
        "stop_time": 1533155353,  // 2018-08-01T20:29:13.150Z
        "duration": 0,
        "response_requested": "ack"
    },
    // "actuator": {"endpoint": {"asset_id": "endpoint6.example.com"}}
}

function run(schemaObj) {
  test('Command Specific -> Query:Features', () => {
    const rsp = schemaObj.validateAs({
      action: 'query',
      target: {
        features: []
      }
    }, 'OpenC2-Command');
    expect(rsp).toEqual([]);
  });

  test('Command Specific -> Allow:IPv4_Connection', () => {
    const rsp = schemaObj.validateAs(command, 'OpenC2-Command');
    expect(rsp).toEqual([
      new ValidationError('Network Mask of 33 is not valid, must be between 1-32'),
      new ValidationError('Port(Integer) is invalid, maximum of 65535 exceeded')
    ]);
  });

  test('Command Generic -> Allow:IPv4_Connection', () => {
    const rsp = schemaObj.validate(command);
    expect(rsp).toEqual(
      new ValidationError('Network Mask of 33 is not valid, must be between 1-32')
    );
  });

}

export default run;
