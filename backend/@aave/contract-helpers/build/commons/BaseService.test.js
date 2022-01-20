"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const BaseService_1 = __importDefault(require("./BaseService"));
const types_1 = require("./types");
const utils_1 = require("./utils");
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class Test__factory {
    static connect(address, signerOrProvider) {
        return new ethers_1.Contract(address, [], signerOrProvider);
    }
}
jest.mock('../commons/gasStation', () => {
    return {
        __esModule: true,
        estimateGasByNetwork: jest
            .fn()
            .mockImplementation(async () => Promise.resolve(ethers_1.BigNumber.from(1))),
    };
});
describe('BaseService', () => {
    const provider = new ethers_1.providers.JsonRpcProvider();
    jest
        .spyOn(provider, 'getGasPrice')
        .mockImplementation(async () => Promise.resolve(ethers_1.BigNumber.from(1)));
    describe('Initialize', () => {
        it('Expects to initialize the class correctly', () => {
            expect(() => new BaseService_1.default(provider, Test__factory)).not.toThrow();
        });
    });
    describe('getContractInstance', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('Expects to initalize new instance', () => {
            const spy = jest.spyOn(Test__factory, 'connect');
            const baseService = new BaseService_1.default(provider, Test__factory);
            const address = '0x0000000000000000000000000000000000000001';
            const instance = baseService.getContractInstance(address);
            expect(instance instanceof ethers_1.Contract).toEqual(true);
            expect(spy).toHaveBeenCalled();
        });
        it('Expects to use an already initialized instance', () => {
            const spy = jest.spyOn(Test__factory, 'connect');
            const baseService = new BaseService_1.default(provider, Test__factory);
            const address = '0x0000000000000000000000000000000000000001';
            const instance = baseService.getContractInstance(address);
            const instance2 = baseService.getContractInstance(address);
            expect(instance instanceof ethers_1.Contract).toEqual(true);
            expect(instance2).toEqual(instance);
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });
    describe('generateTxCallback', () => {
        const baseService = new BaseService_1.default(provider, Test__factory);
        const from = '0x0000000000000000000000000000000000000001';
        const value = '1';
        const gasSurplus = 10;
        const action = types_1.ProtocolAction.deposit;
        const rawTxMethod = async () => ({});
        it('Expects a tx object with specified value', async () => {
            const txCallback = baseService.generateTxCallback({
                rawTxMethod,
                from,
                value,
                gasSurplus,
            });
            const tx = await txCallback();
            expect(tx.from).toEqual(from);
            expect(tx.value).toEqual(value);
            expect(tx.gasLimit).toEqual(ethers_1.BigNumber.from(1));
        });
        it('Expects a tx object with default value', async () => {
            const txCallback = baseService.generateTxCallback({
                rawTxMethod,
                from,
            });
            const tx = await txCallback();
            expect(tx.from).toEqual(from);
            expect(tx.value).toEqual(utils_1.DEFAULT_NULL_VALUE_ON_TX);
            expect(tx.gasLimit).toEqual(ethers_1.BigNumber.from(1));
        });
        it('Expects a tx object with recomended gas limit', async () => {
            const txCallback = baseService.generateTxCallback({
                rawTxMethod,
                from,
                action,
            });
            const tx = await txCallback();
            expect(tx.from).toEqual(from);
            expect(tx.value).toEqual(utils_1.DEFAULT_NULL_VALUE_ON_TX);
            expect(tx.gasLimit).toEqual(ethers_1.BigNumber.from(300000));
        });
    });
    describe('generateTxPriceEstimation', () => {
        const baseService = new BaseService_1.default(provider, Test__factory);
        const action = types_1.ProtocolAction.deposit;
        const txCallback = async () => ({
            gasLimit: ethers_1.BigNumber.from(1),
            gasPrice: ethers_1.BigNumber.from(2),
        });
        // const txs = [
        //   {
        //     txType: eEthereumTxType.DLP_ACTION,
        //     tx: txCallback,
        //     gas: async () => null,
        //   },
        // ];
        it('Expects to get gasPrice when pending approvals', async () => {
            const txs = [
                {
                    txType: types_1.eEthereumTxType.ERC20_APPROVAL,
                    tx: txCallback,
                    gas: async () => null,
                },
                {
                    txType: types_1.eEthereumTxType.DLP_ACTION,
                    tx: txCallback,
                    gas: async () => null,
                },
            ];
            const gasObj = baseService.generateTxPriceEstimation(txs, txCallback, action);
            const gas = await gasObj();
            expect(gas === null || gas === void 0 ? void 0 : gas.gasLimit).toEqual('300000');
            expect(gas === null || gas === void 0 ? void 0 : gas.gasPrice).toEqual('1');
        });
        it('Expects to get gasPrice when no pending txs', async () => {
            const txs = [
                {
                    txType: types_1.eEthereumTxType.DLP_ACTION,
                    tx: txCallback,
                    gas: async () => null,
                },
            ];
            const gasObj = baseService.generateTxPriceEstimation(txs, txCallback, action);
            const gas = await gasObj();
            expect(gas === null || gas === void 0 ? void 0 : gas.gasLimit).toEqual('1');
            expect(gas === null || gas === void 0 ? void 0 : gas.gasPrice).toEqual('2');
        });
        it('Expects to get gasPrice when no pending txs and no gas price passed', async () => {
            const txCallback = async () => ({
                gasLimit: ethers_1.BigNumber.from(1),
            });
            const txs = [
                {
                    txType: types_1.eEthereumTxType.DLP_ACTION,
                    tx: txCallback,
                    gas: async () => null,
                },
            ];
            const gasObj = baseService.generateTxPriceEstimation(txs, txCallback, action);
            const gas = await gasObj();
            expect(gas === null || gas === void 0 ? void 0 : gas.gasLimit).toEqual('1');
            expect(gas === null || gas === void 0 ? void 0 : gas.gasPrice).toEqual('1');
        });
        it('Expects to get gasPrice when forcing', async () => {
            const txs = [
                {
                    txType: types_1.eEthereumTxType.ERC20_APPROVAL,
                    tx: txCallback,
                    gas: async () => null,
                },
                {
                    txType: types_1.eEthereumTxType.DLP_ACTION,
                    tx: txCallback,
                    gas: async () => null,
                },
            ];
            const gasObj = baseService.generateTxPriceEstimation(txs, txCallback, action);
            const gas = await gasObj(true);
            expect(gas === null || gas === void 0 ? void 0 : gas.gasLimit).toEqual('1');
            expect(gas === null || gas === void 0 ? void 0 : gas.gasPrice).toEqual('2');
        });
        it('Expects null when no gas limit', async () => {
            const txCallback = async () => ({});
            const txs = [
                {
                    txType: types_1.eEthereumTxType.DLP_ACTION,
                    tx: txCallback,
                    gas: async () => null,
                },
            ];
            const gasObj = baseService.generateTxPriceEstimation(txs, txCallback, action);
            const gas = await gasObj();
            expect(gas).toEqual(null);
        });
    });
});
//# sourceMappingURL=BaseService.test.js.map