import { describe, expect, test } from 'vitest';
import id from '../index.js';

const resolveTests = [
    // ['', 'urn:some:ip:prop', 'urn:some:ip:prop'], // invalid base (resolveReference throw)
    // ['#', 'urn:some:ip:prop', 'urn:some:ip:prop'], // invalid base (resolveReference throw)
    ['urn:some:ip:prop', 'urn:some:ip:prop', 'urn:some:ip:prop'],
    ['urn:some:other:prop', 'urn:some:ip:prop', 'urn:some:ip:prop'],
    ['hTTp://example.com/b/c/d/e', '', 'http://example.com/b/c/d/e'], // scheme to lowercase
    ['http://eXaMpLe.com/b/c/d/e', '', 'http://example.com/b/c/d/e'], // authority to lowercase
    ['http://example.com/b%2Ec/d/e', '', 'http://example.com/b.c/d/e'], // Unnecessary encoding segment
    ['http://example.com/b%2Fc/d/e', '', 'http://example.com/b%2Fc/d/e'], // Necessary encoding segment
    ['http://example.com/b%2fc/d/e', '', 'http://example.com/b%2Fc/d/e'], // Case normalization of encoding segment
    ['http://example.com/b?c%2Fd%3Fe', '', 'http://example.com/b?c/d?e'], // Unnecessary encoding query
    ['http://example.com/b', '#c%2Fd%3Fe', 'http://example.com/b#c/d?e'], // Unnecessary encoding fragment
];

describe('resolveReference', () => {
    resolveTests.forEach(([baseIri, iriReference, expected]) => {
        test(`resolveReference('${iriReference}', '${baseIri}') === '${expected}'`, () => {
            const subject = id.resolveReference(iriReference, baseIri);
            expect(subject).to.equal(expected);
        });
    });
});
