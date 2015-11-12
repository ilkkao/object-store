'use strict';

const expect = require('chai').expect,
      Redis = require('ioredis'),
      ObjectStore = require('../index');

let redisClient = new Redis({
    db: 15
});

let store;
let id;

describe('Find', function() {
    beforeEach(function() {
        return redisClient.flushdb().then(function() {
            store = new ObjectStore('foo', {
                car: {
                    definition: {
                        color: 'string',
                        mileage: 'int',
                        convertible: 'boolean',
                        purchaseDate: 'date'
                    },
                    indices: [{
                        uniq: true,
                        fields: [ 'purchaseDate', 'color' ]
                    }, {
                        uniq: false,
                        fields: [ 'color', 'mileage', 'convertible' ]
                    }]
                }
            }, {
                db: 15
            });

            return store.create('car', {
                color: 'blue',
                mileage: 12345,
                convertible: true,
                purchaseDate: new Date('Sun Nov 01 2015 17:41:24 GMT+0100 (CET)')
            });
        }).then(function(result) {
            return store.create('car', {
                color: 'blue',
                mileage: 12345,
                convertible: true,
                purchaseDate: new Date('Sun Nov 01 2015 22:41:24 GMT+0100 (CET)')
            });
        });
    });

    it('Fails if no index', function() {
        return store.find('car', {
            color: 'red'
        }).then(function(result) {
            expect(result).to.deep.equal({
                err: 'E_INDEX',
                command: 'FIND',
                val: false
            });
        });
    });

    it('Fails if index is not unique', function() {
        return store.find('car', {
            color: 'blue',
            mileage: 4242,
            convertible: true
        }).then(function(result) {
            expect(result).to.deep.equal({
                err: 'E_INDEX',
                command: 'FIND',
                val: false
            });
        });
    });

    it('Return empty array', function() {
        return store.find('car', {
            color: 'gold',
            purchaseDate: new Date('Sun Nov 01 2015 17:41:24 GMT+0100 (CET)')
        }).then(function(result) {
            expect(result).to.deep.equal({
                val: false
            });
        });
    });

    it('Succeeds', function() {
        return store.find('car', {
            color: 'blue',
            purchaseDate: new Date('Sun Nov 01 2015 17:41:24 GMT+0100 (CET)')
        }).then(function(result) {
            expect(result).to.deep.equal({
                val: 1
            });
        });
    });
});
