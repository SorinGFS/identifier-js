import { describe, expect, test } from 'vitest';
import id from '../index.js';

describe('toAbsoluteReference', () => {
    test('Base with a fragment', () => {
        expect(id.toAbsoluteReference('http://examplé.org/rosé#dasd')).to.equal('http://examplé.org/rosé');
    });

    test('Scheme is required', () => {
        expect(() => id.toAbsoluteReference('//example.com/foo?bar#baz')).to.throw(Error, 'Invalid IRI: //example.com/foo?bar#baz');
    });
});
