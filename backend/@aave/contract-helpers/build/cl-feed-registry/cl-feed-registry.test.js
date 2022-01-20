"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const index_1 = require("./index");
const mockInvalidEthereumAddress = '0x0';
const mockValidEthereumAddress = '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984';
describe('ChainlinkFeedsRegistry', () => {
    describe('initialize', () => {
        it('Should throw error if contract address is wrong', async () => {
            expect(() => new index_1.ChainlinkFeedsRegistry({
                provider: new ethers_1.providers.JsonRpcProvider(),
                chainlinkFeedsRegistry: mockInvalidEthereumAddress,
            })).toThrowError('contract address is not valid');
        });
        it('should get instantiated correctly', () => {
            const registry = new index_1.ChainlinkFeedsRegistry({
                provider: new ethers_1.providers.JsonRpcProvider(),
                chainlinkFeedsRegistry: mockValidEthereumAddress,
            });
            expect(registry instanceof index_1.ChainlinkFeedsRegistry).toEqual(true);
        });
    });
    describe('decimals', () => {
        const registry = new index_1.ChainlinkFeedsRegistry({
            provider: new ethers_1.providers.JsonRpcProvider(),
            chainlinkFeedsRegistry: mockValidEthereumAddress,
        });
        // @ts-expect-error readonly
        registry._registryContract = {
            decimals: jest.fn().mockImplementation(() => 1),
        };
        it('Should throw error if token address is wrong', async () => {
            await expect(registry.decimals(mockInvalidEthereumAddress, index_1.Denominations.eth)).rejects.toThrow('tokenAddress is not valid');
        });
        it('Should get the decimals', async () => {
            const decimals = await registry.decimals(mockValidEthereumAddress, index_1.Denominations.eth);
            expect(decimals).toEqual(1);
        });
    });
    describe('latestRoundData', () => {
        const registry = new index_1.ChainlinkFeedsRegistry({
            provider: new ethers_1.providers.JsonRpcProvider(),
            chainlinkFeedsRegistry: mockValidEthereumAddress,
        });
        // @ts-expect-error readonly
        registry._registryContract = {
            latestRoundData: jest.fn().mockImplementation(() => ({
                0: ethers_1.BigNumber.from(1),
                1: ethers_1.BigNumber.from(1),
                2: ethers_1.BigNumber.from(1),
                3: ethers_1.BigNumber.from(1),
                4: ethers_1.BigNumber.from(1),
            })),
        };
        it('Should throw error if token address is wrong', async () => {
            await expect(registry.latestRoundData(mockInvalidEthereumAddress, index_1.Denominations.eth)).rejects.toThrow('tokenAddress is not valid');
        });
        it('Should get the decimals', async () => {
            const latestAnswer = await registry.latestRoundData(mockValidEthereumAddress, index_1.Denominations.eth);
            expect(latestAnswer).toEqual({
                0: ethers_1.BigNumber.from(1),
                1: ethers_1.BigNumber.from(1),
                2: ethers_1.BigNumber.from(1),
                3: ethers_1.BigNumber.from(1),
                4: ethers_1.BigNumber.from(1),
            });
        });
    });
    describe('getPriceFeed', () => {
        const registry = new index_1.ChainlinkFeedsRegistry({
            provider: new ethers_1.providers.JsonRpcProvider(),
            chainlinkFeedsRegistry: mockValidEthereumAddress,
        });
        // @ts-expect-error readonly
        registry._registryContract = {
            decimals: jest.fn().mockImplementation(() => 1),
            latestRoundData: jest.fn().mockImplementation(() => ({
                0: ethers_1.BigNumber.from(1),
                1: ethers_1.BigNumber.from(2),
                2: ethers_1.BigNumber.from(3),
                3: ethers_1.BigNumber.from(4),
                4: ethers_1.BigNumber.from(5),
            })),
        };
        it('Should throw error if token address is wrong', async () => {
            await expect(registry.getPriceFeed(mockInvalidEthereumAddress, index_1.Denominations.eth)).rejects.toThrow('tokenAddress is not valid');
        });
        it('Should get the decimals', async () => {
            const priceFeed = await registry.getPriceFeed(mockValidEthereumAddress, index_1.Denominations.eth);
            expect(priceFeed).toEqual({
                answer: '2',
                updatedAt: 4,
                decimals: 1,
            });
        });
    });
});
//# sourceMappingURL=cl-feed-registry.test.js.map