import { describe, expect, test } from 'vitest';
import id from '../index.js';

describe('isUri with hostnames', () => {
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
});

describe('isIri with hostnames', () => {
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
});
