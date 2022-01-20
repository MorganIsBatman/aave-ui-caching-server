"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const types_1 = require("../commons/types");
const utils_1 = require("../commons/utils");
const IERC20Detailed__factory_1 = require("./typechain/IERC20Detailed__factory");
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
describe('ERC20Service', () => {
    const provider = new ethers_1.providers.JsonRpcProvider();
    jest
        .spyOn(provider, 'getGasPrice')
        .mockImplementation(async () => Promise.resolve(ethers_1.BigNumber.from(1)));
    describe('Initialize', () => {
        it('Expects to be initialized correctly', () => {
            const instance = new index_1.ERC20Service(provider);
            expect(instance instanceof index_1.ERC20Service).toEqual(true);
        });
    });
    describe('approve', () => {
        const erc20Service = new index_1.ERC20Service(provider);
        const user = '0x0000000000000000000000000000000000000001';
        const token = '0x0000000000000000000000000000000000000002';
        const spender = '0x0000000000000000000000000000000000000003';
        const amount = '1000000000000000000';
        it('Expects to get the approval txObj with correct params', async () => {
            var _a;
            const erc20Service = new index_1.ERC20Service(provider);
            const txObj = erc20Service.approve({
                user,
                token,
                spender,
                amount,
            });
            expect(txObj.txType).toEqual(types_1.eEthereumTxType.ERC20_APPROVAL);
            const tx = await txObj.tx();
            expect(tx.to).toEqual(token);
            expect(tx.from).toEqual(user);
            expect(tx.gasLimit).toEqual(ethers_1.BigNumber.from(1));
            const decoded = ethers_1.utils.defaultAbiCoder.decode(['address', 'uint256'], ethers_1.utils.hexDataSlice((_a = tx.data) !== null && _a !== void 0 ? _a : '', 4));
            expect(decoded[0]).toEqual(spender);
            expect(decoded[1]).toEqual(ethers_1.BigNumber.from(amount));
            // gas price
            const gasPrice = await txObj.gas();
            expect(gasPrice).not.toBeNull();
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasLimit).toEqual('1');
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasPrice).toEqual('1');
        });
        it('Expects to fail when user is not address', () => {
            const user = 'asdf';
            expect(() => erc20Service.approve({
                user,
                token,
                spender,
                amount,
            })).toThrowError(new Error(`Address: ${user} is not a valid ethereum Address`));
        });
        it('Expects to fail when token is not address', () => {
            const token = 'asdf';
            expect(() => erc20Service.approve({
                user,
                token,
                spender,
                amount,
            })).toThrowError(new Error(`Address: ${token} is not a valid ethereum Address`));
        });
        it('Expects to fail when spender is not address', () => {
            const spender = 'asdf';
            expect(() => erc20Service.approve({
                user,
                token,
                spender,
                amount,
            })).toThrowError(new Error(`Address: ${spender} is not a valid ethereum Address`));
        });
        it('Expects to fail when amount is not positive > 0', () => {
            const amount = '0';
            expect(() => erc20Service.approve({
                user,
                token,
                spender,
                amount,
            })).toThrowError(new Error(`Amount: ${amount} needs to be greater than 0`));
        });
        it('Expects to fail when amount is not a number', () => {
            const amount = 'asdf';
            expect(() => erc20Service.approve({
                user,
                token,
                spender,
                amount,
            })).toThrowError(new Error(`Amount: ${amount} needs to be greater than 0`));
        });
    });
    describe('isApproved', () => {
        const user = '0x0000000000000000000000000000000000000001';
        const token = '0x0000000000000000000000000000000000000002';
        const spender = '0x0000000000000000000000000000000000000003';
        const amount = '123.3';
        // mock erc20 service decimalsOf method
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('Expects to return true if token is eth mock address', async () => {
            const erc20Service = new index_1.ERC20Service(provider);
            const token = utils_1.API_ETH_MOCK_ADDRESS;
            const isApproved = await erc20Service.isApproved({
                user,
                token,
                spender,
                amount,
            });
            expect(isApproved).toEqual(true);
        });
        it('Expects to be approved with correct params', async () => {
            jest.spyOn(IERC20Detailed__factory_1.IERC20Detailed__factory, 'connect').mockReturnValue({
                allowance: async () => Promise.resolve(ethers_1.BigNumber.from('100000000000000000')),
            });
            const erc20Service = new index_1.ERC20Service(provider);
            const decimalsSpy = jest
                .spyOn(erc20Service, 'decimalsOf')
                .mockImplementation(async () => Promise.resolve(6));
            const isApproved = await erc20Service.isApproved({
                user,
                token,
                spender,
                amount,
            });
            expect(decimalsSpy).toHaveBeenCalled();
            expect(isApproved).toEqual(true);
        });
        it('Expects to not be approved with correct params', async () => {
            jest.spyOn(IERC20Detailed__factory_1.IERC20Detailed__factory, 'connect').mockReturnValue({
                allowance: async () => Promise.resolve(ethers_1.BigNumber.from('100000')),
            });
            const erc20Service = new index_1.ERC20Service(provider);
            const decimalsSpy = jest
                .spyOn(erc20Service, 'decimalsOf')
                .mockImplementation(async () => Promise.resolve(6));
            const isApproved = await erc20Service.isApproved({
                user,
                token,
                spender,
                amount,
            });
            expect(decimalsSpy).toHaveBeenCalled();
            expect(isApproved).toEqual(false);
        });
        it('Expects to get the approval txObj with correct params and -1 amount and max allowance', async () => {
            jest.spyOn(IERC20Detailed__factory_1.IERC20Detailed__factory, 'connect').mockReturnValue({
                allowance: async () => Promise.resolve(ethers_1.BigNumber.from(ethers_1.constants.MaxUint256)),
            });
            const erc20Service = new index_1.ERC20Service(provider);
            const decimalsSpy = jest
                .spyOn(erc20Service, 'decimalsOf')
                .mockImplementation(async () => Promise.resolve(6));
            const amount = '-1';
            const isApproved = await erc20Service.isApproved({
                user,
                token,
                spender,
                amount,
            });
            expect(decimalsSpy).toHaveBeenCalled();
            expect(isApproved).toEqual(true);
        });
        it('Expects to fail when user is not address', async () => {
            const erc20Service = new index_1.ERC20Service(provider);
            const user = 'asdf';
            await expect(async () => erc20Service.isApproved({
                user,
                token,
                spender,
                amount,
            })).rejects.toThrowError(new Error(`Address: ${user} is not a valid ethereum Address`));
        });
        it('Expects to fail when token is not address', async () => {
            const erc20Service = new index_1.ERC20Service(provider);
            const token = 'asdf';
            await expect(async () => erc20Service.isApproved({
                user,
                token,
                spender,
                amount,
            })).rejects.toThrowError(new Error(`Address: ${token} is not a valid ethereum Address`));
        });
        it('Expects to fail when spender is not address', async () => {
            const erc20Service = new index_1.ERC20Service(provider);
            const spender = 'asdf';
            await expect(async () => erc20Service.isApproved({
                user,
                token,
                spender,
                amount,
            })).rejects.toThrowError(new Error(`Address: ${spender} is not a valid ethereum Address`));
        });
        it('Expects to fail when amount is not positive > 0 or -1', async () => {
            const erc20Service = new index_1.ERC20Service(provider);
            const amount = '0';
            await expect(async () => erc20Service.isApproved({
                user,
                token,
                spender,
                amount,
            })).rejects.toThrowError(new Error(`Amount: ${amount} needs to be greater than 0 or -1`));
        });
        it('Expects to fail when amount is not number', async () => {
            const erc20Service = new index_1.ERC20Service(provider);
            const amount = 'asdf';
            await expect(async () => erc20Service.isApproved({
                user,
                token,
                spender,
                amount,
            })).rejects.toThrowError(new Error(`Amount: ${amount} needs to be greater than 0 or -1`));
        });
    });
    describe('decimalsOf', () => {
        const erc20Service = new index_1.ERC20Service(provider);
        const address = '0x0000000000000000000000000000000000000001';
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('Expects 18 if mocked eth address', async () => {
            const decimals = await erc20Service.decimalsOf(utils_1.API_ETH_MOCK_ADDRESS);
            expect(decimals).toEqual(18);
        });
        it('Expect to get the decimals from the contract if not eth mock and not called previously with same address', async () => {
            jest.spyOn(IERC20Detailed__factory_1.IERC20Detailed__factory, 'connect').mockReturnValue({
                decimals: async () => Promise.resolve(6),
            });
            const decimals = await erc20Service.decimalsOf(address);
            expect(decimals).toEqual(6);
        });
        it('Expects to return already saved decimals if not eth mock', async () => {
            const spy = jest
                .spyOn(IERC20Detailed__factory_1.IERC20Detailed__factory, 'connect')
                .mockReturnValue({
                decimals: async () => Promise.resolve(6),
            });
            const erc20Service = new index_1.ERC20Service(provider);
            const decimals = await erc20Service.decimalsOf(address);
            const decimals2 = await erc20Service.decimalsOf(address);
            expect(spy).toHaveBeenCalledTimes(1);
            expect(decimals).toEqual(6);
            expect(decimals2).toEqual(decimals);
        });
    });
    describe('getTokenData', () => {
        const erc20Service = new index_1.ERC20Service(provider);
        const token = '0x0000000000000000000000000000000000000001';
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('Expects to get ethereum data with mock address', async () => {
            const tokenData = await erc20Service.getTokenData(utils_1.API_ETH_MOCK_ADDRESS);
            expect(tokenData.name).toEqual('Ethereum');
            expect(tokenData.symbol).toEqual('ETH');
            expect(tokenData.decimals).toEqual(18);
            expect(tokenData.address).toEqual(utils_1.API_ETH_MOCK_ADDRESS);
        });
        it('Expects to get Maker data with maker address', async () => {
            const token = '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2';
            const tokenData = await erc20Service.getTokenData(token);
            expect(tokenData.name).toEqual('Maker');
            expect(tokenData.symbol).toEqual('MKR');
            expect(tokenData.decimals).toEqual(18);
            expect(tokenData.address).toEqual(token);
        });
        it('Expects to get data from contract when using other address', async () => {
            const spy = jest
                .spyOn(IERC20Detailed__factory_1.IERC20Detailed__factory, 'connect')
                .mockReturnValue({
                decimals: async () => Promise.resolve(18),
                symbol: async () => Promise.resolve('AMPL'),
                name: async () => Promise.resolve('Ampleforth'),
            });
            const erc20Service = new index_1.ERC20Service(provider);
            const tokenData = await erc20Service.getTokenData(token);
            expect(spy).toHaveBeenCalled();
            expect(tokenData.name).toEqual('Ampleforth');
            expect(tokenData.symbol).toEqual('AMPL');
            expect(tokenData.decimals).toEqual(18);
            expect(tokenData.address).toEqual(token);
        });
        it('Expects to return saved data when using repeated address', async () => {
            const spy = jest
                .spyOn(IERC20Detailed__factory_1.IERC20Detailed__factory, 'connect')
                .mockReturnValue({
                decimals: async () => Promise.resolve(18),
                symbol: async () => Promise.resolve('AMPL'),
                name: async () => Promise.resolve('Ampleforth'),
            });
            const erc20Service = new index_1.ERC20Service(provider);
            jest
                .spyOn(erc20Service, 'decimalsOf')
                .mockImplementation(async () => Promise.resolve(18));
            const tokenData = await erc20Service.getTokenData(token);
            const tokenData2 = await erc20Service.getTokenData(token);
            expect(spy).toHaveBeenCalledTimes(1);
            expect(tokenData2).toEqual(tokenData);
            expect(tokenData2.name).toEqual('Ampleforth');
            expect(tokenData2.symbol).toEqual('AMPL');
            expect(tokenData2.decimals).toEqual(18);
            expect(tokenData2.address).toEqual(token);
        });
    });
});
//# sourceMappingURL=erc20.test.js.map