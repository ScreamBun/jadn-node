
import json
import os
import binascii
import unittest
import jadn


# Encode and decode data to verify that numeric object keys work properly when JSON converts them to strings
def _j(data):
    return json.loads(json.dumps(data))



class Format(unittest.TestCase):

    schema = {                          # JADN schema for value constraint tests
        'types': [
            ['IPv4-Bin', 'Binary', ['{4', '}4'], ''],  # Check length = 32 bits with format function
            ['IPv4-Hex', 'Binary', ['{4', '}4', '/x'], ''],  # Check length = 32 bits with min/max size
            ['IPv4-String', 'Binary', ['{4', '}4', '/ipv4-addr'], ''],
            ['IPv6-Base64url', 'Binary', ['{16', '}16'], ''],
            ['IPv6-Hex', 'Binary', ['{16', '}16', '/x'], ''],
            ['IPv6-String', 'Binary', ['{16', '}16', '/ipv6-addr'], ''],
            ['IPv4-Net', 'Array', ['/ipv4-net'], '', [
                [1, 'addr', 'Binary', [], ''],
                [2, 'prefix', 'Integer', [], '']
            ]],
            ['IPv6-Net', 'Array', ['/ipv6-net'], '', [
                [1, 'addr', 'Binary', [], ''],
                [2, 'prefix', 'Integer', [], '']
            ]],
            ['T-ipaddrs', 'ArrayOf', ['*IPv4-Bin'], ''],
            ['MAC-Addr', 'Binary', ['/eui'], ''],
            ['Email-Addr', 'String', ['/email'], ''],
            ['Hostname', 'String', ['/hostname'], ''],
            ['URI', 'String', ['/uri'], ''],
            ['Int8', 'Integer', ['/i8'], ''],
            ['Int16', 'Integer', ['/i16'], ''],
            ['Int32', 'Integer', ['/i32'], ''],
            ['Int64', 'Integer', ['/i64'], '']
        ]
    }

    def setUp(self):
        jadn.check(self.schema)
        self.tc = jadn.codec.Codec(self.schema)

    ipv4_b = binascii.a2b_hex('c6020304')           # IPv4 address
    ipv4_s64 = 'xgIDBA'                             # Base64url encoded
    ipv4_sx = 'C6020304'                            # Hex encoded
    ipv4_str = '198.2.3.4'                          # IPv4-string encoded
    ipv4_b1_bad = binascii.a2b_hex('c60203')        # Too short
    ipv4_b2_bad = binascii.a2b_hex('c602030456')    # Too long
    ipv4_s64_bad = 'xgIDBFY'                        # Too long
    ipv4_sx_bad = 'C602030456'                      # Too long
    ipv4_str_bad = '198.2.3.4.56'                   # Too long

    def test_ipv4_addr(self):
        self.tc.set_mode(verbose_rec=True, verbose_str=True)
        self.assertEqual(self.tc.encode('IPv4-Bin', self.ipv4_b), self.ipv4_s64)
        self.assertEqual(self.tc.decode('IPv4-Bin', self.ipv4_s64), self.ipv4_b)
        self.assertEqual(self.tc.encode('IPv4-Hex', self.ipv4_b), self.ipv4_sx)
        self.assertEqual(self.tc.decode('IPv4-Hex', self.ipv4_sx), self.ipv4_b)
        self.assertEqual(self.tc.encode('IPv4-String', self.ipv4_b), self.ipv4_str)
        self.assertEqual(self.tc.decode('IPv4-String', self.ipv4_str), self.ipv4_b)
        with self.assertRaises(ValueError):
            self.tc.encode('IPv4-Hex', self.ipv4_b1_bad)
        with self.assertRaises(ValueError):
            self.tc.encode('IPv4-Hex', self.ipv4_b1_bad)
        with self.assertRaises(ValueError):
            self.tc.decode('IPv4-Bin', self.ipv4_s64_bad)
        with self.assertRaises(ValueError):
            self.tc.decode('IPv4-Hex', self.ipv4_sx_bad)
        with self.assertRaises(ValueError):
            self.tc.decode('IPv4-String', self.ipv4_str_bad)
        with self.assertRaises(ValueError):
            self.tc.encode('IPv4-Bin', b'')
        with self.assertRaises(ValueError):
            self.tc.decode('IPv4-Bin', '')
        with self.assertRaises(ValueError):
            self.tc.encode('IPv4-Hex', b'')
        with self.assertRaises(ValueError):
            self.tc.decode('IPv4-Hex', '')
        with self.assertRaises(ValueError):
            self.tc.encode('IPv4-String', b'')
        with self.assertRaises(ValueError):
            self.tc.decode('IPv4-String', '')

    ipv4_net_str = '192.168.0.0/20'                     # IPv4 CIDR network address (not class C /24)
    ipv4_net_a = [binascii.a2b_hex('c0a80000'), 20]

    def test_ipv4_net(self):
        self.assertEqual(self.tc.encode('IPv4-Net', self.ipv4_net_a), self.ipv4_net_str)
        self.assertEqual(self.tc.decode('IPv4-Net', self.ipv4_net_str), self.ipv4_net_a)
        # with self.assertRaises(ValueError):
        #    self.tc.encode('IPv4-Net', self.ipv4_net_bad1)

    ipv6_b = binascii.a2b_hex('20010db885a3000000008a2e03707334')   # IPv6 address
    ipv6_s64 = 'IAENuIWjAAAAAIouA3BzNA'                             # Base64 encoded
    ipv6_sx = '20010DB885A3000000008A2E03707334'                    # Hex encoded
    ipv6_str1 = '2001:db8:85a3::8a2e:370:7334'                      # IPv6-string encoded
    ipv6_str2 = '2001:db8:85a3::8a2e:0370:7334'                     # IPv6-string encoded - leading 0
    ipv6_str3 = '2001:db8:85A3::8a2e:370:7334'                      # IPv6-string encoded - uppercase
    ipv6_str4 = '2001:db8:85a3:0::8a2e:370:7334'                    # IPv6-string encoded - zero not compressed

    def test_ipv6_addr(self):
        self.assertEqual(self.tc.encode('IPv6-Base64url', self.ipv6_b), self.ipv6_s64)
        self.assertEqual(self.tc.decode('IPv6-Base64url', self.ipv6_s64), self.ipv6_b)
        self.assertEqual(self.tc.encode('IPv6-Hex', self.ipv6_b), self.ipv6_sx)
        self.assertEqual(self.tc.decode('IPv6-Hex', self.ipv6_sx), self.ipv6_b)
        self.assertEqual(self.tc.encode('IPv6-String', self.ipv6_b), self.ipv6_str1)
        self.assertEqual(self.tc.decode('IPv6-String', self.ipv6_str1), self.ipv6_b)

    ipv6_net_str = '2001:db8:85a3::8a2e:370:7334/64'                # IPv6 network address
    ipv6_net_a = [binascii.a2b_hex('20010db885a3000000008a2e03707334'), 64]

    def test_ipv6_net(self):
        self.assertEqual(self.tc.encode('IPv6-Net', self.ipv6_net_a), self.ipv6_net_str)
        self.assertEqual(self.tc.decode('IPv6-Net', self.ipv6_net_str), self.ipv6_net_a)

    eui48b = binascii.a2b_hex('002186b56e10')
    eui48s = '002186b56e10'.upper()
    eui64b = binascii.a2b_hex('022186fffeb56e10')
    eui64s = '022186fffeb56e10'.upper()
    eui48b_bad = binascii.a2b_hex('0226fffeb56e10')
    eui48s_bad = '0226fffeb56e10'.upper()

    def test_mac_addr(self):
        self.assertEqual(self.tc.encode('MAC-Addr', self.eui48b), self.eui48s)
        self.assertEqual(self.tc.decode('MAC-Addr', self.eui48s), self.eui48b)
        self.assertEqual(self.tc.encode('MAC-Addr', self.eui64b), self.eui64s)
        self.assertEqual(self.tc.decode('MAC-Addr', self.eui64s), self.eui64b)
        with self.assertRaises(ValueError):
            self.tc.encode('MAC-Base64url', self.eui48b_bad)
        with self.assertRaises(ValueError):
            self.tc.decode('MAC-Base64url', self.eui48s_bad)

    email1s = 'fred@foo.com'
    email2s_bad = 'https://www.foo.com/index.html'
    email3s_bad = 'Nancy'
    email4s_bad = 'John@'

    def test_email(self):
        self.assertEqual(self.tc.encode('Email-Addr', self.email1s), self.email1s)
        self.assertEqual(self.tc.decode('Email-Addr', self.email1s), self.email1s)
        with self.assertRaises(ValueError):
            self.tc.encode('Email-Addr', self.email2s_bad)
        with self.assertRaises(ValueError):
            self.tc.decode('Email-Addr', self.email2s_bad)
        with self.assertRaises(ValueError):
            self.tc.encode('Email-Addr', self.email3s_bad)
        with self.assertRaises(ValueError):
            self.tc.decode('Email-Addr', self.email3s_bad)
        with self.assertRaises(ValueError):
            self.tc.encode('Email-Addr', self.email4s_bad)
        with self.assertRaises(ValueError):
            self.tc.decode('Email-Addr', self.email4s_bad)

    hostname1s = 'eewww.example.com'
    hostname2s = 'top-gun.2600.xyz'                     # No TLD registry, no requirement to be FQDN
    hostname3s = 'dynamo'                               # No requirement to have more than one label
    hostname1s_bad = '_http._sctp.www.example.com'      # Underscores are allowed in DNS service names but not hostnames
    hostname2s_bad = 'tag-.example.com'                 # Label cannot begin or end with hyphen

    def test_hostname(self):
        self.assertEqual(self.tc.encode('Hostname', self.hostname1s), self.hostname1s)
        self.assertEqual(self.tc.decode('Hostname', self.hostname1s), self.hostname1s)
        self.assertEqual(self.tc.encode('Hostname', self.hostname2s), self.hostname2s)
        self.assertEqual(self.tc.decode('Hostname', self.hostname2s), self.hostname2s)
        self.assertEqual(self.tc.encode('Hostname', self.hostname3s), self.hostname3s)
        self.assertEqual(self.tc.decode('Hostname', self.hostname3s), self.hostname3s)
        with self.assertRaises(ValueError):
            self.tc.encode('Hostname', self.hostname1s_bad)
        with self.assertRaises(ValueError):
            self.tc.decode('Hostname', self.hostname1s_bad)
        with self.assertRaises(ValueError):
            self.tc.encode('Hostname', self.hostname2s_bad)
        with self.assertRaises(ValueError):
            self.tc.decode('Hostname', self.hostname2s_bad)
        with self.assertRaises(ValueError):
            self.tc.encode('Hostname', self.email1s)
        with self.assertRaises(ValueError):
            self.tc.decode('Hostname', self.email1s)

    good_urls = [       # Some examples from WHATWG spec (which uses URL as a synonym for URI, so URNs are valid URLs)
        'http://example.com/resource?foo=bar#fragment',
        'urn:isbn:0451450523',
        'urn:uuid:6e8bc430-9c3a-11d9-9669-0800200c9a66',
        'https://example.com/././foo',
        'file://loc%61lhost/',
        'https://EXAMPLE.com/../x',
        'https://example.org//',
    ]
    bad_urls = [
        'www.example.com/index.html',       # Missing scheme
        # 'https:example.org',                  # // is required
        # 'https://////example.com///',
        # 'http://www.example.com',             # Missing resource
        'file:///C|/demo',
        # 'https://user:password@example.org/',
        'https://example.org/foo bar',      # Extra whitespace
        'https://example.com:demo',         #
        'http://[www.example.com]/',        #
    ]

    def test_uri(self):
        for uri in self.good_urls:
            self.assertEqual(self.tc.encode('URI', uri), uri)
            self.assertEqual(self.tc.decode('URI', uri), uri)
        for uri in self.bad_urls:
            with self.assertRaises(ValueError):
                self.tc.encode('URI', uri)
            with self.assertRaises(ValueError):
                self.tc.decode('URI', uri)

    int8v0 = 0
    int8v1 = -128
    int8v2 =  127
    int8v3 = -129
    int8v4 =  128

    int16v1 = -32768
    int16v2 =  32767
    int16v3 = -32769
    int16v4 =  32768

    int32v1 = -2147483648
    int32v2 =  2147483647
    int32v3 = -2147483649
    int32v4 =  2147483648

    int64v1 = -9223372036854775808
    int64v2 =  9223372036854775807
    int64v3 = -9223372036854775809
    int64v4 =  9223372036854775808

    def test_sized_ints(self):
        self.assertEqual(self.tc.encode('Int8', self.int8v0), self.int8v0)
        self.assertEqual(self.tc.decode('Int8', self.int8v0), self.int8v0)
        self.assertEqual(self.tc.encode('Int8', self.int8v1), self.int8v1)
        self.assertEqual(self.tc.decode('Int8', self.int8v1), self.int8v1)
        self.assertEqual(self.tc.encode('Int8', self.int8v2), self.int8v2)
        self.assertEqual(self.tc.decode('Int8', self.int8v2), self.int8v2)
        with self.assertRaises(ValueError):
            self.tc.encode('Int8', self.int8v3)
        with self.assertRaises(ValueError):
            self.tc.decode('Int8', self.int8v3)
        with self.assertRaises(ValueError):
            self.tc.encode('Int8', self.int8v4)
        with self.assertRaises(ValueError):
            self.tc.decode('Int8', self.int8v4)

        self.assertEqual(self.tc.encode('Int16', self.int8v0), self.int8v0)
        self.assertEqual(self.tc.decode('Int16', self.int8v0), self.int8v0)
        self.assertEqual(self.tc.encode('Int16', self.int16v1), self.int16v1)
        self.assertEqual(self.tc.decode('Int16', self.int16v1), self.int16v1)
        self.assertEqual(self.tc.encode('Int16', self.int16v2), self.int16v2)
        self.assertEqual(self.tc.decode('Int16', self.int16v2), self.int16v2)
        with self.assertRaises(ValueError):
            self.tc.encode('Int16', self.int16v3)
        with self.assertRaises(ValueError):
            self.tc.decode('Int16', self.int16v3)
        with self.assertRaises(ValueError):
            self.tc.encode('Int16', self.int16v4)
        with self.assertRaises(ValueError):
            self.tc.decode('Int16', self.int16v4)

        self.assertEqual(self.tc.encode('Int32', self.int8v0), self.int8v0)
        self.assertEqual(self.tc.decode('Int32', self.int8v0), self.int8v0)
        self.assertEqual(self.tc.encode('Int32', self.int32v1), self.int32v1)
        self.assertEqual(self.tc.decode('Int32', self.int32v1), self.int32v1)
        self.assertEqual(self.tc.encode('Int32', self.int32v2), self.int32v2)
        self.assertEqual(self.tc.decode('Int32', self.int32v2), self.int32v2)
        with self.assertRaises(ValueError):
            self.tc.encode('Int32', self.int32v3)
        with self.assertRaises(ValueError):
            self.tc.decode('Int32', self.int32v3)
        with self.assertRaises(ValueError):
            self.tc.encode('Int32', self.int32v4)
        with self.assertRaises(ValueError):
            self.tc.decode('Int32', self.int32v4)

        self.assertEqual(self.tc.encode('Int64', self.int8v0), self.int8v0)
        self.assertEqual(self.tc.decode('Int64', self.int8v0), self.int8v0)
        self.assertEqual(self.tc.encode('Int64', self.int64v1), self.int64v1)
        self.assertEqual(self.tc.decode('Int64', self.int64v1), self.int64v1)
        self.assertEqual(self.tc.encode('Int64', self.int64v2), self.int64v2)
        self.assertEqual(self.tc.decode('Int64', self.int64v2), self.int64v2)
        with self.assertRaises(ValueError):
            self.tc.encode('Int64', self.int64v3)
        with self.assertRaises(ValueError):
            self.tc.decode('Int64', self.int64v3)
        with self.assertRaises(ValueError):
            self.tc.encode('Int64', self.int64v4)
        with self.assertRaises(ValueError):
            self.tc.decode('Int64', self.int64v4)

class JADN(unittest.TestCase):

    def setUp(self):
        fn = os.path.join(jadn.data_dir(), 'jadn_v1.0_schema.jadn')
        schema = jadn.load(fn)
        self.schema = schema
        sa = jadn.analyze(schema)
        if sa['undefined']:
            print('Warning - undefined:', sa['undefined'])
        self.tc = jadn.codec.Codec(schema)

    def test_jadn_self(self):
        self.tc.set_mode(verbose_rec=True, verbose_str=True)
        self.assertDictEqual(self.tc.encode('Schema', self.schema), self.schema)
        self.assertDictEqual(self.tc.decode('Schema', self.schema), self.schema)


class Simplify(unittest.TestCase):

    schema_enum_optimized = {
        'types': [
            ['Pixel', 'Record', [], '', [
                [1, 'red', 'Integer', [], 'rojo'],
                [2, 'green', 'Integer', [], 'verde'],
                [3, 'blue', 'Integer', [], '']
            ]],
            ['Channel', 'Enumerated', ['#Pixel'], ''],      # Derived enumeration (explicitly named)
            ['ChannelMask', 'ArrayOf', ['*#Pixel'], ''],    # Array of items from named derived enum

            ['Pixel2', 'Record', [], '', [
                [1, 'red', 'Integer', [], 'rojo'],
                [2, 'green', 'Integer', [], 'verde'],
                [3, 'blue', 'Integer', [], '']
            ]],
            ['ChannelMask2', 'ArrayOf', ['*#Pixel2'], ''],  # Array of items from generated derived enum

            ['Foo', 'Array', [], '', [
                [1, 'type', 'Enumerated', ['#Menu'], ''],
                [2, 'value', 'String', [], '']
            ]],
            ['Menu', 'Choice', [], '', [
                [1, 'open', 'String', [], ''],
                [2, 'close', 'String', [], '']
            ]]
        ]
    }

    schema_enum_simplified = {
        'types': [
            ['Pixel', 'Record', [], '', [
                [1, 'red', 'Integer', [], 'rojo'],
                [2, 'green', 'Integer', [], 'verde'],
                [3, 'blue', 'Integer', [], '']
            ]],
            ['Channel', 'Enumerated', [], '', [
                [1, 'red', 'rojo'],
                [2, 'green', 'verde'],
                [3, 'blue', '']
            ]],
            ['ChannelMask', 'ArrayOf', ['*Channel'], ''],

            ['Pixel2', 'Record', [], '', [
                [1, 'red', 'Integer', [], 'rojo'],
                [2, 'green', 'Integer', [], 'verde'],
                [3, 'blue', 'Integer', [], '']
            ]],
            ['ChannelMask2', 'ArrayOf', ['*Pixel2$Enum'], ''],  # Array of items from generated derived enum

            ['Foo', 'Array', [], '', [
                [1, 'type', 'Menu$Enum', [], ''],
                [2, 'value', 'String', [], '']
            ]],
            ['Menu', 'Choice', [], '', [
                [1, 'open', 'String', [], ''],
                [2, 'close', 'String', [], '']
            ]],
            ['Menu$Enum', 'Enumerated', [], '', [
                [1, 'open', ''],
                [2, 'close', '']
            ]],
            ['Pixel2$Enum', 'Enumerated', [], '', [  # Generated implicit derived enum
                [1, 'red', 'rojo'],
                [2, 'green', 'verde'],
                [3, 'blue', '']
            ]]
        ]
    }

    def test_derived_enum(self):
        jadn.check(self.schema_enum_optimized)
        jadn.check(self.schema_enum_simplified)
        ss = jadn.transform.simplify(self.schema_enum_optimized)
        self.assertEqual(ss['types'], self.schema_enum_simplified['types'])

    schema_mapof_optimized = {
        'types': [
            ['Colors-Enum', 'Enumerated', [], '', [
                [1, 'red', 'rojo'],
                [2, 'green', 'verde'],
                [3, 'blue', '']
            ]],
            ['Colors-Map', 'MapOf', ['+Colors-Enum', '*Number'], '']
        ]
    }

    schema_mapof_simplified = {
        'types': [
            ['Colors-Enum', 'Enumerated', [], '', [
                [1, 'red', 'rojo'],
                [2, 'green', 'verde'],
                [3, 'blue', '']
            ]],
            ['Colors-Map', 'Map', [], '', [
                [1, 'red', 'Number', [], 'rojo'],
                [2, 'green', 'Number', [], 'verde'],
                [3, 'blue', 'Number', [], '']
            ]]
        ]
    }

    def test_mapof(self):
        jadn.check(self.schema_mapof_optimized)
        jadn.check(self.schema_mapof_simplified)
        ss = jadn.transform.simplify(self.schema_mapof_optimized)
        self.assertEqual(ss['types'], self.schema_mapof_simplified['types'])


if __name__ == '__main__':
    unittest.main()
