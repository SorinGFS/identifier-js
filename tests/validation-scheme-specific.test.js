import { describe, expect, test } from 'vitest';
import id from '../index.js';

describe('isUri with hostnames', () => {
    test('Valid character ! (sub-delims) in uri reg_name', () => {
        expect(id.isUri('uri://exa!mple')).to.equal(true);
    });

    test('Valid character & (sub-delims) in uri reg_name', () => {
        expect(id.isUri('uri://exa&mple')).to.equal(true);
    });

    test('Valid character $ (sub-delims) in uri reg_name', () => {
        expect(id.isUri('uri://exa$mple')).to.equal(true);
    });

    test("Valid character ' (sub-delims) in uri reg_name", () => {
        expect(id.isUri("uri://exa'mple")).to.equal(true);
    });

    test('Valid character ( (sub-delims) in uri reg_name', () => {
        expect(id.isUri('uri://exa(mple')).to.equal(true);
    });

    test('Valid character ) (sub-delims) in uri reg_name', () => {
        expect(id.isUri('uri://exa)mple')).to.equal(true);
    });

    test('Valid character * (sub-delims) in uri reg_name', () => {
        expect(id.isUri('uri://exa*mple')).to.equal(true);
    });

    test('Valid character + (sub-delims) in uri reg_name', () => {
        expect(id.isUri('uri://exa+mple')).to.equal(true);
    });

    test('Valid character , (sub-delims) in uri reg_name', () => {
        expect(id.isUri('uri://exa,mple')).to.equal(true);
    });

    test('Valid character ; (sub-delims) in uri reg_name', () => {
        expect(id.isUri('uri://exa;mple')).to.equal(true);
    });

    test('Valid character = (sub-delims) in uri reg_name', () => {
        expect(id.isUri('uri://exa=mple')).to.equal(true);
    });

    test('Valid character . multiple times (unreserved) in uri reg_name', () => {
        expect(id.isUri('uri://exa..mple')).to.equal(true);
    });

    test('Valid character ~ (unreserved) in uri reg_name', () => {
        expect(id.isUri('uri://exa~mple')).to.equal(true);
    });

    test('Valid character _ (unreserved) in uri reg_name', () => {
        expect(id.isUri('uri://exa_mple')).to.equal(true);
    });

    test('Valid character %20 (pct-encoded) in uri reg_name', () => {
        expect(id.isUri('uri://exa%20mple')).to.equal(true);
    });

    test('Invalid %GG (pct-encoded) in uri reg_name', () => {
        expect(() => id.isUri('uri://exa%GGmple')).to.throw(Error, 'Invalid URI: uri://exa%GGmple');
    });

    test('Valid label - alphanumeric', () => {
        expect(id.isUri('https://example')).to.equal(true);
    });

    test('Valid label - hyphen in middle', () => {
        expect(id.isUri('https://exa-mple')).to.equal(true);
    });

    test('Invalid label - hyphen at start', () => {
        expect(() => id.isUri('https://-example')).to.throw(Error, 'Invalid URI: https://-example');
    });

    test('Invalid label - hyphen at end', () => {
        expect(() => id.isUri('https://example-')).to.throw(Error, 'Invalid URI: https://example-');
    });

    test('Valid multiple labels', () => {
        expect(id.isUri('https://example-domain.com')).to.equal(true);
    });

    test('Invalid - leading dot', () => {
        expect(() => id.isUri('https://.example.com')).to.throw(Error, 'Invalid URI: https://.example.com');
    });

    test('Invalid - trailing dot', () => {
        expect(() => id.isUri('https://example.com.')).to.throw(Error, 'Invalid URI: https://example.com.');
    });

    test('Invalid - consecutive dots', () => {
        expect(() => id.isUri('https://example..com')).to.throw(Error, 'Invalid URI: https://example..com');
    });

    test('Invalid - unicode character', () => {
        expect(() => id.isUri('https://exämple')).to.throw(Error, 'Invalid URI: https://exämple');
    });

    test('Invalid - % character (pct_encoded) in http(s) reg_name', () => {
        expect(() => id.isUri('https://exa%20mple')).to.throw(Error, 'Invalid URI: https://exa%20mple');
    });

    test('Invalid - % character (pct_encoded) in ws(s) reg_name', () => {
        expect(() => id.isUri('wss://exa%20mple')).to.throw(Error, 'Invalid URI: wss://exa%20mple');
    });

    test('Invalid - % character (pct_encoded) in file reg_name', () => {
        expect(() => id.isUri('file://exa%20mple')).to.throw(Error, 'Invalid URI: file://exa%20mple');
    });

    test('Invalid - ~ character (unreserved) in http(s) reg_name', () => {
        expect(() => id.isUri('https://exa~mple')).to.throw(Error, 'Invalid URI: https://exa~mple');
    });

    test('Invalid - ~ character (unreserved) in ws(s) reg_name', () => {
        expect(() => id.isUri('wss://exa~mple')).to.throw(Error, 'Invalid URI: wss://exa~mple');
    });

    test('Invalid - ~ character (unreserved) in file reg_name', () => {
        expect(() => id.isUri('file://exa~mple')).to.throw(Error, 'Invalid URI: file://exa~mple');
    });

    test('Invalid - _ character (unreserved) in http(s) reg_name', () => {
        expect(() => id.isUri('https://exa_mple')).to.throw(Error, 'Invalid URI: https://exa_mple');
    });

    test('Invalid - _ character (unreserved) in ws(s) reg_name', () => {
        expect(() => id.isUri('wss://exa_mple')).to.throw(Error, 'Invalid URI: wss://exa_mple');
    });

    test('Invalid - _ character (unreserved) in file reg_name', () => {
        expect(() => id.isUri('file://exa_mple')).to.throw(Error, 'Invalid URI: file://exa_mple');
    });

    test('Invalid - ! character (sub-delims) in http(s) reg_name', () => {
        expect(() => id.isUri('https://exa!mple')).to.throw(Error, 'Invalid URI: https://exa!mple');
    });

    test('Invalid - ! character (sub-delims) in ws(s) reg_name', () => {
        expect(() => id.isUri('wss://exa!mple')).to.throw(Error, 'Invalid URI: wss://exa!mple');
    });

    test('Invalid - ! character (sub-delims) in file reg_name', () => {
        expect(() => id.isUri('file://exa!mple')).to.throw(Error, 'Invalid URI: file://exa!mple');
    });

    test('Invalid - & character (sub-delims) in http(s) reg_name', () => {
        expect(() => id.isUri('https://exa&mple')).to.throw(Error, 'Invalid URI: https://exa&mple');
    });

    test('Invalid - & character (sub-delims) in ws(s) reg_name', () => {
        expect(() => id.isUri('wss://exa&mple')).to.throw(Error, 'Invalid URI: wss://exa&mple');
    });

    test('Invalid - & character (sub-delims) in file reg_name', () => {
        expect(() => id.isUri('file://exa&mple')).to.throw(Error, 'Invalid URI: file://exa&mple');
    });

    test('Invalid - $ character (sub-delims) in http(s) reg_name', () => {
        expect(() => id.isUri('https://exa$mple')).to.throw(Error, 'Invalid URI: https://exa$mple');
    });

    test('Invalid - $ character (sub-delims) in ws(s) reg_name', () => {
        expect(() => id.isUri('wss://exa$mple')).to.throw(Error, 'Invalid URI: wss://exa$mple');
    });

    test('Invalid - $ character (sub-delims) in file reg_name', () => {
        expect(() => id.isUri('file://exa$mple')).to.throw(Error, 'Invalid URI: file://exa$mple');
    });

    test("Invalid - ' character (sub-delims) in http(s) reg_name", () => {
        expect(() => id.isUri("https://exa'mple")).to.throw(Error, "Invalid URI: https://exa'mple");
    });

    test("Invalid - ' character (sub-delims) in ws(s) reg_name", () => {
        expect(() => id.isUri("wss://exa'mple")).to.throw(Error, "Invalid URI: wss://exa'mple");
    });

    test("Invalid - ' character (sub-delims) in file reg_name", () => {
        expect(() => id.isUri("file://exa'mple")).to.throw(Error, "Invalid URI: file://exa'mple");
    });

    test('Invalid - ( character (sub-delims) in http(s) reg_name', () => {
        expect(() => id.isUri('https://exa(mple')).to.throw(Error, 'Invalid URI: https://exa(mple');
    });

    test('Invalid - ( character (sub-delims) in ws(s) reg_name', () => {
        expect(() => id.isUri('wss://exa(mple')).to.throw(Error, 'Invalid URI: wss://exa(mple');
    });

    test('Invalid - ( character (sub-delims) in file reg_name', () => {
        expect(() => id.isUri('file://exa(mple')).to.throw(Error, 'Invalid URI: file://exa(mple');
    });

    test('Invalid - ) character (sub-delims) in http(s) reg_name', () => {
        expect(() => id.isUri('https://exa)mple')).to.throw(Error, 'Invalid URI: https://exa)mple');
    });

    test('Invalid - ) character (sub-delims) in ws(s) reg_name', () => {
        expect(() => id.isUri('wss://exa)mple')).to.throw(Error, 'Invalid URI: wss://exa)mple');
    });

    test('Invalid - ) character (sub-delims) in file reg_name', () => {
        expect(() => id.isUri('file://exa)mple')).to.throw(Error, 'Invalid URI: file://exa)mple');
    });

    test('Invalid - * character (sub-delims) in http(s) reg_name', () => {
        expect(() => id.isUri('https://exa*mple')).to.throw(Error, 'Invalid URI: https://exa*mple');
    });

    test('Invalid - * character (sub-delims) in ws(s) reg_name', () => {
        expect(() => id.isUri('wss://exa*mple')).to.throw(Error, 'Invalid URI: wss://exa*mple');
    });

    test('Invalid - * character (sub-delims) in file reg_name', () => {
        expect(() => id.isUri('file://exa*mple')).to.throw(Error, 'Invalid URI: file://exa*mple');
    });

    test('Invalid - + character (sub-delims) in http(s) reg_name', () => {
        expect(() => id.isUri('https://exa+mple')).to.throw(Error, 'Invalid URI: https://exa+mple');
    });

    test('Invalid - + character (sub-delims) in ws(s) reg_name', () => {
        expect(() => id.isUri('wss://exa+mple')).to.throw(Error, 'Invalid URI: wss://exa+mple');
    });

    test('Invalid - + character (sub-delims) in file reg_name', () => {
        expect(() => id.isUri('file://exa+mple')).to.throw(Error, 'Invalid URI: file://exa+mple');
    });

    test('Invalid - , character (sub-delims) in http(s) reg_name', () => {
        expect(() => id.isUri('https://exa,mple')).to.throw(Error, 'Invalid URI: https://exa,mple');
    });

    test('Invalid - , character (sub-delims) in ws(s) reg_name', () => {
        expect(() => id.isUri('wss://exa,mple')).to.throw(Error, 'Invalid URI: wss://exa,mple');
    });

    test('Invalid - , character (sub-delims) in file reg_name', () => {
        expect(() => id.isUri('file://exa,mple')).to.throw(Error, 'Invalid URI: file://exa,mple');
    });

    test('Invalid - ; character (sub-delims) in http(s) reg_name', () => {
        expect(() => id.isUri('https://exa;mple')).to.throw(Error, 'Invalid URI: https://exa;mple');
    });

    test('Invalid - ; character (sub-delims) in ws(s) reg_name', () => {
        expect(() => id.isUri('wss://exa;mple')).to.throw(Error, 'Invalid URI: wss://exa;mple');
    });

    test('Invalid - ; character (sub-delims) in file reg_name', () => {
        expect(() => id.isUri('file://exa;mple')).to.throw(Error, 'Invalid URI: file://exa;mple');
    });

    test('Invalid - = character (sub-delims) in http(s) reg_name', () => {
        expect(() => id.isUri('https://exa=mple')).to.throw(Error, 'Invalid URI: https://exa=mple');
    });

    test('Invalid - = character (sub-delims) in ws(s) reg_name', () => {
        expect(() => id.isUri('wss://exa=mple')).to.throw(Error, 'Invalid URI: wss://exa=mple');
    });

    test('Invalid - = character (sub-delims) in file reg_name', () => {
        expect(() => id.isUri('file://exa=mple')).to.throw(Error, 'Invalid URI: file://exa=mple');
    });

    test('Valid case insensitive http scheme', () => {
        expect(id.isUri('httP://example')).to.equal(true);
    });

    test('Valid case insensitive https scheme', () => {
        expect(id.isUri('httPs://example')).to.equal(true);
    });

    test('Valid case insensitive ws scheme', () => {
        expect(id.isUri('WS://example')).to.equal(true);
    });

    test('Valid case insensitive wss scheme', () => {
        expect(id.isUri('WSs://example')).to.equal(true);
    });

    test('Valid case insensitive file scheme', () => {
        expect(id.isUri('fILE://example')).to.equal(true);
    });

});

describe('isIri with hostnames', () => {
    test('Valid character ! (sub-delims) in iri reg_name', () => {
        expect(id.isIri('iri://exa!mple')).to.equal(true);
    });

    test('Valid character & (sub-delims) in iri reg_name', () => {
        expect(id.isIri('iri://exa&mple')).to.equal(true);
    });

    test('Valid character $ (sub-delims) in iri reg_name', () => {
        expect(id.isIri('iri://exa$mple')).to.equal(true);
    });

    test("Valid character ' (sub-delims) in iri reg_name", () => {
        expect(id.isIri("iri://exa'mple")).to.equal(true);
    });

    test('Valid character ( (sub-delims) in iri reg_name', () => {
        expect(id.isIri('iri://exa(mple')).to.equal(true);
    });

    test('Valid character ) (sub-delims) in iri reg_name', () => {
        expect(id.isIri('iri://exa)mple')).to.equal(true);
    });

    test('Valid character * (sub-delims) in iri reg_name', () => {
        expect(id.isIri('iri://exa*mple')).to.equal(true);
    });

    test('Valid character + (sub-delims) in iri reg_name', () => {
        expect(id.isIri('iri://exa+mple')).to.equal(true);
    });

    test('Valid character , (sub-delims) in iri reg_name', () => {
        expect(id.isIri('iri://exa,mple')).to.equal(true);
    });

    test('Valid character ; (sub-delims) in iri reg_name', () => {
        expect(id.isIri('iri://exa;mple')).to.equal(true);
    });

    test('Valid character = (sub-delims) in iri reg_name', () => {
        expect(id.isIri('iri://exa=mple')).to.equal(true);
    });

    test('Valid character . multiple times (unreserved) in iri reg_name', () => {
        expect(id.isIri('iri://exa..mple')).to.equal(true);
    });

    test('Valid character _ (unreserved) in iri reg_name', () => {
        expect(id.isIri('iri://exa_mple')).to.equal(true);
    });

    test('Valid character %20 (pct-encoded) in iri reg_name', () => {
        expect(id.isIri('iri://exa%20mple')).to.equal(true);
    });

    test('Invalid %GG (invalid pct-encoded) in iri reg_name', () => {
        expect(() => id.isIri('iri://exa%GGmple')).to.throw(Error, 'Invalid IRI: iri://exa%GGmple');
    });

    test('Valid label - alphanumeric', () => {
        expect(id.isIri('https://example')).to.equal(true);
    });

    test('Valid label - hyphen in middle', () => {
        expect(id.isIri('https://exa-mple')).to.equal(true);
    });

    test('Invalid label - hyphen at start', () => {
        expect(() => id.isIri('https://-example')).to.throw(Error, 'Invalid IRI: https://-example');
    });

    test('Invalid label - hyphen at end', () => {
        expect(() => id.isIri('https://example-')).to.throw(Error, 'Invalid IRI: https://example-');
    });

    test('Valid unicode label - Latin extended', () => {
        expect(id.isIri('https://exämple')).to.equal(true);
    });

    test('Valid unicode label - Chinese', () => {
        expect(id.isIri('https://例子')).to.equal(true);
    });

    test('Valid unicode label - Hindi', () => {
        expect(id.isIri('https://उदाहरण')).to.equal(true);
    });

    test('Valid unicode label - Japanese', () => {
        expect(id.isIri('https://例え.テスト')).to.equal(true);
    });

    test('Valid label with middle dot', () => {
        expect(id.isIri('https://exa·mple')).to.equal(true);
    });

    test('Invalid - leading dot', () => {
        expect(() => id.isIri('https://.example')).to.throw(Error, 'Invalid IRI: https://.example');
    });

    test('Invalid - trailing dot', () => {
        expect(() => id.isIri('https://example.')).to.throw(Error, 'Invalid IRI: https://example.');
    });

    test('Invalid - consecutive dots', () => {
        expect(() => id.isIri('https://example..test')).to.throw(Error, 'Invalid IRI: https://example..test');
    });

    test('Invalid - emoji in label', () => {
        expect(() => id.isIri('https://example😀')).to.throw(Error, 'Invalid IRI: https://example😀');
    });

    test('Invalid - % character (pct_encoded) in http(s) reg_name', () => {
        expect(() => id.isIri('https://exa%20mple')).to.throw(Error, 'Invalid IRI: https://exa%20mple');
    });

    test('Invalid - % character (pct_encoded) in ws(s) reg_name', () => {
        expect(() => id.isIri('wss://exa%20mple')).to.throw(Error, 'Invalid IRI: wss://exa%20mple');
    });

    test('Invalid - % character (pct_encoded) in file reg_name', () => {
        expect(() => id.isIri('file://exa%20mple')).to.throw(Error, 'Invalid IRI: file://exa%20mple');
    });

    test('Invalid - ~ character (unreserved) in http(s) reg_name', () => {
        expect(() => id.isIri('https://exa~mple')).to.throw(Error, 'Invalid IRI: https://exa~mple');
    });

    test('Invalid - ~ character (unreserved) in ws(s) reg_name', () => {
        expect(() => id.isIri('wss://exa~mple')).to.throw(Error, 'Invalid IRI: wss://exa~mple');
    });

    test('Invalid - ~ character (unreserved) in file reg_name', () => {
        expect(() => id.isIri('file://exa~mple')).to.throw(Error, 'Invalid IRI: file://exa~mple');
    });

    test('Invalid - _ character (unreserved) in http(s) reg_name', () => {
        expect(() => id.isIri('https://exa_mple')).to.throw(Error, 'Invalid IRI: https://exa_mple');
    });

    test('Invalid - _ character (unreserved) in ws(s) reg_name', () => {
        expect(() => id.isIri('wss://exa_mple')).to.throw(Error, 'Invalid IRI: wss://exa_mple');
    });

    test('Invalid - _ character (unreserved) in file reg_name', () => {
        expect(() => id.isIri('file://exa_mple')).to.throw(Error, 'Invalid IRI: file://exa_mple');
    });

    test('Invalid - ! character (sub-delims) in http(s) reg_name', () => {
        expect(() => id.isIri('https://exa!mple')).to.throw(Error, 'Invalid IRI: https://exa!mple');
    });

    test('Invalid - ! character (sub-delims) in ws(s) reg_name', () => {
        expect(() => id.isIri('wss://exa!mple')).to.throw(Error, 'Invalid IRI: wss://exa!mple');
    });

    test('Invalid - ! character (sub-delims) in file reg_name', () => {
        expect(() => id.isIri('file://exa!mple')).to.throw(Error, 'Invalid IRI: file://exa!mple');
    });

    test('Invalid - & character (sub-delims) in http(s) reg_name', () => {
        expect(() => id.isIri('https://exa&mple')).to.throw(Error, 'Invalid IRI: https://exa&mple');
    });

    test('Invalid - & character (sub-delims) in ws(s) reg_name', () => {
        expect(() => id.isIri('wss://exa&mple')).to.throw(Error, 'Invalid IRI: wss://exa&mple');
    });

    test('Invalid - & character (sub-delims) in file reg_name', () => {
        expect(() => id.isIri('file://exa&mple')).to.throw(Error, 'Invalid IRI: file://exa&mple');
    });

    test('Invalid - $ character (sub-delims) in http(s) reg_name', () => {
        expect(() => id.isIri('https://exa$mple')).to.throw(Error, 'Invalid IRI: https://exa$mple');
    });

    test('Invalid - $ character (sub-delims) in ws(s) reg_name', () => {
        expect(() => id.isIri('wss://exa$mple')).to.throw(Error, 'Invalid IRI: wss://exa$mple');
    });

    test('Invalid - $ character (sub-delims) in file reg_name', () => {
        expect(() => id.isIri('file://exa$mple')).to.throw(Error, 'Invalid IRI: file://exa$mple');
    });

    test("Invalid - ' character (sub-delims) in http(s) reg_name", () => {
        expect(() => id.isIri("https://exa'mple")).to.throw(Error, "Invalid IRI: https://exa'mple");
    });

    test("Invalid - ' character (sub-delims) in ws(s) reg_name", () => {
        expect(() => id.isIri("wss://exa'mple")).to.throw(Error, "Invalid IRI: wss://exa'mple");
    });

    test("Invalid - ' character (sub-delims) in file reg_name", () => {
        expect(() => id.isIri("file://exa'mple")).to.throw(Error, "Invalid IRI: file://exa'mple");
    });

    test('Invalid - ( character (sub-delims) in http(s) reg_name', () => {
        expect(() => id.isIri('https://exa(mple')).to.throw(Error, 'Invalid IRI: https://exa(mple');
    });

    test('Invalid - ( character (sub-delims) in ws(s) reg_name', () => {
        expect(() => id.isIri('wss://exa(mple')).to.throw(Error, 'Invalid IRI: wss://exa(mple');
    });

    test('Invalid - ( character (sub-delims) in file reg_name', () => {
        expect(() => id.isIri('file://exa(mple')).to.throw(Error, 'Invalid IRI: file://exa(mple');
    });

    test('Invalid - ) character (sub-delims) in http(s) reg_name', () => {
        expect(() => id.isIri('https://exa)mple')).to.throw(Error, 'Invalid IRI: https://exa)mple');
    });

    test('Invalid - ) character (sub-delims) in ws(s) reg_name', () => {
        expect(() => id.isIri('wss://exa)mple')).to.throw(Error, 'Invalid IRI: wss://exa)mple');
    });

    test('Invalid - ) character (sub-delims) in file reg_name', () => {
        expect(() => id.isIri('file://exa)mple')).to.throw(Error, 'Invalid IRI: file://exa)mple');
    });

    test('Invalid - * character (sub-delims) in http(s) reg_name', () => {
        expect(() => id.isIri('https://exa*mple')).to.throw(Error, 'Invalid IRI: https://exa*mple');
    });

    test('Invalid - * character (sub-delims) in ws(s) reg_name', () => {
        expect(() => id.isIri('wss://exa*mple')).to.throw(Error, 'Invalid IRI: wss://exa*mple');
    });

    test('Invalid - * character (sub-delims) in file reg_name', () => {
        expect(() => id.isIri('file://exa*mple')).to.throw(Error, 'Invalid IRI: file://exa*mple');
    });

    test('Invalid - + character (sub-delims) in http(s) reg_name', () => {
        expect(() => id.isIri('https://exa+mple')).to.throw(Error, 'Invalid IRI: https://exa+mple');
    });

    test('Invalid - + character (sub-delims) in ws(s) reg_name', () => {
        expect(() => id.isIri('wss://exa+mple')).to.throw(Error, 'Invalid IRI: wss://exa+mple');
    });

    test('Invalid - + character (sub-delims) in file reg_name', () => {
        expect(() => id.isIri('file://exa+mple')).to.throw(Error, 'Invalid IRI: file://exa+mple');
    });

    test('Invalid - , character (sub-delims) in http(s) reg_name', () => {
        expect(() => id.isIri('https://exa,mple')).to.throw(Error, 'Invalid IRI: https://exa,mple');
    });

    test('Invalid - , character (sub-delims) in ws(s) reg_name', () => {
        expect(() => id.isIri('wss://exa,mple')).to.throw(Error, 'Invalid IRI: wss://exa,mple');
    });

    test('Invalid - , character (sub-delims) in file reg_name', () => {
        expect(() => id.isIri('file://exa,mple')).to.throw(Error, 'Invalid IRI: file://exa,mple');
    });

    test('Invalid - ; character (sub-delims) in http(s) reg_name', () => {
        expect(() => id.isIri('https://exa;mple')).to.throw(Error, 'Invalid IRI: https://exa;mple');
    });

    test('Invalid - ; character (sub-delims) in ws(s) reg_name', () => {
        expect(() => id.isIri('wss://exa;mple')).to.throw(Error, 'Invalid IRI: wss://exa;mple');
    });

    test('Invalid - ; character (sub-delims) in file reg_name', () => {
        expect(() => id.isIri('file://exa;mple')).to.throw(Error, 'Invalid IRI: file://exa;mple');
    });

    test('Invalid - = character (sub-delims) in http(s) reg_name', () => {
        expect(() => id.isIri('https://exa=mple')).to.throw(Error, 'Invalid IRI: https://exa=mple');
    });

    test('Invalid - = character (sub-delims) in ws(s) reg_name', () => {
        expect(() => id.isIri('wss://exa=mple')).to.throw(Error, 'Invalid IRI: wss://exa=mple');
    });

    test('Invalid - = character (sub-delims) in file reg_name', () => {
        expect(() => id.isIri('file://exa=mple')).to.throw(Error, 'Invalid IRI: file://exa=mple');
    });

    test('Valid case insensitive http scheme', () => {
        expect(id.isIri('httP://example')).to.equal(true);
    });

    test('Valid case insensitive https scheme', () => {
        expect(id.isIri('httPs://example')).to.equal(true);
    });

    test('Valid case insensitive ws scheme', () => {
        expect(id.isIri('WS://example')).to.equal(true);
    });

    test('Valid case insensitive wss scheme', () => {
        expect(id.isIri('WSs://example')).to.equal(true);
    });

    test('Valid case insensitive file scheme', () => {
        expect(id.isIri('fILE://example')).to.equal(true);
    });

});
