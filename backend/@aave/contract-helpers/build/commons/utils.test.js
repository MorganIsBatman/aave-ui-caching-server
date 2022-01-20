"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
describe('Utils', () => {
    describe('getTxValue', () => {
        it('Expects to get amount', () => {
            const txValue = utils_1.getTxValue('0x0123', '123');
            expect(txValue).toEqual(utils_1.DEFAULT_NULL_VALUE_ON_TX);
        });
        it('Expects to get default', () => {
            const amount = '123';
            const txValue = utils_1.getTxValue(utils_1.API_ETH_MOCK_ADDRESS, amount);
            expect(txValue).toEqual(amount);
        });
    });
    describe('canBeEnsAddress', () => {
        it('Expects to be ens address', () => {
            const isEns = utils_1.canBeEnsAddress('0x0asdf');
            expect(isEns).toEqual(false);
        });
        it('Expects not to be ens address', () => {
            const isEns = utils_1.canBeEnsAddress('0x0asdf.eth');
            expect(isEns).toEqual(true);
        });
    });
    describe('decimalsToCurrencyUnits', () => {
        it('Expects the value to be in currency units', () => {
            const value = utils_1.decimalsToCurrencyUnits('1000000', 6);
            expect(value).toEqual('1');
        });
        it('Expects the value to be in currency units to fixed', () => {
            const value = utils_1.decimalsToCurrencyUnits('1000000123', 6);
            expect(value).toEqual('1000.000123');
        });
    });
    describe('valueToWei', () => {
        it('Expects the value to be in wei decimals', () => {
            const value = utils_1.valueToWei('1', 6);
            expect(value).toEqual('1000000');
        });
        it('Expects the value to be in wei decimals and fixed 0', () => {
            const value = utils_1.valueToWei('123.123541241123', 6);
            expect(value).toEqual('123123541');
        });
    });
});
//# sourceMappingURL=utils.test.js.map