import { describe, expect, test } from 'vitest';
import id from '../index.js';

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
});
