"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const IERC202612__factory_1 = require("./typechain/IERC202612__factory");
const index_1 = require("./index");
describe('ERC20_2612', () => {
    const provider = new ethers_1.providers.JsonRpcProvider();
    jest
        .spyOn(provider, 'getGasPrice')
        .mockImplementation(async () => Promise.resolve(ethers_1.BigNumber.from(1)));
    describe('Initialize', () => {
        it('Expects to be initialized correctly', () => {
            const instance = new index_1.ERC20_2612Service(provider);
            expect(instance instanceof index_1.ERC20_2612Service).toEqual(true);
        });
    });
    describe('getNonce', () => {
        const token = '0x0000000000000000000000000000000000000001';
        const owner = '0x0000000000000000000000000000000000000002';
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('Expects to get Nonce from nonces method', async () => {
            const nonceSpy = jest
                .spyOn(IERC202612__factory_1.IERC202612__factory, 'connect')
                .mockReturnValue({
                nonces: async () => Promise.resolve(ethers_1.BigNumber.from('1')),
            });
            const instance = new index_1.ERC20_2612Service(provider);
            const nonce = await instance.getNonce({ token, owner });
            expect(nonce).toEqual(1);
            expect(nonceSpy).toHaveBeenCalled();
        });
        it('Expects to get nonce from _nonces method if nonces fails', async () => {
            const nonceSpy = jest
                .spyOn(IERC202612__factory_1.IERC202612__factory, 'connect')
                .mockReturnValue({
                nonces: async () => Promise.reject(),
                _nonces: async () => Promise.resolve(ethers_1.BigNumber.from('1')),
            });
            const instance = new index_1.ERC20_2612Service(provider);
            const nonce = await instance.getNonce({ token, owner });
            expect(nonce).toEqual(1);
            expect(nonceSpy).toHaveBeenCalledTimes(1);
        });
        it('Expects to get null nonce if nonces and _nonces fails', async () => {
            const nonceSpy = jest
                .spyOn(IERC202612__factory_1.IERC202612__factory, 'connect')
                .mockReturnValue({
                nonces: async () => Promise.reject(),
                _nonces: async () => Promise.reject(),
            });
            const instance = new index_1.ERC20_2612Service(provider);
            const nonce = await instance.getNonce({ token, owner });
            expect(nonce).toEqual(null);
            expect(nonceSpy).toHaveBeenCalledTimes(1);
        });
        it('Expects to fail if token is not eth address', async () => {
            const instance = new index_1.ERC20_2612Service(provider);
            const token = 'asdf';
            await expect(async () => instance.getNonce({ token, owner })).rejects.toThrowError(new Error(`Address: ${token} is not a valid ethereum Address`));
        });
        it('Expects to fail if owner is not eth address', async () => {
            const instance = new index_1.ERC20_2612Service(provider);
            const owner = 'asdf';
            await expect(async () => instance.getNonce({ token, owner })).rejects.toThrowError(new Error(`Address: ${owner} is not a valid ethereum Address`));
        });
    });
});
//# sourceMappingURL=erc20_2612.test.js.map