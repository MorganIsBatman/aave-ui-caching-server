"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const types_1 = require("../commons/types");
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
describe('RepayWithCollateralAdapterService', () => {
    const repayWithCollateralAddress = '0x0000000000000000000000000000000000000001';
    describe('Initialize', () => {
        const provider = new ethers_1.providers.JsonRpcProvider();
        it('Expects to initialize the service with all params', () => {
            expect(() => new index_1.RepayWithCollateralAdapterService(provider, repayWithCollateralAddress)).not.toThrow();
        });
        it('Expects to initialize the service without repayWithCollateralAddress', () => {
            expect(() => new index_1.RepayWithCollateralAdapterService(provider)).not.toThrow();
        });
    });
    describe('swapAndRepay', () => {
        const user = '0x0000000000000000000000000000000000000002';
        const collateralAsset = '0x0000000000000000000000000000000000000003';
        const debtAsset = '0x0000000000000000000000000000000000000004';
        const collateralAmount = '2000000000000000000';
        const debtRepayAmount = '1900000000000000000';
        const permit = {
            amount: '0',
            deadline: '0',
            v: 0,
            r: '0x0000000000000000000000000000000000000000000000000000000000000000',
            s: '0x0000000000000000000000000000000000000000000000000000000000000000',
        };
        const useEthPath = true;
        const debtRateMode = types_1.InterestRate.None;
        const provider = new ethers_1.providers.JsonRpcProvider();
        jest
            .spyOn(provider, 'getGasPrice')
            .mockImplementation(async () => Promise.resolve(ethers_1.BigNumber.from(1)));
        const repayInstance = new index_1.RepayWithCollateralAdapterService(provider, repayWithCollateralAddress);
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('Exepcts the tx object to be returned if all params passed with useEthPath true and rate mode none', async () => {
            var _a;
            const txObj = repayInstance.swapAndRepay({
                user,
                collateralAsset,
                debtAsset,
                collateralAmount,
                debtRepayAmount,
                debtRateMode,
                permit,
                useEthPath,
            });
            expect(txObj.txType).toEqual(types_1.eEthereumTxType.DLP_ACTION);
            const tx = await txObj.tx();
            expect(tx.to).toEqual(repayWithCollateralAddress);
            expect(tx.from).toEqual(user);
            expect(tx.gasLimit).toEqual(ethers_1.BigNumber.from(1));
            const decoded = ethers_1.utils.defaultAbiCoder.decode([
                'address',
                'address',
                'uint256',
                'uint256',
                'uint256',
                '(uint256,uint256,uint8,bytes32,bytes32)',
                'bool',
            ], ethers_1.utils.hexDataSlice((_a = tx.data) !== null && _a !== void 0 ? _a : '', 4));
            expect(decoded[0]).toEqual(collateralAsset);
            expect(decoded[1]).toEqual(debtAsset);
            expect(decoded[2]).toEqual(ethers_1.BigNumber.from(collateralAmount));
            expect(decoded[3]).toEqual(ethers_1.BigNumber.from(debtRepayAmount));
            expect(decoded[4]).toEqual(ethers_1.BigNumber.from(2));
            expect(decoded[5][0]).toEqual(ethers_1.BigNumber.from(permit.amount));
            expect(decoded[5][1]).toEqual(ethers_1.BigNumber.from(permit.deadline));
            expect(decoded[5][2]).toEqual(permit.v);
            expect(decoded[5][3]).toEqual(permit.r);
            expect(decoded[5][4]).toEqual(permit.s);
            expect(decoded[6]).toEqual(true);
            // gas price
            const gasPrice = await txObj.gas();
            expect(gasPrice).not.toBeNull();
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasLimit).toEqual('1');
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasPrice).toEqual('1');
        });
        it('Exepcts the tx object to be returned if all params passed with useEthPath true and rate mode stable', async () => {
            var _a;
            const debtRateMode = types_1.InterestRate.Stable;
            const txObj = repayInstance.swapAndRepay({
                user,
                collateralAsset,
                debtAsset,
                collateralAmount,
                debtRepayAmount,
                debtRateMode,
                permit,
                useEthPath,
            });
            expect(txObj.txType).toEqual(types_1.eEthereumTxType.DLP_ACTION);
            const tx = await txObj.tx();
            expect(tx.to).toEqual(repayWithCollateralAddress);
            expect(tx.from).toEqual(user);
            expect(tx.gasLimit).toEqual(ethers_1.BigNumber.from(1));
            const decoded = ethers_1.utils.defaultAbiCoder.decode([
                'address',
                'address',
                'uint256',
                'uint256',
                'uint256',
                '(uint256,uint256,uint8,bytes32,bytes32)',
                'bool',
            ], ethers_1.utils.hexDataSlice((_a = tx.data) !== null && _a !== void 0 ? _a : '', 4));
            expect(decoded[0]).toEqual(collateralAsset);
            expect(decoded[1]).toEqual(debtAsset);
            expect(decoded[2]).toEqual(ethers_1.BigNumber.from(collateralAmount));
            expect(decoded[3]).toEqual(ethers_1.BigNumber.from(debtRepayAmount));
            expect(decoded[4]).toEqual(ethers_1.BigNumber.from(1));
            expect(decoded[5][0]).toEqual(ethers_1.BigNumber.from(permit.amount));
            expect(decoded[5][1]).toEqual(ethers_1.BigNumber.from(permit.deadline));
            expect(decoded[5][2]).toEqual(permit.v);
            expect(decoded[5][3]).toEqual(permit.r);
            expect(decoded[5][4]).toEqual(permit.s);
            expect(decoded[6]).toEqual(true);
            // gas price
            const gasPrice = await txObj.gas();
            expect(gasPrice).not.toBeNull();
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasLimit).toEqual('1');
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasPrice).toEqual('1');
        });
        it('Exepcts the tx object to be returned if all params passed with useEthPath true and rate mode variable', async () => {
            var _a;
            const debtRateMode = types_1.InterestRate.Variable;
            const txObj = repayInstance.swapAndRepay({
                user,
                collateralAsset,
                debtAsset,
                collateralAmount,
                debtRepayAmount,
                debtRateMode,
                permit,
                useEthPath,
            });
            expect(txObj.txType).toEqual(types_1.eEthereumTxType.DLP_ACTION);
            const tx = await txObj.tx();
            expect(tx.to).toEqual(repayWithCollateralAddress);
            expect(tx.from).toEqual(user);
            expect(tx.gasLimit).toEqual(ethers_1.BigNumber.from(1));
            const decoded = ethers_1.utils.defaultAbiCoder.decode([
                'address',
                'address',
                'uint256',
                'uint256',
                'uint256',
                '(uint256,uint256,uint8,bytes32,bytes32)',
                'bool',
            ], ethers_1.utils.hexDataSlice((_a = tx.data) !== null && _a !== void 0 ? _a : '', 4));
            expect(decoded[0]).toEqual(collateralAsset);
            expect(decoded[1]).toEqual(debtAsset);
            expect(decoded[2]).toEqual(ethers_1.BigNumber.from(collateralAmount));
            expect(decoded[3]).toEqual(ethers_1.BigNumber.from(debtRepayAmount));
            expect(decoded[4]).toEqual(ethers_1.BigNumber.from(2));
            expect(decoded[5][0]).toEqual(ethers_1.BigNumber.from(permit.amount));
            expect(decoded[5][1]).toEqual(ethers_1.BigNumber.from(permit.deadline));
            expect(decoded[5][2]).toEqual(permit.v);
            expect(decoded[5][3]).toEqual(permit.r);
            expect(decoded[5][4]).toEqual(permit.s);
            expect(decoded[6]).toEqual(true);
            // gas price
            const gasPrice = await txObj.gas();
            expect(gasPrice).not.toBeNull();
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasLimit).toEqual('1');
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasPrice).toEqual('1');
        });
        it('Expects the tx object to be returned if all params passed with useEthPath false', async () => {
            var _a;
            const txObj = repayInstance.swapAndRepay({
                user,
                collateralAsset,
                debtAsset,
                collateralAmount,
                debtRepayAmount,
                debtRateMode,
                permit,
            });
            expect(txObj.txType).toEqual(types_1.eEthereumTxType.DLP_ACTION);
            const tx = await txObj.tx();
            expect(tx.to).toEqual(repayWithCollateralAddress);
            expect(tx.from).toEqual(user);
            expect(tx.gasLimit).toEqual(ethers_1.BigNumber.from(1));
            const decoded = ethers_1.utils.defaultAbiCoder.decode([
                'address',
                'address',
                'uint256',
                'uint256',
                'uint256',
                '(uint256,uint256,uint8,bytes32,bytes32)',
                'bool',
            ], ethers_1.utils.hexDataSlice((_a = tx.data) !== null && _a !== void 0 ? _a : '', 4));
            expect(decoded[0]).toEqual(collateralAsset);
            expect(decoded[1]).toEqual(debtAsset);
            expect(decoded[2]).toEqual(ethers_1.BigNumber.from(collateralAmount));
            expect(decoded[3]).toEqual(ethers_1.BigNumber.from(debtRepayAmount));
            expect(decoded[4]).toEqual(ethers_1.BigNumber.from(2));
            expect(decoded[5][0]).toEqual(ethers_1.BigNumber.from(permit.amount));
            expect(decoded[5][1]).toEqual(ethers_1.BigNumber.from(permit.deadline));
            expect(decoded[5][2]).toEqual(permit.v);
            expect(decoded[5][3]).toEqual(permit.r);
            expect(decoded[5][4]).toEqual(permit.s);
            expect(decoded[6]).toEqual(false);
            // gas price
            const gasPrice = await txObj.gas();
            expect(gasPrice).not.toBeNull();
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasLimit).toEqual('1');
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasPrice).toEqual('1');
        });
        it('Expects tx object gas to be the recommended one when passing txs for approvals', async () => {
            var _a;
            const txObj = repayInstance.swapAndRepay({
                user,
                collateralAsset,
                debtAsset,
                collateralAmount,
                debtRepayAmount,
                debtRateMode,
                permit,
                useEthPath,
            }, [
                {
                    txType: types_1.eEthereumTxType.ERC20_APPROVAL,
                    tx: async () => ({}),
                    gas: async () => ({
                        gasLimit: '1',
                        gasPrice: '1',
                    }),
                },
            ]);
            expect(txObj.txType).toEqual(types_1.eEthereumTxType.DLP_ACTION);
            const tx = await txObj.tx();
            expect(tx.to).toEqual(repayWithCollateralAddress);
            expect(tx.from).toEqual(user);
            expect(tx.gasLimit).toEqual(ethers_1.BigNumber.from(1));
            const decoded = ethers_1.utils.defaultAbiCoder.decode([
                'address',
                'address',
                'uint256',
                'uint256',
                'uint256',
                '(uint256,uint256,uint8,bytes32,bytes32)',
                'bool',
            ], ethers_1.utils.hexDataSlice((_a = tx.data) !== null && _a !== void 0 ? _a : '', 4));
            expect(decoded[0]).toEqual(collateralAsset);
            expect(decoded[1]).toEqual(debtAsset);
            expect(decoded[2]).toEqual(ethers_1.BigNumber.from(collateralAmount));
            expect(decoded[3]).toEqual(ethers_1.BigNumber.from(debtRepayAmount));
            expect(decoded[4]).toEqual(ethers_1.BigNumber.from(2));
            expect(decoded[5][0]).toEqual(ethers_1.BigNumber.from(permit.amount));
            expect(decoded[5][1]).toEqual(ethers_1.BigNumber.from(permit.deadline));
            expect(decoded[5][2]).toEqual(permit.v);
            expect(decoded[5][3]).toEqual(permit.r);
            expect(decoded[5][4]).toEqual(permit.s);
            expect(decoded[6]).toEqual(true);
            // gas price
            const gasPrice = await txObj.gas();
            expect(gasPrice).not.toBeNull();
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasLimit).toEqual('700000');
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasPrice).toEqual('1');
        });
        it('Expects to fail when repayWithCollateralAddress not passed', () => {
            const repayInstance = new index_1.RepayWithCollateralAdapterService(provider);
            const txObj = repayInstance.swapAndRepay({
                user,
                collateralAsset,
                debtAsset,
                collateralAmount,
                debtRepayAmount,
                debtRateMode,
                permit,
                useEthPath,
            });
            expect(txObj).toEqual([]);
        });
        it('Expects to fail when user not address', () => {
            const user = 'asdf';
            expect(() => repayInstance.swapAndRepay({
                user,
                collateralAsset,
                debtAsset,
                collateralAmount,
                debtRepayAmount,
                debtRateMode,
                permit,
                useEthPath,
            })).toThrowError(`Address: ${user} is not a valid ethereum Address`);
        });
        it('Expects to fail when collateralAsset not address', () => {
            const collateralAsset = 'asdf';
            expect(() => repayInstance.swapAndRepay({
                user,
                collateralAsset,
                debtAsset,
                collateralAmount,
                debtRepayAmount,
                debtRateMode,
                permit,
                useEthPath,
            })).toThrowError(`Address: ${collateralAsset} is not a valid ethereum Address`);
        });
        it('Expects to fail when debtAsset not address', () => {
            const debtAsset = 'asdf';
            expect(() => repayInstance.swapAndRepay({
                user,
                collateralAsset,
                debtAsset,
                collateralAmount,
                debtRepayAmount,
                debtRateMode,
                permit,
                useEthPath,
            })).toThrowError(`Address: ${debtAsset} is not a valid ethereum Address`);
        });
        it('Expects to fail when collateralAmount not positive', () => {
            const collateralAmount = '0';
            expect(() => repayInstance.swapAndRepay({
                user,
                collateralAsset,
                debtAsset,
                collateralAmount,
                debtRepayAmount,
                debtRateMode,
                permit,
                useEthPath,
            })).toThrowError(`Amount: ${collateralAmount} needs to be greater than 0`);
        });
        it('Expects to fail when collateralAmount not a number', () => {
            const collateralAmount = 'asdf';
            expect(() => repayInstance.swapAndRepay({
                user,
                collateralAsset,
                debtAsset,
                collateralAmount,
                debtRepayAmount,
                debtRateMode,
                permit,
                useEthPath,
            })).toThrowError(`Amount: ${collateralAmount} needs to be greater than 0`);
        });
        it('Expects to fail when debtRepayAmount not positive', () => {
            const debtRepayAmount = '0';
            expect(() => repayInstance.swapAndRepay({
                user,
                collateralAsset,
                debtAsset,
                collateralAmount,
                debtRepayAmount,
                debtRateMode,
                permit,
                useEthPath,
            })).toThrowError(`Amount: ${debtRepayAmount} needs to be greater than 0`);
        });
        it('Expects to fail when debtRepayAmount not a number', () => {
            const debtRepayAmount = 'asdf';
            expect(() => repayInstance.swapAndRepay({
                user,
                collateralAsset,
                debtAsset,
                collateralAmount,
                debtRepayAmount,
                debtRateMode,
                permit,
                useEthPath,
            })).toThrowError(`Amount: ${debtRepayAmount} needs to be greater than 0`);
        });
    });
});
//# sourceMappingURL=repayWithCollateralAdapter.test.js.map