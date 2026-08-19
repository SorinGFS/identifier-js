import { describe, expect, test } from 'vitest';
import id from '../index.js';

// Verify reference resolution behavior beyond the RFC's published examples.
const resolveTests = [
    ['urn:some:ip:prop', 'urn:some:ip:prop', 'urn:some:ip:prop'],
    ['urn:some:ip:prop', 'urn:some:other:prop', 'urn:some:ip:prop'],
];

describe('resolveReference', () => {
    resolveTests.forEach(([reference, base, expected]) => {
        test(`resolveReference('${reference}', '${base}') === '${expected}'`, () => {
            const subject = id.resolveReference(reference, base);
            expect(subject).to.equal(expected);
        });
    });

    // Preserve an explicitly empty query while replacing the base query.
    test('Preserves an empty query component', () => {
        expect(id.resolveReference('?', 'https://example.com/path?old#fragment')).to.equal('https://example.com/path?');
    });

    // Preserve an explicitly empty fragment after inheriting the base query.
    test('Preserves an empty fragment component', () => {
        expect(id.resolveReference('#', 'https://example.com/path?query#old')).to.equal('https://example.com/path?query#');
    });

    // Preserve an empty query inherited by an empty reference.
    test('Preserves an inherited empty query component', () => {
        expect(id.resolveReference('', 'https://example.com/path?#fragment')).to.equal('https://example.com/path?');
    });

    // Preserve the delimiter that distinguishes an empty authority from no authority.
    test('Preserves an empty authority component', () => {
        expect(id.resolveReference('uri:///target', 'uri:/base')).to.equal('uri:///target');
    });
});
