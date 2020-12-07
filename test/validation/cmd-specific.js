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
  test('Query:Features', () => {
    const command = {
      action: 'query',
      target: {
        features: []
      }
    };
    const rsp = schemaObj.validateAs(command, 'OpenC2-Command');
    expect(rsp).toEqual([]);
  });

  test('Allow:IPv4_Connection', () => {
    const command = {
      "action": "allow",
      "target": {
        "ipv4_connection": {
          "src_addr": "172.20.0.100/33",
          "src_port": 65539
        }
      },
      "args": {
        "start_time": 1533144553,  // 2018-08-01T17:29:13.150Z
        "stop_time": 1533155353,  // 2018-08-01T20:29:13.150Z
        "duration": 0,
        "response_requested": "ack"
      }
    }
    const rsp = schemaObj.validateAs(command, 'OpenC2-Command');
    expect(rsp).toEqual([
      new ValidationError('Network Mask of 33 is not valid, must be between 1-32'),
      new ValidationError('Port(Integer) is invalid, not within the range of [0:65535]')
    ]);
  });

  test('Allow:MAC_Addr EUI-48', () => {
    const command = {
      "action": "allow",
      "target": {
        "mac_addr": "FD:F1:2A:D6:54:C8"
      },
      "args": {
          "start_time": 1533144553,  // 2018-08-01T17:29:13.150Z
          "stop_time": 1533155353,  // 2018-08-01T20:29:13.150Z
          "duration": 0,
          "response_requested": "ack"
      }
    }
    const rsp = schemaObj.validateAs(command, 'OpenC2-Command');
    expect(rsp).toEqual([]);
  });

  test('Allow:MAC_Addr EUI-64', () => {
    const command = {
      "action": "allow",
      "target": {
        "mac_addr": "a5:dc:b4:00:00:04:01:f2"
      },
      "args": {
        "start_time": 1533144553,  // 2018-08-01T17:29:13.150Z
        "stop_time": 1533155353,  // 2018-08-01T20:29:13.150Z
        "duration": 0,
        "response_requested": "ack"
      }
    }
    const rsp = schemaObj.validateAs(command, 'OpenC2-Command');
    expect(rsp).toEqual([]);
  });

  test('Allow:IDN_Email_Addr Chinese', () => {
    const command = {
      "action": "allow",
      "target": {
        "idn_email_addr": "用户@例子.广告"  // (Chinese, Unicode)
      },
      "args": {
        "start_time": 1533144553,  // 2018-08-01T17:29:13.150Z
        "stop_time": 1533155353,  // 2018-08-01T20:29:13.150Z
        "duration": 0,
        "response_requested": "ack"
      }
    }
    const rsp = schemaObj.validateAs(command, 'OpenC2-Command');
    expect(rsp).toEqual([]);
  });

  test('Allow:IDN_Email_Addr Hindi', () => {
    const command = {
      "action": "allow",
      "target": {
        "idn_email_addr": "अजय@डाटा.भारत"  // (Hindi, Unicode)
      },
      "args": {
        "start_time": 1533144553,  // 2018-08-01T17:29:13.150Z
        "stop_time": 1533155353,  // 2018-08-01T20:29:13.150Z
        "duration": 0,
        "response_requested": "ack"
      }
    }
    const rsp = schemaObj.validateAs(command, 'OpenC2-Command');
    expect(rsp).toEqual([]);
  });

  test('Allow:IDN_Email_Addr Ukrainian', () => {
    const command = {
      "action": "allow",
      "target": {
        "idn_email_addr": "квіточка@пошта.укр"  // (Ukrainian, Unicode)
      },
      "args": {
        "start_time": 1533144553,  // 2018-08-01T17:29:13.150Z
        "stop_time": 1533155353,  // 2018-08-01T20:29:13.150Z
        "duration": 0,
        "response_requested": "ack"
      }
    }
    const rsp = schemaObj.validateAs(command, 'OpenC2-Command');
    expect(rsp).toEqual([]);
  });

  test('Allow:IDN_Email_Addr Greek', () => {
    const command = {
      "action": "allow",
      "target": {
        "idn_email_addr": "θσερ@εχαμπλε.ψομ"  // (Greek, Unicode)
      },
      "args": {
        "start_time": 1533144553,  // 2018-08-01T17:29:13.150Z
        "stop_time": 1533155353,  // 2018-08-01T20:29:13.150Z
        "duration": 0,
        "response_requested": "ack"
      }
    }
    const rsp = schemaObj.validateAs(command, 'OpenC2-Command');
    expect(rsp).toEqual([]);
  });

  test('Allow:IDN_Email_Addr German', () => {
    const command = {
      "action": "allow",
      "target": {
        "idn_email_addr": "Dörte@Sörensen.example.com"  // (German, Unicode)
      },
      "args": {
        "start_time": 1533144553,  // 2018-08-01T17:29:13.150Z
        "stop_time": 1533155353,  // 2018-08-01T20:29:13.150Z
        "duration": 0,
        "response_requested": "ack"
      }
    }
    const rsp = schemaObj.validateAs(command, 'OpenC2-Command');
    expect(rsp).toEqual([]);
  });

  test('Allow:IDN_Email_Addr Russian', () => {
    const command = {
      "action": "allow",
      "target": {
        "idn_email_addr": "коля@пример.рф"  // (Russian, Unicode)
      },
      "args": {
        "start_time": 1533144553,  // 2018-08-01T17:29:13.150Z
        "stop_time": 1533155353,  // 2018-08-01T20:29:13.150Z
        "duration": 0,
        "response_requested": "ack"
      }
    }
    const rsp = schemaObj.validateAs(command, 'OpenC2-Command');
    expect(rsp).toEqual([]);
  });

  test('Allow:Device', () => {
    const command = {
      "action": "allow",
      "target": {
        "device": {"hostname": "test.example.com", "device_id": "device"}
      },
      "args": {
        "start_time": 1533144553,  // 2018-08-01T17:29:13.150Z
        "stop_time": 1533155353,  // 2018-08-01T20:29:13.150Z
        "duration": 0,
        "response_requested": "ack"
      }
    }
    const rsp = schemaObj.validateAs(command, 'OpenC2-Command');
    expect(rsp).toEqual([]);
  })
}

export default run;
