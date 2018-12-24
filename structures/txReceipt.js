const typeforce = require('typeforce');
const types = require('../types');

module.exports = (factory, {txReceiptProto}) =>

    /**
     * Used for serialization in storage & MsgGetBlocks
     */
    class TxReceipt {

        /**
         *
         * @param {Array | Buffer} data
         */
        constructor(data) {
            typeforce(typeforce.oneOf('Object', 'Buffer'), data);

            if (Buffer.isBuffer(data)) {
                this._data = txReceiptProto.decode(data);
            } else {
                this._data = txReceiptProto.create(data);
            }
        }

        /**
         *
         * @return {String}
         */
        getContractAddress() {
            return this._data.contractAddress;
        }

        /**
         *
         * @return {Number}
         */
        getCoinsUsed() {
            return this._data.coinsUsed;
        }

        /**
         *
         * @return {Number}
         */
        getStatus() {
            return this._data.status;
        }

        /**
         *
         * @return {Buffer}
         */
        encode() {
            return txReceiptProto.encode(this._data).finish();
        }

        equals(receipt) {
            return this.encode().equals(receipt.encode());
        }
    };