"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const ISynthetix__factory_1 = require("./typechain/ISynthetix__factory");
const index_1 = require("./index");
describe('Synthetix', () => {
    describe('Initialization', () => {
        it('Expects to initialize correctly', () => {
            const provider = new ethers_1.providers.JsonRpcProvider();
            expect(() => new index_1.SynthetixService(provider));
        });
    });
    describe('synthetixValidation', () => {
        const provider = new ethers_1.providers.JsonRpcProvider();
        const user = '0x0000000000000000000000000000000000000001';
        const reserve = '0x0000000000000000000000000000000000000002';
        const amount = '1000000000000000000';
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('Expects to return true if not mainnet network', async () => {
            jest
                .spyOn(provider, 'getNetwork')
                .mockImplementation(async () => ({ name: 'matic', chainId: 137 }));
            const synth = new index_1.SynthetixService(provider);
            const valid = await synth.synthetixValidation({ user, reserve, amount });
            expect(valid).toEqual(true);
        });
        it('Expects to return true if not synthetix address on mainnet', async () => {
            jest
                .spyOn(provider, 'getNetwork')
                .mockImplementation(async () => ({ name: 'mainnet', chainId: 1 }));
            const synth = new index_1.SynthetixService(provider);
            const valid = await synth.synthetixValidation({ user, reserve, amount });
            expect(valid).toEqual(true);
        });
        it('Expects to return true if synthetix and amount < synthetix transferable amount', async () => {
            jest
                .spyOn(provider, 'getNetwork')
                .mockImplementation(async () => ({ name: 'mainnet', chainId: 1 }));
            const spy = jest.spyOn(ISynthetix__factory_1.ISynthetix__factory, 'connect').mockReturnValue({
                transferableSynthetix: async () => Promise.resolve(ethers_1.BigNumber.from(amount)),
            });
            const synth = new index_1.SynthetixService(provider);
            const smallAmount = '1000000000';
            const synthAddress = '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f';
            const valid = await synth.synthetixValidation({
                user,
                reserve: synthAddress,
                amount: smallAmount,
            });
            expect(spy).toHaveBeenCalled();
            expect(valid).toEqual(true);
        });
        it('Expects to return true if synthetix and amount = synthetix transferable amount', async () => {
            jest
                .spyOn(provider, 'getNetwork')
                .mockImplementation(async () => ({ name: 'mainnet', chainId: 1 }));
            const spy = jest.spyOn(ISynthetix__factory_1.ISynthetix__factory, 'connect').mockReturnValue({
                transferableSynthetix: async () => Promise.resolve(ethers_1.BigNumber.from(amount)),
            });
            const synth = new index_1.SynthetixService(provider);
            const synthAddress = '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f';
            const valid = await synth.synthetixValidation({
                user,
                reserve: synthAddress,
                amount,
            });
            expect(spy).toHaveBeenCalled();
            expect(valid).toEqual(true);
        });
        it('Expects to return false if synthetix and amount > synthetix transferable amount', async () => {
            jest
                .spyOn(provider, 'getNetwork')
                .mockImplementation(async () => ({ name: 'mainnet', chainId: 1 }));
            const spy = jest.spyOn(ISynthetix__factory_1.ISynthetix__factory, 'connect').mockReturnValue({
                transferableSynthetix: async () => Promise.resolve(ethers_1.BigNumber.from('100000')),
            });
            const synth = new index_1.SynthetixService(provider);
            const synthAddress = '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f';
            const valid = await synth.synthetixValidation({
                user,
                reserve: synthAddress,
                amount,
            });
            expect(spy).toHaveBeenCalled();
            expect(valid).toEqual(false);
        });
    });
});
//# sourceMappingURL=synthetix.test.js.map