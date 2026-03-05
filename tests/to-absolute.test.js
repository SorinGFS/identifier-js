import { describe, expect, test } from 'vitest';
import id from '../index.js';

describe('toAbsoluteReference', () => {
    test('Base with a fragment', () => {
        expect(id.toAbsoluteReference('http://examplé.org/rosé#dasd')).to.equal('http://examplé.org/rosé');
    });

    test('Base with empty path', () => {
        expect(id.toAbsoluteReference('http://examplé.org')).to.equal('http://examplé.org');
    });

    test('Base witout authority', () => {
        expect(id.toAbsoluteReference('http:/foo?bar#baz')).to.equal('http:/foo?bar');
    });

    test('Base witout authority and empty path', () => {
        expect(id.toAbsoluteReference('http:?bar#baz')).to.equal('http:?bar');
    });

    test('Base witout authority or query and empty path', () => {
        expect(id.toAbsoluteReference('http:#baz')).to.equal('http:');
    });

    test('Scheme is required', () => {
        expect(() => id.toAbsoluteReference('//example.com/foo?bar#baz')).to.throw(Error, 'Invalid IRI: //example.com/foo?bar#baz');
    });
});
