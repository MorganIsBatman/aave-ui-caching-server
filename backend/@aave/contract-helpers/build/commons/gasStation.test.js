"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const gasStation_1 = require("./gasStation");
describe('gasStation', () => {
    const provider = new ethers_1.providers.JsonRpcProvider();
    const tx = {};
    jest
        .spyOn(provider, 'estimateGas')
        .mockImplementation(async () => Promise.resolve(ethers_1.BigNumber.from(100)));
    jest
        .spyOn(provider, 'getNetwork')
        .mockImplementation(async () => Promise.resolve({ chainId: 1, name: 'mainnet' }));
    describe('estimateGas', () => {
        it('Expects to use default surplus', async () => {
            const gas = await gasStation_1.estimateGas(tx, provider);
            expect(gas).toEqual(ethers_1.BigNumber.from(130));
        });
        it('Expects to use specified surplus', async () => {
            const gas = await gasStation_1.estimateGas(tx, provider, 10);
            expect(gas).toEqual(ethers_1.BigNumber.from(110));
        });
    });
    describe('estimateGasByNetwork', () => {
        it('Expects to use polygon surplus', async () => {
            jest
                .spyOn(provider, 'getNetwork')
                .mockImplementationOnce(async () => Promise.resolve({ chainId: 137, name: 'matic' }));
            const gas = await gasStation_1.estimateGasByNetwork(tx, provider);
            expect(gas).toEqual(ethers_1.BigNumber.from(160));
        });
        it('Expects to use default surplus', async () => {
            const gas = await gasStation_1.estimateGasByNetwork(tx, provider);
            expect(gas).toEqual(ethers_1.BigNumber.from(130));
        });
        it('Expects to use specified surplus', async () => {
            const gas = await gasStation_1.estimateGasByNetwork(tx, provider, 10);
            expect(gas).toEqual(ethers_1.BigNumber.from(110));
        });
    });
});
//# sourceMappingURL=gasStation.test.js.map