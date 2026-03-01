import { describe, expect, test } from 'vitest';
import id from '../index.js';
// not yet done
const resolveTests = [
    ['', 'hTTp://example.com/b/c/d/e', 'http://example.com/b/c/d/e'], // scheme to lowercase
    ['', 'http://eXaMpLe.com/b/c/d/e', 'http://example.com/b/c/d/e'], // authority to lowercase
    ['', 'http://example.com/b%2Ec/d/e', 'http://example.com/b.c/d/e'], // Unnecessary encoding segment
    ['', 'http://example.com/b%2Fc/d/e', 'http://example.com/b%2Fc/d/e'], // Necessary encoding segment
    ['', 'http://example.com/b%2fc/d/e', 'http://example.com/b%2Fc/d/e'], // Case normalization of encoding segment
    ['', 'http://example.com/b?c%2Fd%3Fe', 'http://example.com/b?c/d?e'], // Unnecessary encoding query
    ['#c%2Fd%3Fe', 'http://example.com/b', 'http://example.com/b#c/d?e'], // Unnecessary encoding fragment
];

describe('resolveReference', () => {
    resolveTests.forEach(([reference, base, expected]) => {
        test(`resolveReference('${reference}', '${base}') === '${expected}'`, () => {
            const subject = id.normalizeReference(reference, base);
            expect(subject).to.equal(expected);
        });
    });
});
