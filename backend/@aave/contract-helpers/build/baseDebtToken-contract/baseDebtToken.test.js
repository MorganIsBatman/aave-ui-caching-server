"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const types_1 = require("../commons/types");
const erc20_contract_1 = require("../erc20-contract");
const IDebtTokenBase__factory_1 = require("./typechain/IDebtTokenBase__factory");
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
describe('BaseDebtTokenService', () => {
    describe('Initialization', () => {
        it('Expects to be initialized correctly', () => {
            const provider = new ethers_1.providers.JsonRpcProvider();
            const erc20Service = new erc20_contract_1.ERC20Service(provider);
            expect(() => new index_1.BaseDebtToken(provider, erc20Service)).not.toThrow();
        });
    });
    describe('approveDelegation', () => {
        const provider = new ethers_1.providers.JsonRpcProvider();
        jest
            .spyOn(provider, 'getGasPrice')
            .mockImplementation(async () => Promise.resolve(ethers_1.BigNumber.from(1)));
        const erc20Service = new erc20_contract_1.ERC20Service(provider);
        jest.spyOn(erc20Service, 'decimalsOf').mockImplementation(async () => 6);
        const debtToken = new index_1.BaseDebtToken(provider, erc20Service);
        const user = '0x0000000000000000000000000000000000000001';
        const delegatee = '0x0000000000000000000000000000000000000002';
        const debtTokenAddress = '0x0000000000000000000000000000000000000003';
        const amount = '1000000';
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('Expects tx Object for approval when all params are correct', async () => {
            var _a;
            const approveTxObj = debtToken.approveDelegation({
                user,
                delegatee,
                debtTokenAddress,
                amount,
            });
            expect(approveTxObj.txType).toEqual(types_1.eEthereumTxType.ERC20_APPROVAL);
            const tx = await approveTxObj.tx();
            expect(tx.to).toEqual(debtTokenAddress);
            expect(tx.from).toEqual(user);
            expect(tx.gasLimit).toEqual(ethers_1.BigNumber.from(1));
            const decoded = ethers_1.utils.defaultAbiCoder.decode(['address', 'uint256'], ethers_1.utils.hexDataSlice((_a = tx.data) !== null && _a !== void 0 ? _a : '', 4));
            expect(decoded[0]).toEqual(delegatee);
            expect(decoded[1]).toEqual(ethers_1.BigNumber.from(amount));
            // gas price
            const gasPrice = await approveTxObj.gas();
            expect(gasPrice).not.toBeNull();
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasLimit).toEqual('1');
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasPrice).toEqual('1');
        });
        it('Expects to fail when user is wrong address', () => {
            const user = 'asdf';
            expect(() => debtToken.approveDelegation({
                user,
                delegatee,
                debtTokenAddress,
                amount,
            })).toThrowError(`Address: ${user} is not a valid ethereum Address`);
        });
        it('Expects to fail when delegatee is wrong address', () => {
            const delegatee = 'asdf';
            expect(() => debtToken.approveDelegation({
                user,
                delegatee,
                debtTokenAddress,
                amount,
            })).toThrowError(`Address: ${delegatee} is not a valid ethereum Address`);
        });
        it('Expects to fail when debtTokenAddress is wrong address', () => {
            const debtTokenAddress = 'asdf';
            expect(() => debtToken.approveDelegation({
                user,
                delegatee,
                debtTokenAddress,
                amount,
            })).toThrowError(`Address: ${debtTokenAddress} is not a valid ethereum Address`);
        });
        it('Expects to fail when amount is not number', () => {
            const amount = 'asdf';
            expect(() => debtToken.approveDelegation({
                user,
                delegatee,
                debtTokenAddress,
                amount,
            })).toThrowError(`Amount: ${amount} needs to be greater than 0`);
        });
        it('Expects to fail when amount is not positive', () => {
            const amount = '0';
            expect(() => debtToken.approveDelegation({
                user,
                delegatee,
                debtTokenAddress,
                amount,
            })).toThrowError(`Amount: ${amount} needs to be greater than 0`);
        });
    });
    describe('isDelegationApproved', () => {
        const provider = new ethers_1.providers.JsonRpcProvider();
        jest
            .spyOn(provider, 'getGasPrice')
            .mockImplementation(async () => Promise.resolve(ethers_1.BigNumber.from(1)));
        const erc20Service = new erc20_contract_1.ERC20Service(provider);
        jest.spyOn(erc20Service, 'decimalsOf').mockImplementation(async () => 6);
        const debtTokenAddress = '0x0000000000000000000000000000000000000001';
        const allowanceGiver = '0x0000000000000000000000000000000000000002';
        const allowanceReceiver = '0x0000000000000000000000000000000000000003';
        const amount = '123.456';
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('Expects to return approved if all params ok', async () => {
            const spy = jest
                .spyOn(IDebtTokenBase__factory_1.IDebtTokenBase__factory, 'connect')
                .mockReturnValue({
                borrowAllowance: async () => Promise.resolve(ethers_1.BigNumber.from(10000000000)),
            });
            const debtToken = new index_1.BaseDebtToken(provider, erc20Service);
            const isApproved = await debtToken.isDelegationApproved({
                debtTokenAddress,
                allowanceGiver,
                allowanceReceiver,
                amount,
            });
            expect(spy).toBeCalled();
            expect(isApproved).toEqual(true);
        });
        it('Expects to return not approved if all params ok', async () => {
            const spy = jest
                .spyOn(IDebtTokenBase__factory_1.IDebtTokenBase__factory, 'connect')
                .mockReturnValue({
                borrowAllowance: async () => Promise.resolve(ethers_1.BigNumber.from(1000000)),
            });
            const debtToken = new index_1.BaseDebtToken(provider, erc20Service);
            const isApproved = await debtToken.isDelegationApproved({
                debtTokenAddress,
                allowanceGiver,
                allowanceReceiver,
                amount,
            });
            expect(spy).toBeCalled();
            expect(isApproved).toEqual(false);
        });
        it('Expects to fail when debtTokenAddress is wrong address', async () => {
            const debtToken = new index_1.BaseDebtToken(provider, erc20Service);
            const debtTokenAddress = 'asdf';
            await expect(async () => debtToken.isDelegationApproved({
                debtTokenAddress,
                allowanceGiver,
                allowanceReceiver,
                amount,
            })).rejects.toThrowError(`Address: ${debtTokenAddress} is not a valid ethereum Address`);
        });
        it('Expects to fail when allowanceGiver is wrong address', async () => {
            const debtToken = new index_1.BaseDebtToken(provider, erc20Service);
            const allowanceGiver = 'asdf';
            await expect(async () => debtToken.isDelegationApproved({
                debtTokenAddress,
                allowanceGiver,
                allowanceReceiver,
                amount,
            })).rejects.toThrowError(`Address: ${allowanceGiver} is not a valid ethereum Address`);
        });
        it('Expects to fail when allowanceReceiver is wrong address', async () => {
            const debtToken = new index_1.BaseDebtToken(provider, erc20Service);
            const allowanceReceiver = 'asdf';
            await expect(async () => debtToken.isDelegationApproved({
                debtTokenAddress,
                allowanceGiver,
                allowanceReceiver,
                amount,
            })).rejects.toThrowError(`Address: ${allowanceReceiver} is not a valid ethereum Address`);
        });
        it('Expects to fail when amount is not number', async () => {
            const debtToken = new index_1.BaseDebtToken(provider, erc20Service);
            const amount = 'asdf';
            await expect(async () => debtToken.isDelegationApproved({
                debtTokenAddress,
                allowanceGiver,
                allowanceReceiver,
                amount,
            })).rejects.toThrowError(`Amount: ${amount} needs to be greater than 0`);
        });
        it('Expects to fail when amount is 0', async () => {
            const debtToken = new index_1.BaseDebtToken(provider, erc20Service);
            const amount = '0';
            await expect(async () => debtToken.isDelegationApproved({
                debtTokenAddress,
                allowanceGiver,
                allowanceReceiver,
                amount,
            })).rejects.toThrowError(`Amount: ${amount} needs to be greater than 0`);
        });
    });
});
//# sourceMappingURL=baseDebtToken.test.js.map