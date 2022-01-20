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
describe('IncentiveController', () => {
    const correctProvider = new ethers_1.providers.JsonRpcProvider();
    jest
        .spyOn(correctProvider, 'getGasPrice')
        .mockImplementation(async () => Promise.resolve(ethers_1.BigNumber.from(1)));
    describe('Create new IncentvieController', () => {
        it('Expects to be initialized correctly', () => {
            const incentivesInstance = new index_1.IncentivesController(correctProvider);
            expect(incentivesInstance instanceof index_1.IncentivesController);
        });
    });
    describe('claimRewards', () => {
        const incentivesInstance = new index_1.IncentivesController(correctProvider);
        const user = '0x0000000000000000000000000000000000000001';
        const assets = [
            '0x0000000000000000000000000000000000000002',
            '0x0000000000000000000000000000000000000003',
        ];
        const to = '0x0000000000000000000000000000000000000004';
        const incentivesControllerAddress = '0x0000000000000000000000000000000000000005';
        it('Expects to get claimReward tx object with correct params', async () => {
            var _a;
            const claimRewardsTxObject = incentivesInstance.claimRewards({
                user,
                assets,
                to,
                incentivesControllerAddress,
            });
            expect(claimRewardsTxObject.length).toEqual(1);
            expect(claimRewardsTxObject[0].txType).toEqual(types_1.eEthereumTxType.REWARD_ACTION);
            const txObj = await claimRewardsTxObject[0].tx();
            expect(txObj.to).toEqual(incentivesControllerAddress);
            expect(txObj.from).toEqual(user);
            expect(txObj.gasLimit).toEqual(ethers_1.BigNumber.from(1));
            expect(txObj.value).toEqual(utils_1.DEFAULT_NULL_VALUE_ON_TX);
            // parse data
            const decoded = ethers_1.utils.defaultAbiCoder.decode(['address[]', 'uint256', 'address'], ethers_1.utils.hexDataSlice((_a = txObj.data) !== null && _a !== void 0 ? _a : '', 4));
            expect(decoded[0].length).toEqual(2);
            expect(decoded[0]).toEqual(assets);
            expect(decoded[1]).toEqual(ethers_1.constants.MaxUint256);
            expect(decoded[2]).toEqual(to);
            // gas price
            const gasPrice = await claimRewardsTxObject[0].gas();
            expect(gasPrice).not.toBeNull();
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasLimit).toEqual('1');
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasPrice).toEqual('1');
        });
        it('Expects to get claimReward tx object with correct params without assets', async () => {
            var _a;
            const assets = [];
            const claimRewardsTxObject = incentivesInstance.claimRewards({
                user,
                assets,
                to,
                incentivesControllerAddress,
            });
            expect(claimRewardsTxObject.length).toEqual(1);
            expect(claimRewardsTxObject[0].txType).toEqual(types_1.eEthereumTxType.REWARD_ACTION);
            const txObj = await claimRewardsTxObject[0].tx();
            expect(txObj.to).toEqual(incentivesControllerAddress);
            expect(txObj.from).toEqual(user);
            expect(txObj.gasLimit).toEqual(ethers_1.BigNumber.from(1));
            expect(txObj.value).toEqual(utils_1.DEFAULT_NULL_VALUE_ON_TX);
            // parse data
            const decoded = ethers_1.utils.defaultAbiCoder.decode(['address[]', 'uint256', 'address'], ethers_1.utils.hexDataSlice((_a = txObj.data) !== null && _a !== void 0 ? _a : '', 4));
            expect(decoded[0].length).toEqual(0);
            expect(decoded[1]).toEqual(ethers_1.constants.MaxUint256);
            expect(decoded[2]).toEqual(to);
            // gas price
            const gasPrice = await claimRewardsTxObject[0].gas();
            expect(gasPrice).not.toBeNull();
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasLimit).toEqual('1');
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasPrice).toEqual('1');
        });
        it('Expects to get claimReward tx object with correct params, without to address', async () => {
            var _a;
            const claimRewardsTxObject = incentivesInstance.claimRewards({
                user,
                assets,
                incentivesControllerAddress,
            });
            expect(claimRewardsTxObject.length).toEqual(1);
            expect(claimRewardsTxObject[0].txType).toEqual(types_1.eEthereumTxType.REWARD_ACTION);
            const txObj = await claimRewardsTxObject[0].tx();
            expect(txObj.to).toEqual(incentivesControllerAddress);
            expect(txObj.from).toEqual(user);
            expect(txObj.gasLimit).toEqual(ethers_1.BigNumber.from(1));
            expect(txObj.value).toEqual(utils_1.DEFAULT_NULL_VALUE_ON_TX);
            // parse data
            const decoded = ethers_1.utils.defaultAbiCoder.decode(['address[]', 'uint256', 'address'], ethers_1.utils.hexDataSlice((_a = txObj.data) !== null && _a !== void 0 ? _a : '', 4));
            expect(decoded[0].length).toEqual(2);
            expect(decoded[0]).toEqual(assets);
            expect(decoded[1]).toEqual(ethers_1.constants.MaxUint256);
            expect(decoded[2]).toEqual(user);
            // gas price
            const gasPrice = await claimRewardsTxObject[0].gas();
            expect(gasPrice).not.toBeNull();
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasLimit).toEqual('1');
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasPrice).toEqual('1');
        });
        it('Expects to not get claimReward tx with wrong params: user', () => {
            const user = 'asdf';
            expect(() => incentivesInstance.claimRewards({
                user,
                assets,
                to,
                incentivesControllerAddress,
            })).toThrowError(new Error(`Address: ${user} is not a valid ethereum Address`));
        });
        it('Expects to not get claimReward tx with wrong params: incentivesControllerAddress', () => {
            const incentivesControllerAddress = 'asdf';
            expect(() => incentivesInstance.claimRewards({
                user,
                assets,
                to,
                incentivesControllerAddress,
            })).toThrowError(new Error(`Address: ${incentivesControllerAddress} is not a valid ethereum Address`));
        });
        it('Expects to not get claimReward tx with wrong params: to', () => {
            const to = 'asdf';
            expect(() => incentivesInstance.claimRewards({
                user,
                assets,
                to,
                incentivesControllerAddress,
            })).toThrowError(new Error(`Address: ${to} is not a valid ethereum Address`));
        });
        it('Expects to not get claimReward tx with wrong params: assets', () => {
            const assets = ['asdfasdf', '0x0000000000000000000000000000000000000003'];
            expect(() => incentivesInstance.claimRewards({
                user,
                assets,
                to,
                incentivesControllerAddress,
            })).toThrowError(new Error(`Address: ${assets[0]} is not a valid ethereum Address`));
        });
    });
});
//# sourceMappingURL=incentive-controller.test.js.map