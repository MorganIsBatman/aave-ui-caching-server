"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const types_1 = require("../commons/types");
const utils_1 = require("../commons/utils");
const erc20_contract_1 = require("../erc20-contract");
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
describe('WethGatewayService', () => {
    const wethGatewayAddress = '0x0000000000000000000000000000000000000001';
    const lendingPool = '0x0000000000000000000000000000000000000002';
    describe('Initialization', () => {
        const provider = new ethers_1.providers.JsonRpcProvider();
        const erc20Service = new erc20_contract_1.ERC20Service(provider);
        it('Expects to be initialized', () => {
            expect(() => new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress)).not.toThrow();
        });
        it('Expects to initialize without wethgateway address', () => {
            expect(() => new index_1.WETHGatewayService(provider, erc20Service)).not.toThrow();
        });
    });
    describe('depositETH', () => {
        const user = '0x0000000000000000000000000000000000000003';
        const onBehalfOf = '0x0000000000000000000000000000000000000004';
        const amount = '123.456';
        const referralCode = '0';
        const provider = new ethers_1.providers.JsonRpcProvider();
        jest
            .spyOn(provider, 'getGasPrice')
            .mockImplementation(async () => Promise.resolve(ethers_1.BigNumber.from(1)));
        const erc20Service = new erc20_contract_1.ERC20Service(provider);
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('Expects the deposit tx object to be correct with all params', async () => {
            var _a;
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const txObj = weth.depositETH({
                lendingPool,
                user,
                amount,
                onBehalfOf,
                referralCode,
            });
            expect(txObj.length).toEqual(1);
            expect(txObj[0].txType).toEqual(types_1.eEthereumTxType.DLP_ACTION);
            const tx = await txObj[0].tx();
            expect(tx.to).toEqual(wethGatewayAddress);
            expect(tx.from).toEqual(user);
            expect(tx.gasLimit).toEqual(ethers_1.BigNumber.from(1));
            const decoded = ethers_1.utils.defaultAbiCoder.decode(['address', 'address', 'uint16'], ethers_1.utils.hexDataSlice((_a = tx.data) !== null && _a !== void 0 ? _a : '', 4));
            expect(decoded[0]).toEqual(lendingPool);
            expect(decoded[1]).toEqual(onBehalfOf);
            expect(decoded[2]).toEqual(Number(referralCode));
            // gas price
            const gasPrice = await txObj[0].gas();
            expect(gasPrice).not.toBeNull();
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasLimit).toEqual('1');
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasPrice).toEqual('1');
        });
        it('Expects the deposit tx object to be correct without onBehalfOf', async () => {
            var _a;
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const txObj = weth.depositETH({
                lendingPool,
                user,
                amount,
                referralCode,
            });
            expect(txObj.length).toEqual(1);
            expect(txObj[0].txType).toEqual(types_1.eEthereumTxType.DLP_ACTION);
            const tx = await txObj[0].tx();
            expect(tx.to).toEqual(wethGatewayAddress);
            expect(tx.from).toEqual(user);
            expect(tx.gasLimit).toEqual(ethers_1.BigNumber.from(1));
            const decoded = ethers_1.utils.defaultAbiCoder.decode(['address', 'address', 'uint16'], ethers_1.utils.hexDataSlice((_a = tx.data) !== null && _a !== void 0 ? _a : '', 4));
            expect(decoded[0]).toEqual(lendingPool);
            expect(decoded[1]).toEqual(user);
            expect(decoded[2]).toEqual(Number(referralCode));
            // gas price
            const gasPrice = await txObj[0].gas();
            expect(gasPrice).not.toBeNull();
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasLimit).toEqual('1');
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasPrice).toEqual('1');
        });
        it('Expects the deposit tx object to be correct without referralCode', async () => {
            var _a;
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const txObj = weth.depositETH({
                lendingPool,
                user,
                amount,
            });
            expect(txObj.length).toEqual(1);
            expect(txObj[0].txType).toEqual(types_1.eEthereumTxType.DLP_ACTION);
            const tx = await txObj[0].tx();
            expect(tx.to).toEqual(wethGatewayAddress);
            expect(tx.from).toEqual(user);
            expect(tx.gasLimit).toEqual(ethers_1.BigNumber.from(1));
            const decoded = ethers_1.utils.defaultAbiCoder.decode(['address', 'address', 'uint16'], ethers_1.utils.hexDataSlice((_a = tx.data) !== null && _a !== void 0 ? _a : '', 4));
            expect(decoded[0]).toEqual(lendingPool);
            expect(decoded[1]).toEqual(user);
            expect(decoded[2]).toEqual(0);
            // gas price
            const gasPrice = await txObj[0].gas();
            expect(gasPrice).not.toBeNull();
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasLimit).toEqual('1');
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasPrice).toEqual('1');
        });
        it('Expects to fail when initialized without gateway address', () => {
            const weth = new index_1.WETHGatewayService(provider, erc20Service);
            const txObj = weth.depositETH({
                lendingPool,
                user,
                amount,
            });
            expect(txObj.length).toEqual(0);
        });
        it('Expects to fail when user is not address', () => {
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const user = 'asdf';
            expect(() => weth.depositETH({
                lendingPool,
                user,
                amount,
                onBehalfOf,
                referralCode,
            })).toThrowError(`Address: ${user} is not a valid ethereum Address`);
        });
        it('Expects to fail when lendingPool is not address', () => {
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const lendingPool = 'asdf';
            expect(() => weth.depositETH({
                lendingPool,
                user,
                amount,
                onBehalfOf,
                referralCode,
            })).toThrowError(`Address: ${lendingPool} is not a valid ethereum Address`);
        });
        it('Expects to fail when amount is not positive', () => {
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const amount = '0';
            expect(() => weth.depositETH({
                lendingPool,
                user,
                amount,
                onBehalfOf,
                referralCode,
            })).toThrowError(`Amount: ${amount} needs to be greater than 0`);
        });
        it('Expects to fail when amount is not number', () => {
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const amount = 'asdf';
            expect(() => weth.depositETH({
                lendingPool,
                user,
                amount,
                onBehalfOf,
                referralCode,
            })).toThrowError(`Amount: ${amount} needs to be greater than 0`);
        });
        it('Expects to fail when onBehalfOf is not address', () => {
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const onBehalfOf = 'asdf';
            expect(() => weth.depositETH({
                lendingPool,
                user,
                amount,
                onBehalfOf,
                referralCode,
            })).toThrowError(`Address: ${onBehalfOf} is not a valid ethereum Address`);
        });
        it('Expects to fail when referral is not number', () => {
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const referralCode = 'asdf';
            expect(() => weth.depositETH({
                lendingPool,
                user,
                amount,
                onBehalfOf,
                referralCode,
            })).toThrowError(`Amount: ${referralCode} needs to be greater or equal than 0`);
        });
    });
    describe('withdrawETH', () => {
        const user = '0x0000000000000000000000000000000000000003';
        const debtTokenAddress = '0x0000000000000000000000000000000000000005';
        const interestRateMode = types_1.InterestRate.Stable;
        const amount = '123.456';
        const referralCode = '0';
        const provider = new ethers_1.providers.JsonRpcProvider();
        jest
            .spyOn(provider, 'getGasPrice')
            .mockImplementation(async () => Promise.resolve(ethers_1.BigNumber.from(1)));
        const erc20Service = new erc20_contract_1.ERC20Service(provider);
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('Expects the borrow tx object to be correct with all params and variable stable rate without approval', async () => {
            var _a;
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const isApprovedSpy = jest
                .spyOn(weth.baseDebtTokenService, 'isDelegationApproved')
                .mockImplementation(async () => Promise.resolve(false));
            const approveSpy = jest
                .spyOn(weth.baseDebtTokenService, 'approveDelegation')
                .mockImplementation(() => ({
                txType: types_1.eEthereumTxType.ERC20_APPROVAL,
                tx: async () => ({}),
                gas: async () => ({
                    gasLimit: '1',
                    gasPrice: '1',
                }),
            }));
            const interestRateMode = types_1.InterestRate.Variable;
            const txObj = await weth.borrowETH({
                lendingPool,
                user,
                amount,
                debtTokenAddress,
                interestRateMode,
                referralCode,
            });
            expect(isApprovedSpy).toHaveBeenCalled();
            expect(approveSpy).toHaveBeenCalled();
            expect(txObj.length).toEqual(2);
            expect(txObj[1].txType).toEqual(types_1.eEthereumTxType.DLP_ACTION);
            const tx = await txObj[1].tx();
            expect(tx.to).toEqual(wethGatewayAddress);
            expect(tx.from).toEqual(user);
            expect(tx.gasLimit).toEqual(ethers_1.BigNumber.from(1));
            const decoded = ethers_1.utils.defaultAbiCoder.decode(['address', 'uint256', 'uint256', 'uint16'], ethers_1.utils.hexDataSlice((_a = tx.data) !== null && _a !== void 0 ? _a : '', 4));
            expect(decoded[0]).toEqual(lendingPool);
            expect(decoded[1]).toEqual(ethers_1.BigNumber.from(utils_1.valueToWei(amount, 18)));
            expect(decoded[2]).toEqual(ethers_1.BigNumber.from(2));
            expect(decoded[3]).toEqual(Number(referralCode));
            // gas price
            const gasPrice = await txObj[1].gas();
            expect(gasPrice).not.toBeNull();
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasLimit).toEqual('450000');
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasPrice).toEqual('1');
        });
        it('Expects the borrow tx object to be correct with all params and stable stable rate already approved', async () => {
            var _a;
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const isApprovedSpy = jest
                .spyOn(weth.baseDebtTokenService, 'isDelegationApproved')
                .mockImplementation(async () => Promise.resolve(true));
            const txObj = await weth.borrowETH({
                lendingPool,
                user,
                amount,
                debtTokenAddress,
                interestRateMode,
                referralCode,
            });
            expect(isApprovedSpy).toHaveBeenCalled();
            expect(txObj.length).toEqual(1);
            expect(txObj[0].txType).toEqual(types_1.eEthereumTxType.DLP_ACTION);
            const tx = await txObj[0].tx();
            expect(tx.to).toEqual(wethGatewayAddress);
            expect(tx.from).toEqual(user);
            expect(tx.gasLimit).toEqual(ethers_1.BigNumber.from(1));
            const decoded = ethers_1.utils.defaultAbiCoder.decode(['address', 'uint256', 'uint256', 'uint16'], ethers_1.utils.hexDataSlice((_a = tx.data) !== null && _a !== void 0 ? _a : '', 4));
            expect(decoded[0]).toEqual(lendingPool);
            expect(decoded[1]).toEqual(ethers_1.BigNumber.from(utils_1.valueToWei(amount, 18)));
            expect(decoded[2]).toEqual(ethers_1.BigNumber.from(1));
            expect(decoded[3]).toEqual(Number(referralCode));
            // gas price
            const gasPrice = await txObj[0].gas();
            expect(gasPrice).not.toBeNull();
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasLimit).toEqual('1');
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasPrice).toEqual('1');
        });
        it('Expects the borrow tx object to be correct with all params and none stable rate', async () => {
            var _a;
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const isApprovedSpy = jest
                .spyOn(weth.baseDebtTokenService, 'isDelegationApproved')
                .mockImplementation(async () => Promise.resolve(true));
            const interestRateMode = types_1.InterestRate.None;
            const txObj = await weth.borrowETH({
                lendingPool,
                user,
                amount,
                debtTokenAddress,
                interestRateMode,
                referralCode,
            });
            expect(isApprovedSpy).toHaveBeenCalled();
            expect(txObj.length).toEqual(1);
            expect(txObj[0].txType).toEqual(types_1.eEthereumTxType.DLP_ACTION);
            const tx = await txObj[0].tx();
            expect(tx.to).toEqual(wethGatewayAddress);
            expect(tx.from).toEqual(user);
            expect(tx.gasLimit).toEqual(ethers_1.BigNumber.from(1));
            const decoded = ethers_1.utils.defaultAbiCoder.decode(['address', 'uint256', 'uint256', 'uint16'], ethers_1.utils.hexDataSlice((_a = tx.data) !== null && _a !== void 0 ? _a : '', 4));
            expect(decoded[0]).toEqual(lendingPool);
            expect(decoded[1]).toEqual(ethers_1.BigNumber.from(utils_1.valueToWei(amount, 18)));
            expect(decoded[2]).toEqual(ethers_1.BigNumber.from(1));
            expect(decoded[3]).toEqual(Number(referralCode));
            // gas price
            const gasPrice = await txObj[0].gas();
            expect(gasPrice).not.toBeNull();
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasLimit).toEqual('1');
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasPrice).toEqual('1');
        });
        it('Expects the borrow tx object to be correct without referralCode', async () => {
            var _a;
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const isApprovedSpy = jest
                .spyOn(weth.baseDebtTokenService, 'isDelegationApproved')
                .mockImplementation(async () => Promise.resolve(true));
            const interestRateMode = types_1.InterestRate.None;
            const txObj = await weth.borrowETH({
                lendingPool,
                user,
                amount,
                debtTokenAddress,
                interestRateMode,
            });
            expect(isApprovedSpy).toHaveBeenCalled();
            expect(txObj.length).toEqual(1);
            expect(txObj[0].txType).toEqual(types_1.eEthereumTxType.DLP_ACTION);
            const tx = await txObj[0].tx();
            expect(tx.to).toEqual(wethGatewayAddress);
            expect(tx.from).toEqual(user);
            expect(tx.gasLimit).toEqual(ethers_1.BigNumber.from(1));
            const decoded = ethers_1.utils.defaultAbiCoder.decode(['address', 'uint256', 'uint256', 'uint16'], ethers_1.utils.hexDataSlice((_a = tx.data) !== null && _a !== void 0 ? _a : '', 4));
            expect(decoded[0]).toEqual(lendingPool);
            expect(decoded[1]).toEqual(ethers_1.BigNumber.from(utils_1.valueToWei(amount, 18)));
            expect(decoded[2]).toEqual(ethers_1.BigNumber.from(1));
            expect(decoded[3]).toEqual(0);
            // gas price
            const gasPrice = await txObj[0].gas();
            expect(gasPrice).not.toBeNull();
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasLimit).toEqual('1');
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasPrice).toEqual('1');
        });
        it('Expects to fail when initialized without gateway address', async () => {
            const weth = new index_1.WETHGatewayService(provider, erc20Service);
            const txObj = await weth.borrowETH({
                lendingPool,
                user,
                amount,
                debtTokenAddress,
                interestRateMode,
                referralCode,
            });
            expect(txObj.length).toEqual(0);
        });
        it('Expects to fail when user is not address', async () => {
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const user = 'asdf';
            await expect(async () => weth.borrowETH({
                lendingPool,
                user,
                amount,
                debtTokenAddress,
                interestRateMode,
                referralCode,
            })).rejects.toThrowError(`Address: ${user} is not a valid ethereum Address`);
        });
        it('Expects to fail when lendingPool is not address', async () => {
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const lendingPool = 'asdf';
            await expect(async () => weth.borrowETH({
                lendingPool,
                user,
                amount,
                debtTokenAddress,
                interestRateMode,
                referralCode,
            })).rejects.toThrowError(`Address: ${lendingPool} is not a valid ethereum Address`);
        });
        it('Expects to fail when amount is not positive', async () => {
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const amount = '0';
            await expect(async () => weth.borrowETH({
                lendingPool,
                user,
                amount,
                debtTokenAddress,
                interestRateMode,
                referralCode,
            })).rejects.toThrowError(`Amount: ${amount} needs to be greater than 0`);
        });
        it('Expects to fail when amount is not number', async () => {
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const amount = 'asdf';
            await expect(async () => weth.borrowETH({
                lendingPool,
                user,
                amount,
                debtTokenAddress,
                interestRateMode,
                referralCode,
            })).rejects.toThrowError(`Amount: ${amount} needs to be greater than 0`);
        });
        it('Expects to fail when debtTokenAddress is not address', async () => {
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const debtTokenAddress = 'asdf';
            await expect(async () => weth.borrowETH({
                lendingPool,
                user,
                amount,
                debtTokenAddress,
                interestRateMode,
                referralCode,
            })).rejects.toThrowError(`Address: ${debtTokenAddress} is not a valid ethereum Address`);
        });
        it('Expects to fail when referral is not number', async () => {
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const referralCode = 'asdf';
            await expect(async () => weth.borrowETH({
                lendingPool,
                user,
                amount,
                debtTokenAddress,
                interestRateMode,
                referralCode,
            })).rejects.toThrowError(`Amount: ${referralCode} needs to be greater or equal than 0`);
        });
    });
    describe('repayETH', () => {
        const user = '0x0000000000000000000000000000000000000003';
        const onBehalfOf = '0x0000000000000000000000000000000000000004';
        const aTokenAddress = '0x0000000000000000000000000000000000000005';
        const amount = '123.456';
        const provider = new ethers_1.providers.JsonRpcProvider();
        jest
            .spyOn(provider, 'getGasPrice')
            .mockImplementation(async () => Promise.resolve(ethers_1.BigNumber.from(1)));
        const erc20Service = new erc20_contract_1.ERC20Service(provider);
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('Expects the withdraw tx object to be correct with all params and not approved', async () => {
            var _a;
            const isApprovedSpy = jest
                .spyOn(erc20Service, 'isApproved')
                .mockImplementation(async () => Promise.resolve(false));
            const approveSpy = jest
                .spyOn(erc20Service, 'approve')
                .mockImplementation(() => ({
                txType: types_1.eEthereumTxType.ERC20_APPROVAL,
                tx: async () => ({}),
                gas: async () => ({
                    gasLimit: '1',
                    gasPrice: '1',
                }),
            }));
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const txObj = await weth.withdrawETH({
                lendingPool,
                user,
                amount,
                onBehalfOf,
                aTokenAddress,
            });
            expect(isApprovedSpy).toHaveBeenCalled();
            expect(approveSpy).toHaveBeenCalled();
            expect(txObj.length).toEqual(2);
            expect(txObj[1].txType).toEqual(types_1.eEthereumTxType.DLP_ACTION);
            const tx = await txObj[1].tx();
            expect(tx.to).toEqual(wethGatewayAddress);
            expect(tx.from).toEqual(user);
            expect(tx.gasLimit).toEqual(ethers_1.BigNumber.from(1));
            const decoded = ethers_1.utils.defaultAbiCoder.decode(['address', 'uint256', 'address'], ethers_1.utils.hexDataSlice((_a = tx.data) !== null && _a !== void 0 ? _a : '', 4));
            expect(decoded[0]).toEqual(lendingPool);
            expect(decoded[1]).toEqual(ethers_1.BigNumber.from(utils_1.valueToWei(amount, 18)));
            expect(decoded[2]).toEqual(onBehalfOf);
            // gas price
            const gasPrice = await txObj[1].gas();
            expect(gasPrice).not.toBeNull();
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasLimit).toEqual('640000');
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasPrice).toEqual('1');
        });
        it('Expects the withdraw tx object to be correct with all params and amount -1 and approved', async () => {
            var _a;
            const isApprovedSpy = jest
                .spyOn(erc20Service, 'isApproved')
                .mockImplementation(async () => Promise.resolve(true));
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const amount = '-1';
            const txObj = await weth.withdrawETH({
                lendingPool,
                user,
                amount,
                onBehalfOf,
                aTokenAddress,
            });
            expect(isApprovedSpy).toHaveBeenCalled();
            expect(txObj.length).toEqual(1);
            expect(txObj[0].txType).toEqual(types_1.eEthereumTxType.DLP_ACTION);
            const tx = await txObj[0].tx();
            expect(tx.to).toEqual(wethGatewayAddress);
            expect(tx.from).toEqual(user);
            expect(tx.gasLimit).toEqual(ethers_1.BigNumber.from(1));
            const decoded = ethers_1.utils.defaultAbiCoder.decode(['address', 'uint256', 'address'], ethers_1.utils.hexDataSlice((_a = tx.data) !== null && _a !== void 0 ? _a : '', 4));
            expect(decoded[0]).toEqual(lendingPool);
            expect(decoded[1]).toEqual(ethers_1.constants.MaxUint256);
            expect(decoded[2]).toEqual(onBehalfOf);
            // gas price
            const gasPrice = await txObj[0].gas();
            expect(gasPrice).not.toBeNull();
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasLimit).toEqual('1');
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasPrice).toEqual('1');
        });
        it('Expects the withdraw tx object to be correct without onBehalfOf', async () => {
            var _a;
            const isApprovedSpy = jest
                .spyOn(erc20Service, 'isApproved')
                .mockImplementation(async () => Promise.resolve(true));
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const txObj = await weth.withdrawETH({
                lendingPool,
                user,
                amount,
                aTokenAddress,
            });
            expect(isApprovedSpy).toHaveBeenCalled();
            expect(txObj.length).toEqual(1);
            expect(txObj[0].txType).toEqual(types_1.eEthereumTxType.DLP_ACTION);
            const tx = await txObj[0].tx();
            expect(tx.to).toEqual(wethGatewayAddress);
            expect(tx.from).toEqual(user);
            expect(tx.gasLimit).toEqual(ethers_1.BigNumber.from(1));
            const decoded = ethers_1.utils.defaultAbiCoder.decode(['address', 'uint256', 'address'], ethers_1.utils.hexDataSlice((_a = tx.data) !== null && _a !== void 0 ? _a : '', 4));
            expect(decoded[0]).toEqual(lendingPool);
            expect(decoded[1]).toEqual(ethers_1.BigNumber.from(utils_1.valueToWei(amount, 18)));
            expect(decoded[2]).toEqual(user);
            // gas price
            const gasPrice = await txObj[0].gas();
            expect(gasPrice).not.toBeNull();
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasLimit).toEqual('1');
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasPrice).toEqual('1');
        });
        it('Expects to fail when initialized without gateway address', async () => {
            const weth = new index_1.WETHGatewayService(provider, erc20Service);
            const txObj = await weth.withdrawETH({
                lendingPool,
                user,
                amount,
                aTokenAddress,
            });
            expect(txObj.length).toEqual(0);
        });
        it('Expects to fail when user is not address', async () => {
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const user = 'asdf';
            await expect(async () => weth.withdrawETH({
                lendingPool,
                user,
                amount,
                aTokenAddress,
            })).rejects.toThrowError(`Address: ${user} is not a valid ethereum Address`);
        });
        it('Expects to fail when lendingPool is not address', async () => {
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const lendingPool = 'asdf';
            await expect(async () => weth.withdrawETH({
                lendingPool,
                user,
                amount,
                aTokenAddress,
            })).rejects.toThrowError(`Address: ${lendingPool} is not a valid ethereum Address`);
        });
        it('Expects to fail when amount is not positive', async () => {
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const amount = '0';
            await expect(async () => weth.withdrawETH({
                lendingPool,
                user,
                amount,
                aTokenAddress,
            })).rejects.toThrowError(`Amount: ${amount} needs to be greater than 0`);
        });
        it('Expects to fail when amount is not number', async () => {
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const amount = 'asdf';
            await expect(async () => weth.withdrawETH({
                lendingPool,
                user,
                amount,
                aTokenAddress,
            })).rejects.toThrowError(`Amount: ${amount} needs to be greater than 0`);
        });
        it('Expects to fail when aTokenAddress is not address', async () => {
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const aTokenAddress = 'asdf';
            await expect(async () => weth.withdrawETH({
                lendingPool,
                user,
                amount,
                aTokenAddress,
            })).rejects.toThrowError(`Address: ${aTokenAddress} is not a valid ethereum Address`);
        });
        it('Expects to fail when onBehalfOf is not address', async () => {
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const onBehalfOf = 'asdf';
            await expect(async () => weth.withdrawETH({
                lendingPool,
                user,
                amount,
                aTokenAddress,
                onBehalfOf,
            })).rejects.toThrowError(`Address: ${onBehalfOf} is not a valid ethereum Address`);
        });
    });
    describe('borrowETH', () => {
        const user = '0x0000000000000000000000000000000000000003';
        const onBehalfOf = '0x0000000000000000000000000000000000000004';
        const interestRateMode = types_1.InterestRate.Stable;
        const amount = '123.456';
        const provider = new ethers_1.providers.JsonRpcProvider();
        jest
            .spyOn(provider, 'getGasPrice')
            .mockImplementation(async () => Promise.resolve(ethers_1.BigNumber.from(1)));
        const erc20Service = new erc20_contract_1.ERC20Service(provider);
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('Expects the repay tx object to be correct with all params and stable rate mode', async () => {
            var _a;
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const txObj = weth.repayETH({
                lendingPool,
                user,
                amount,
                interestRateMode,
                onBehalfOf,
            });
            expect(txObj.length).toEqual(1);
            expect(txObj[0].txType).toEqual(types_1.eEthereumTxType.DLP_ACTION);
            const tx = await txObj[0].tx();
            expect(tx.to).toEqual(wethGatewayAddress);
            expect(tx.from).toEqual(user);
            expect(tx.gasLimit).toEqual(ethers_1.BigNumber.from(1));
            const decoded = ethers_1.utils.defaultAbiCoder.decode(['address', 'uint256', 'uint256', 'address'], ethers_1.utils.hexDataSlice((_a = tx.data) !== null && _a !== void 0 ? _a : '', 4));
            expect(decoded[0]).toEqual(lendingPool);
            expect(decoded[1]).toEqual(ethers_1.BigNumber.from(utils_1.valueToWei(amount, 18)));
            expect(decoded[2]).toEqual(ethers_1.BigNumber.from(1));
            expect(decoded[3]).toEqual(onBehalfOf);
            // gas price
            const gasPrice = await txObj[0].gas();
            expect(gasPrice).not.toBeNull();
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasLimit).toEqual('1');
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasPrice).toEqual('1');
        });
        it('Expects the repay tx object to be correct with all params and variable rate mode', async () => {
            var _a;
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const interestRateMode = types_1.InterestRate.Variable;
            const txObj = weth.repayETH({
                lendingPool,
                user,
                amount,
                interestRateMode,
                onBehalfOf,
            });
            expect(txObj.length).toEqual(1);
            expect(txObj[0].txType).toEqual(types_1.eEthereumTxType.DLP_ACTION);
            const tx = await txObj[0].tx();
            expect(tx.to).toEqual(wethGatewayAddress);
            expect(tx.from).toEqual(user);
            expect(tx.gasLimit).toEqual(ethers_1.BigNumber.from(1));
            const decoded = ethers_1.utils.defaultAbiCoder.decode(['address', 'uint256', 'uint256', 'address'], ethers_1.utils.hexDataSlice((_a = tx.data) !== null && _a !== void 0 ? _a : '', 4));
            expect(decoded[0]).toEqual(lendingPool);
            expect(decoded[1]).toEqual(ethers_1.BigNumber.from(utils_1.valueToWei(amount, 18)));
            expect(decoded[2]).toEqual(ethers_1.BigNumber.from(2));
            expect(decoded[3]).toEqual(onBehalfOf);
            // gas price
            const gasPrice = await txObj[0].gas();
            expect(gasPrice).not.toBeNull();
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasLimit).toEqual('1');
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasPrice).toEqual('1');
        });
        it('Expects the repay tx object to be correct with all params and none rate mode', async () => {
            var _a;
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const interestRateMode = types_1.InterestRate.None;
            const txObj = weth.repayETH({
                lendingPool,
                user,
                amount,
                interestRateMode,
                onBehalfOf,
            });
            expect(txObj.length).toEqual(1);
            expect(txObj[0].txType).toEqual(types_1.eEthereumTxType.DLP_ACTION);
            const tx = await txObj[0].tx();
            expect(tx.to).toEqual(wethGatewayAddress);
            expect(tx.from).toEqual(user);
            expect(tx.gasLimit).toEqual(ethers_1.BigNumber.from(1));
            const decoded = ethers_1.utils.defaultAbiCoder.decode(['address', 'uint256', 'uint256', 'address'], ethers_1.utils.hexDataSlice((_a = tx.data) !== null && _a !== void 0 ? _a : '', 4));
            expect(decoded[0]).toEqual(lendingPool);
            expect(decoded[1]).toEqual(ethers_1.BigNumber.from(utils_1.valueToWei(amount, 18)));
            expect(decoded[2]).toEqual(ethers_1.BigNumber.from(1));
            expect(decoded[3]).toEqual(onBehalfOf);
            // gas price
            const gasPrice = await txObj[0].gas();
            expect(gasPrice).not.toBeNull();
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasLimit).toEqual('1');
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasPrice).toEqual('1');
        });
        it('Expects the repay tx object to be correct without onBehalfOf', async () => {
            var _a;
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const txObj = weth.repayETH({
                lendingPool,
                user,
                amount,
                interestRateMode,
            });
            expect(txObj.length).toEqual(1);
            expect(txObj[0].txType).toEqual(types_1.eEthereumTxType.DLP_ACTION);
            const tx = await txObj[0].tx();
            expect(tx.to).toEqual(wethGatewayAddress);
            expect(tx.from).toEqual(user);
            expect(tx.gasLimit).toEqual(ethers_1.BigNumber.from(1));
            const decoded = ethers_1.utils.defaultAbiCoder.decode(['address', 'uint256', 'uint256', 'address'], ethers_1.utils.hexDataSlice((_a = tx.data) !== null && _a !== void 0 ? _a : '', 4));
            expect(decoded[0]).toEqual(lendingPool);
            expect(decoded[1]).toEqual(ethers_1.BigNumber.from(utils_1.valueToWei(amount, 18)));
            expect(decoded[2]).toEqual(ethers_1.BigNumber.from(1));
            expect(decoded[3]).toEqual(user);
            // gas price
            const gasPrice = await txObj[0].gas();
            expect(gasPrice).not.toBeNull();
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasLimit).toEqual('1');
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasPrice).toEqual('1');
        });
        it('Expects to fail when initialized without gateway address', () => {
            const weth = new index_1.WETHGatewayService(provider, erc20Service);
            const txObj = weth.repayETH({
                lendingPool,
                user,
                amount,
                interestRateMode,
            });
            expect(txObj.length).toEqual(0);
        });
        it('Expects to fail when user is not address', () => {
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const user = 'asdf';
            expect(() => weth.repayETH({
                lendingPool,
                user,
                amount,
                interestRateMode,
            })).toThrowError(`Address: ${user} is not a valid ethereum Address`);
        });
        it('Expects to fail when lendingPool is not address', () => {
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const lendingPool = 'asdf';
            expect(() => weth.repayETH({
                lendingPool,
                user,
                amount,
                interestRateMode,
            })).toThrowError(`Address: ${lendingPool} is not a valid ethereum Address`);
        });
        it('Expects to fail when amount is not positive', () => {
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const amount = '0';
            expect(() => weth.repayETH({
                lendingPool,
                user,
                amount,
                interestRateMode,
            })).toThrowError(`Amount: ${amount} needs to be greater than 0`);
        });
        it('Expects to fail when amount is not number', () => {
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const amount = 'asdf';
            expect(() => weth.repayETH({
                lendingPool,
                user,
                amount,
                interestRateMode,
            })).toThrowError(`Amount: ${amount} needs to be greater than 0`);
        });
        it('Expects to fail when onBehalfOf is not address', () => {
            const weth = new index_1.WETHGatewayService(provider, erc20Service, wethGatewayAddress);
            const onBehalfOf = 'asdf';
            expect(() => weth.repayETH({
                lendingPool,
                user,
                amount,
                interestRateMode,
                onBehalfOf,
            })).toThrowError(`Address: ${onBehalfOf} is not a valid ethereum Address`);
        });
    });
});
//# sourceMappingURL=wethGateway.test.js.map