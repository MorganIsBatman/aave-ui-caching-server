"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const types_1 = require("../commons/types");
const utils_1 = require("../commons/utils");
const index_1 = require("./index");
jest.mock('../commons/gasStation', () => {
    return {
        __esModule: true,
        estimateGasByNetwork: jest
            .fn()
            .mockImplementation(async () => Promise.resolve(ethers_1.BigNumber.from(1))),
        estimateGas: jest.fn(async () => Promise.resolve(ethers_1.BigNumber.from(1))),
    };
});
describe('FaucetService', () => {
    const provider = new ethers_1.providers.JsonRpcProvider();
    jest
        .spyOn(provider, 'getGasPrice')
        .mockImplementation(async () => Promise.resolve(ethers_1.BigNumber.from(1)));
    const faucetAddress = '0x0000000000000000000000000000000000000001';
    describe('Initialization', () => {
        it('Expects to initialize with all params', () => {
            const instance = new index_1.FaucetService(provider, faucetAddress);
            expect(instance instanceof index_1.FaucetService).toEqual(true);
        });
        it('Expects to initialize without address', () => {
            const instance = new index_1.FaucetService(provider);
            expect(instance instanceof index_1.FaucetService).toEqual(true);
        });
    });
    describe('mint', () => {
        const userAddress = '0x0000000000000000000000000000000000000002';
        const reserve = '0x0000000000000000000000000000000000000003';
        const tokenSymbol = 'DAI';
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('Expects the tx object if all params', async () => {
            var _a;
            const instance = new index_1.FaucetService(provider, faucetAddress);
            const faucetTxObj = instance.mint({ userAddress, reserve, tokenSymbol });
            expect(faucetTxObj.length).toEqual(1);
            expect(faucetTxObj[0].txType).toEqual(types_1.eEthereumTxType.FAUCET_MINT);
            const txObj = await faucetTxObj[0].tx();
            expect(txObj.to).toEqual(faucetAddress);
            expect(txObj.from).toEqual(userAddress);
            expect(txObj.gasLimit).toEqual(ethers_1.BigNumber.from(1));
            expect(txObj.value).toEqual(utils_1.DEFAULT_NULL_VALUE_ON_TX);
            // parse data
            const decoded = ethers_1.utils.defaultAbiCoder.decode(['address', 'uint256'], ethers_1.utils.hexDataSlice((_a = txObj.data) !== null && _a !== void 0 ? _a : '', 4));
            expect(decoded[0]).toEqual(reserve);
            expect(decoded[1]).toEqual(ethers_1.BigNumber.from(utils_1.mintAmountsPerToken[tokenSymbol]));
            // gas price
            const gasPrice = await faucetTxObj[0].gas();
            expect(gasPrice).not.toBeNull();
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasLimit).toEqual('1');
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasPrice).toEqual('1');
        });
        it('Expects to get [] if token doesn`t exist', () => {
            const tokenSymbol = 'asdf';
            const instance = new index_1.FaucetService(provider, faucetAddress);
            const faucetTxObj = instance.mint({ userAddress, reserve, tokenSymbol });
            expect(faucetTxObj).toEqual([]);
        });
        it('Expects to fail if faucet address not passed', () => {
            const instance = new index_1.FaucetService(provider);
            const faucetTxObj = instance.mint({ userAddress, reserve, tokenSymbol });
            expect(faucetTxObj).toEqual([]);
        });
        it('Expects to fail if userAddress not eth address', () => {
            const userAddress = 'asdf';
            const instance = new index_1.FaucetService(provider, faucetAddress);
            expect(() => instance.mint({ userAddress, reserve, tokenSymbol })).toThrowError(`Address: ${userAddress} is not a valid ethereum Address`);
        });
        it('Expects to fail if reserve not eth address', () => {
            const reserve = 'asdf';
            const instance = new index_1.FaucetService(provider, faucetAddress);
            expect(() => instance.mint({ userAddress, reserve, tokenSymbol })).toThrowError(`Address: ${reserve} is not a valid ethereum Address`);
        });
    });
});
//# sourceMappingURL=faucet.test.js.map