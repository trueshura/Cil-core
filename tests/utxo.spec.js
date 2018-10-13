'use strict';

const {describe, it} = require('mocha');
const {assert} = require('chai');
const sinon = require('sinon').createSandbox();

const factory = require('./testFactory');
const {arrayEquals} = require('../utils');
const {pseudoRandomBuffer} = require('./testUtil');

describe('PatchDB', () => {
    before(async function() {
        this.timeout(15000);
        await factory.asyncLoad();
    });

    after(async function() {
        this.timeout(15000);
    });

    it('should NOT create instance', async () => {
        assert.throws(() => new factory.UTXO());
    });

    it('should create instance', async () => {
        const txHash = pseudoRandomBuffer().toString('hex');
        new factory.UTXO({txHash});
    });

    it('should add/get coins', async () => {
        const txHash = pseudoRandomBuffer().toString('hex');
        const utxo = new factory.UTXO({txHash});
        const coins = new factory.Coins(10, Buffer.allocUnsafe(100));

        utxo.addCoins(12, coins);
        const coins2 = utxo.coinsAtIndex(12);
        assert.isOk(coins2);
        assert.isOk(coins.getAmount(), coins2.getAmount());
    });

    it('should NOT get coins (wrong index)', async () => {
        const txHash = pseudoRandomBuffer().toString('hex');
        const utxo = new factory.UTXO({txHash});
        const coins = new factory.Coins(10, Buffer.allocUnsafe(100));

        utxo.addCoins(10, coins);
        assert.throws(() => utxo.coinsAtIndex(12));
    });

    it('should NOT add coins (same idx)', async () => {
        const txHash = pseudoRandomBuffer().toString('hex');
        const utxo = new factory.UTXO({txHash});
        const coins = new factory.Coins(10, Buffer.allocUnsafe(100));

        utxo.addCoins(12, coins);
        assert.throws(() => utxo.addCoins(12, coins));
    });

    it('should add 3 coins', async () => {
        const txHash = pseudoRandomBuffer().toString('hex');
        const utxo = new factory.UTXO({txHash});
        const coins = new factory.Coins(10, Buffer.allocUnsafe(100));

        utxo.addCoins(12, coins);
        utxo.addCoins(0, coins);
        utxo.addCoins(431, coins);

        assert.isOk(utxo.coinsAtIndex(12));
        assert.isOk(utxo.coinsAtIndex(431));
        assert.isOk(utxo.coinsAtIndex(0));
    });

    it('should remove 2 coins', async () => {
        const txHash = pseudoRandomBuffer().toString('hex');
        const utxo = new factory.UTXO({txHash});
        const coins = new factory.Coins(10, Buffer.allocUnsafe(100));

        utxo.addCoins(12, coins);
        utxo.addCoins(0, coins);
        utxo.addCoins(431, coins);

        utxo.spendCoins(0);

        assert.isOk(utxo.coinsAtIndex(12));
        assert.isOk(utxo.coinsAtIndex(431));
        assert.isNotOk(utxo.isEmpty());
        assert.throws(() => utxo.coinsAtIndex(0));

        utxo.spendCoins(431);

        assert.isOk(utxo.coinsAtIndex(12));
        assert.isNotOk(utxo.isEmpty());
        assert.throws(() => utxo.coinsAtIndex(0));
        assert.throws(() => utxo.coinsAtIndex(431));

        utxo.spendCoins(12);
        assert.isOk(utxo.isEmpty());
    });

    it('should encode/decode', async () => {
        const txHash = pseudoRandomBuffer().toString('hex');
        const utxo = new factory.UTXO({txHash});
        const coins = new factory.Coins(10, Buffer.allocUnsafe(100));

        utxo.addCoins(12, coins);
        utxo.addCoins(431, coins);

        const buffData = utxo.encode();
        assert.isOk(buffData.length);

        const restoredUtxo = new factory.UTXO({txHash, data: buffData});
        assert.isNotOk(restoredUtxo.isEmpty());
        assert.isOk(restoredUtxo.coinsAtIndex(12));
        assert.isOk(restoredUtxo.coinsAtIndex(431));
        assert.throws(() => restoredUtxo.coinsAtIndex(0));
    });

    it('should get indexes', async () => {
        const txHash = pseudoRandomBuffer().toString('hex');
        const utxo = new factory.UTXO({txHash});
        const coins = new factory.Coins(10, Buffer.allocUnsafe(100));

        utxo.addCoins(12, coins);
        utxo.addCoins(431, coins);

        assert.isOk(Array.isArray(utxo.getIndexes()));
        assert.isOk(arrayEquals(utxo.getIndexes(), [12, 431]));
    });

    it('should clone UTXO', async () => {
        const txHash = pseudoRandomBuffer().toString('hex');
        const utxo = new factory.UTXO({txHash});
        const coins = new factory.Coins(10, Buffer.allocUnsafe(100));

        utxo.addCoins(12, coins);
        utxo.addCoins(0, coins);
        utxo.addCoins(431, coins);

        const clone = utxo.clone();

        // spend coins in original
        utxo.spendCoins(0);
        assert.isOk(arrayEquals(utxo.getIndexes(), [12, 431]));

        // it shouldn't affect copy
        assert.isOk(arrayEquals(clone.getIndexes(), [12, 0, 431]));
        assert.isOk(clone.coinsAtIndex(0));

    });

});
