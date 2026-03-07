import { describe, expect, test } from 'vitest';
import id from '../index.js';

describe('isUri – IPv4 host validation', () => {
    test('Valid full IPv4 address', () => {
        expect(id.isUri('https://1.2.3.4')).to.equal(true);
    });

    test('Invalid IPv4 address, but valid as hostname', () => {
        expect(id.isUri('https://999.999.999.999')).to.equal(true);
    });
});

describe('isIri – IPv4 host validation', () => {
    test('Valid full IPv4 address', () => {
        expect(id.isIri('https://1.2.3.4')).to.equal(true);
    });

    test('Invalid IPv4 address, but valid as hostname', () => {
        expect(id.isIri('https://999.999.999.999')).to.equal(true);
    });
});

describe('isUri – IPv6 host validation', () => {
    test('Valid full (uncompressed) IPv6 address', () => {
        expect(id.isUri('https://[2001:0db8:85a3:0000:0000:8a2e:0370:7334]')).to.equal(true);
    });

    test('Valid full IPv6 address (no zero compression)', () => {
        expect(id.isUri('https://[2001:db8:85a3:0:0:8a2e:370:7334]')).to.equal(true);
    });

    test('Valid IPv6 address with zero compression (::)', () => {
        expect(id.isUri('https://[2001:db8:85a3::8a2e:370:7334]')).to.equal(true);
    });

    test('Valid loopback IPv6 address (::1)', () => {
        expect(id.isUri('https://[::1]')).to.equal(true);
    });

    test('Valid unspecified IPv6 address (::)', () => {
        expect(id.isUri('https://[::]')).to.equal(true);
    });

    test('Valid compressed IPv6 address (trailing compression)', () => {
        expect(id.isUri('https://[2001:db8::]')).to.equal(true);
    });

    test('Valid IPv6 with embedded IPv4 (IPv4-mapped)', () => {
        expect(id.isUri('https://[::ffff:192.168.1.1]')).to.equal(true);
    });

    test('Valid IPv6 with embedded IPv4 (mixed notation)', () => {
        expect(id.isUri('https://[2001:db8::192.168.1.1]')).to.equal(true);
    });

    test('Valid link-local IPv6 address', () => {
        expect(id.isUri('https://[fe80::1]')).to.equal(true);
    });

    test('Valid maximum-length IPv6 address', () => {
        expect(id.isUri('https://[ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff]')).to.equal(true);
    });

    test('Invalid IPv6 – excessive colon sequence', () => {
        expect(() => id.isUri('https://[2001:db8:85a3:::8a2e:370:7334]')).to.throw(Error, 'Invalid URI: https://[2001:db8:85a3:::8a2e:370:7334]');
    });

    test('Invalid IPv6 – multiple zero compressions (::)', () => {
        expect(() => id.isUri('https://[2001:db8:85a3::8a2e::7334]')).to.throw(Error, 'Invalid URI: https://[2001:db8:85a3::8a2e::7334]');
    });

    test('Invalid IPv6 – segment exceeds 16-bit limit', () => {
        expect(() => id.isUri('https://[12345::]')).to.throw(Error, 'Invalid URI: https://[12345::]');
    });

    test('Invalid IPv6 – insufficient segments without compression', () => {
        expect(() => id.isUri('https://[2001:db8:85a3:8a2e:370:7334]')).to.throw(Error, 'Invalid URI: https://[2001:db8:85a3:8a2e:370:7334]');
    });

    test('Invalid IPv6 – too many segments', () => {
        expect(() => id.isUri('https://[2001:db8:85a3:0000:0000:8a2e:0370:7334:1234]')).to.throw(Error, 'Invalid URI: https://[2001:db8:85a3:0000:0000:8a2e:0370:7334:1234]');
    });

    test('Invalid IPv6 – embedded IPv4 out of range', () => {
        expect(() => id.isUri('https://[::ffff:999.168.1.1]')).to.throw(Error, 'Invalid URI: https://[::ffff:999.168.1.1]');
    });

    test('Invalid IPv6 – non-hexadecimal character in segment', () => {
        expect(() => id.isUri('https://[2001:db8::g1]')).to.throw(Error, 'Invalid URI: https://[2001:db8::g1]');
    });

    test('Invalid IPv6 – leading colon without compression', () => {
        expect(() => id.isUri('https://[:2001:db8::1]')).to.throw(Error, 'Invalid URI: https://[:2001:db8::1]');
    });

    test('Invalid IPv6 – trailing colon without compression', () => {
        expect(() => id.isUri('https://[2001:db8::1:]')).to.throw(Error, 'Invalid URI: https://[2001:db8::1:]');
    });

    test('Invalid IPv6 – empty address literal', () => {
        expect(() => id.isUri('https://[]')).to.throw(Error, 'Invalid URI: https://[]');
    });

    test('Invalid IPv6 – address literal with missing opening bracket', () => {
        expect(() => id.isUri('https://::1]')).to.throw(Error, 'Invalid URI: https://::1]');
    });

    test('Invalid IPv6 – address literal with missing closing bracket', () => {
        expect(() => id.isUri('https://[::1')).to.throw(Error, 'Invalid URI: https://[::1');
    });
});

describe('isIri – IPv6 host validation', () => {
    test('Valid full (uncompressed) IPv6 address', () => {
        expect(id.isIri('https://[2001:0db8:85a3:0000:0000:8a2e:0370:7334]')).to.equal(true);
    });

    test('Valid full IPv6 address (no zero compression)', () => {
        expect(id.isIri('https://[2001:db8:85a3:0:0:8a2e:370:7334]')).to.equal(true);
    });

    test('Valid IPv6 address with zero compression (::)', () => {
        expect(id.isIri('https://[2001:db8:85a3::8a2e:370:7334]')).to.equal(true);
    });

    test('Valid loopback IPv6 address (::1)', () => {
        expect(id.isIri('https://[::1]')).to.equal(true);
    });

    test('Valid unspecified IPv6 address (::)', () => {
        expect(id.isIri('https://[::]')).to.equal(true);
    });

    test('Valid compressed IPv6 address (trailing compression)', () => {
        expect(id.isIri('https://[2001:db8::]')).to.equal(true);
    });

    test('Valid IPv6 with embedded IPv4 (IPv4-mapped)', () => {
        expect(id.isIri('https://[::ffff:192.168.1.1]')).to.equal(true);
    });

    test('Valid IPv6 with embedded IPv4 (mixed notation)', () => {
        expect(id.isIri('https://[2001:db8::192.168.1.1]')).to.equal(true);
    });

    test('Valid link-local IPv6 address', () => {
        expect(id.isIri('https://[fe80::1]')).to.equal(true);
    });

    test('Valid maximum-length IPv6 address', () => {
        expect(id.isIri('https://[ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff]')).to.equal(true);
    });

    test('Invalid IPv6 – excessive colon sequence', () => {
        expect(() => id.isIri('https://[2001:db8:85a3:::8a2e:370:7334]')).to.throw(Error, 'Invalid IRI: https://[2001:db8:85a3:::8a2e:370:7334]');
    });

    test('Invalid IPv6 – multiple zero compressions (::)', () => {
        expect(() => id.isIri('https://[2001:db8:85a3::8a2e::7334]')).to.throw(Error, 'Invalid IRI: https://[2001:db8:85a3::8a2e::7334]');
    });

    test('Invalid IPv6 – segment exceeds 16-bit limit', () => {
        expect(() => id.isIri('https://[12345::]')).to.throw(Error, 'Invalid IRI: https://[12345::]');
    });

    test('Invalid IPv6 – insufficient segments without compression', () => {
        expect(() => id.isIri('https://[2001:db8:85a3:8a2e:370:7334]')).to.throw(Error, 'Invalid IRI: https://[2001:db8:85a3:8a2e:370:7334]');
    });

    test('Invalid IPv6 – too many segments', () => {
        expect(() => id.isIri('https://[2001:db8:85a3:0000:0000:8a2e:0370:7334:1234]')).to.throw(Error, 'Invalid IRI: https://[2001:db8:85a3:0000:0000:8a2e:0370:7334:1234]');
    });

    test('Invalid IPv6 – embedded IPv4 out of range', () => {
        expect(() => id.isIri('https://[::ffff:999.168.1.1]')).to.throw(Error, 'Invalid IRI: https://[::ffff:999.168.1.1]');
    });

    test('Invalid IPv6 – non-hexadecimal character in segment', () => {
        expect(() => id.isIri('https://[2001:db8::g1]')).to.throw(Error, 'Invalid IRI: https://[2001:db8::g1]');
    });

    test('Invalid IPv6 – leading colon without compression', () => {
        expect(() => id.isIri('https://[:2001:db8::1]')).to.throw(Error, 'Invalid IRI: https://[:2001:db8::1]');
    });

    test('Invalid IPv6 – trailing colon without compression', () => {
        expect(() => id.isIri('https://[2001:db8::1:]')).to.throw(Error, 'Invalid IRI: https://[2001:db8::1:]');
    });

    test('Invalid IPv6 – empty address literal', () => {
        expect(() => id.isIri('https://[]')).to.throw(Error, 'Invalid IRI: https://[]');
    });

    test('Invalid IPv6 – address literal with missing opening bracket', () => {
        expect(() => id.isIri('https://::1]')).to.throw(Error, 'Invalid IRI: https://::1]');
    });

    test('Invalid IPv6 – address literal with missing closing bracket', () => {
        expect(() => id.isIri('https://[::1')).to.throw(Error, 'Invalid IRI: https://[::1');
    });
});

describe('isUri – port validation', () => {
    test('Valid port', () => {
        expect(id.isUri('https://example.com:80')).to.equal(true);
    });

    test('Valid port zero', () => {
        expect(id.isUri('https://example.com:0')).to.equal(true);
    });

    test('Valid port at max edge', () => {
        expect(id.isUri('https://example.com:65535')).to.equal(true);
    });

    test('Valid port empty', () => {
        expect(id.isUri('https://example.com:/')).to.equal(true);
    });

    test('Invalid "space" port', () => {
        expect(() => id.isUri('https://example.com: /')).to.throw(Error, 'Invalid URI: https://example.com: /');
    });

    test('Invalid "space" before port', () => {
        expect(() => id.isUri('https://example.com: 80/')).to.throw(Error, 'Invalid URI: https://example.com: 80/');
    });

    test('Invalid "space" after port', () => {
        expect(() => id.isUri('https://example.com:80 /')).to.throw(Error, 'Invalid URI: https://example.com:80 /');
    });

    test('Invalid port char', () => {
        expect(() => id.isUri('https://example.com:ff')).to.throw(Error, 'Invalid URI: https://example.com:ff');
    });

    test('Invalid port beyond edge', () => {
        expect(() => id.isUri('https://example.com:65536')).to.throw(Error, 'Invalid URI: https://example.com:65536');
    });
});

describe('isIri – port validation', () => {
    test('Valid port', () => {
        expect(id.isIri('https://example.com:80')).to.equal(true);
    });

    test('Valid port zero', () => {
        expect(id.isIri('https://example.com:0')).to.equal(true);
    });

    test('Valid port at max edge', () => {
        expect(id.isIri('https://example.com:65535')).to.equal(true);
    });

    test('Valid port empty', () => {
        expect(id.isIri('https://example.com:/')).to.equal(true);
    });

    test('Invalid "space" port', () => {
        expect(() => id.isIri('https://example.com: /')).to.throw(Error, 'Invalid IRI: https://example.com: /');
    });

    test('Invalid "space" before port', () => {
        expect(() => id.isIri('https://example.com: 80/')).to.throw(Error, 'Invalid IRI: https://example.com: 80/');
    });

    test('Invalid "space" after port', () => {
        expect(() => id.isIri('https://example.com:80 /')).to.throw(Error, 'Invalid IRI: https://example.com:80 /');
    });

    test('Invalid port char', () => {
        expect(() => id.isIri('https://example.com:ff')).to.throw(Error, 'Invalid IRI: https://example.com:ff');
    });

    test('Invalid port beyond edge', () => {
        expect(() => id.isIri('https://example.com:65536')).to.throw(Error, 'Invalid IRI: https://example.com:65536');
    });
});
