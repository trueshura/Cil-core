const typeforce = require('typeforce');
const types = require('../types');

module.exports = () =>
    class Coins {

        constructor(amount, receiverAddr) {
            typeforce(typeforce.tuple(types.Amount, types.Address), arguments);

            this._data = {
                amount,
                receiverAddr
            };
        }

        static createFromData({amount, receiverAddr}) {
            return new this(amount, receiverAddr);
        }

        getAmount() {
            return this._data.amount;
        }

        /**
         *
         * @return {Buffer} address
         */
        getReceiverAddr() {
            return this._data.receiverAddr;
        }

        /**
         *
         * @return {{amount: *, receiverAddr: *}|*}
         */
        getRawData() {
            return this._data;
        }

        /**
         *
         * @param {Coins} coin
         * @returns {boolean|*}
         */
        equals(coin) {
            return this.getAmount() === coin.getAmount() && this.getReceiverAddr().equals(coin.getReceiverAddr());
        }
    };
