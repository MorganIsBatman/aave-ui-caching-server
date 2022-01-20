"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const utils_1 = require("ts-jest/utils");
const index_1 = require("../cl-feed-registry/index");
const ChainlinkFeedsRegistryTypes_1 = require("../cl-feed-registry/types/ChainlinkFeedsRegistryTypes");
const _mocks_1 = require("./_mocks");
const IUiIncentiveDataProviderV3__factory_1 = require("./typechain/IUiIncentiveDataProviderV3__factory");
const index_2 = require("./index");
jest.mock('../cl-feed-registry/index', () => {
    const clInstance = { getPriceFeed: jest.fn() };
    const cl = jest.fn(() => clInstance);
    return { ChainlinkFeedsRegistry: cl };
});
describe('UiIncentiveDataProvider', () => {
    const provider = new ethers_1.providers.JsonRpcProvider();
    const user = '0x0000000000000000000000000000000000000001';
    const lendingPoolAddressProvider = '0x0000000000000000000000000000000000000002';
    const uiIncentiveDataProviderAddress = '0x0000000000000000000000000000000000000003';
    describe('creating', () => {
        it('Expects to initialize', () => {
            const instance = new index_2.UiIncentiveDataProvider({
                uiIncentiveDataProviderAddress,
                provider: new ethers_1.providers.JsonRpcProvider(),
            });
            expect(instance instanceof index_2.UiIncentiveDataProvider).toEqual(true);
        });
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('getFullReservesIncentiveData', () => {
        const instance = new index_2.UiIncentiveDataProvider({
            uiIncentiveDataProviderAddress,
            provider,
        });
        it('should throw if uiIncentiveDataProvider is not a valid ethereum address', async () => {
            const instance = new index_2.UiIncentiveDataProvider({
                uiIncentiveDataProviderAddress: 'asdf',
                provider,
            });
            await expect(async () => instance.getFullReservesIncentiveData({
                user,
                lendingPoolAddressProvider,
            })).rejects.toThrowError('UiIncentiveDataProviderAddress must be an eth valid address');
        });
        it('should throw if user is not a valid ethereum address', async () => {
            const user = 'asdf';
            await expect(async () => instance.getFullReservesIncentiveData({
                user,
                lendingPoolAddressProvider,
            })).rejects.toThrowError(`Address: ${user} is not a valid ethereum Address`);
        });
        it('should throw if lending pool address is not a valid ethereum address', async () => {
            const lendingPoolAddressProvider = 'asdf';
            await expect(async () => instance.getFullReservesIncentiveData({
                user,
                lendingPoolAddressProvider,
            })).rejects.toThrowError(`Address: ${lendingPoolAddressProvider} is not a valid ethereum Address`);
        });
        it('should not throw if user and lending pool address provider is a valid ethereum address', async () => {
            const spy = jest
                .spyOn(IUiIncentiveDataProviderV3__factory_1.IUiIncentiveDataProviderV3__factory, 'connect')
                .mockReturnValue({
                getFullReservesIncentiveData: async () => Promise.resolve({}),
            });
            await instance.getFullReservesIncentiveData({
                user,
                lendingPoolAddressProvider,
            });
            expect(spy).toHaveBeenCalled();
        });
    });
    describe('getReservesIncentivesData', () => {
        const instance = new index_2.UiIncentiveDataProvider({
            uiIncentiveDataProviderAddress,
            provider,
        });
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('should throw if uiIncentiveDataProvider is not a valid ethereum address', async () => {
            const instance = new index_2.UiIncentiveDataProvider({
                uiIncentiveDataProviderAddress: 'asdf',
                provider,
            });
            await expect(async () => instance.getReservesIncentivesData(lendingPoolAddressProvider)).rejects.toThrowError('UiIncentiveDataProviderAddress must be an eth valid address');
        });
        it('should throw if lending pool address is not a valid ethereum address', async () => {
            const lendingPoolAddressProvider = 'asdf';
            await expect(async () => instance.getReservesIncentivesData(lendingPoolAddressProvider)).rejects.toThrow(`Address: ${lendingPoolAddressProvider} is not a valid ethereum Address`);
        });
        it('should not throw', async () => {
            const spy = jest
                .spyOn(IUiIncentiveDataProviderV3__factory_1.IUiIncentiveDataProviderV3__factory, 'connect')
                .mockReturnValue({
                getReservesIncentivesData: async () => Promise.resolve(_mocks_1.getReservesIncentivesDataMock),
            });
            await instance.getReservesIncentivesData(lendingPoolAddressProvider);
            expect(spy).toHaveBeenCalled();
        });
    });
    describe('getUserReserves', () => {
        const instance = new index_2.UiIncentiveDataProvider({
            uiIncentiveDataProviderAddress,
            provider,
        });
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('should throw if uiIncentiveDataProvider is not a valid ethereum address', async () => {
            const instance = new index_2.UiIncentiveDataProvider({
                uiIncentiveDataProviderAddress: 'asdf',
                provider,
            });
            await expect(async () => instance.getUserReservesIncentivesData({
                lendingPoolAddressProvider,
                user,
            })).rejects.toThrowError('UiIncentiveDataProviderAddress must be an eth valid address');
        });
        it('should throw if lending pool address provider is not a valid ethereum address', async () => {
            const lendingPoolAddressProvider = 'asdf';
            await expect(async () => instance.getUserReservesIncentivesData({
                lendingPoolAddressProvider,
                user,
            })).rejects.toThrow(`Address: ${lendingPoolAddressProvider} is not a valid ethereum Address`);
        });
        it('should throw if user is not a valid ethereum address', async () => {
            const user = 'asdf';
            await expect(async () => instance.getUserReservesIncentivesData({
                lendingPoolAddressProvider,
                user,
            })).rejects.toThrow(`Address: ${user} is not a valid ethereum Address`);
        });
        it('should not throw if user is a valid ethereum address', async () => {
            const spy = jest
                .spyOn(IUiIncentiveDataProviderV3__factory_1.IUiIncentiveDataProviderV3__factory, 'connect')
                .mockReturnValue({
                getUserReservesIncentivesData: async () => Promise.resolve(_mocks_1.getUserIncentivesDataMock),
            });
            await instance.getUserReservesIncentivesData({
                lendingPoolAddressProvider,
                user,
            });
            expect(spy).toHaveBeenCalled();
        });
    });
    describe('getReservesIncentivesDataHumanized', () => {
        const instance = new index_2.UiIncentiveDataProvider({
            uiIncentiveDataProviderAddress,
            provider,
        });
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('should throw if uiIncentiveDataProvider is not a valid ethereum address', async () => {
            const instance = new index_2.UiIncentiveDataProvider({
                uiIncentiveDataProviderAddress: 'asdf',
                provider,
            });
            await expect(async () => instance.getReservesIncentivesDataHumanized(lendingPoolAddressProvider)).rejects.toThrowError('UiIncentiveDataProviderAddress must be an eth valid address');
        });
        it('Expects to fail if lendingPoolAddressProvider not an eth address', async () => {
            const lendingPoolAddressProvider = 'asdf';
            await expect(async () => instance.getReservesIncentivesDataHumanized(lendingPoolAddressProvider)).rejects.toThrow(`Address: ${lendingPoolAddressProvider} is not a valid ethereum Address`);
        });
        it('Expects to parse the incentives response to a human readable object', async () => {
            const spy = jest
                .spyOn(IUiIncentiveDataProviderV3__factory_1.IUiIncentiveDataProviderV3__factory, 'connect')
                .mockReturnValue({
                getReservesIncentivesData: async () => Promise.resolve(_mocks_1.getReservesIncentivesDataMock),
            });
            const data = await instance.getReservesIncentivesDataHumanized(lendingPoolAddressProvider);
            expect(spy).toHaveBeenCalled();
            expect(data).toEqual([
                {
                    underlyingAsset: '0xb04Aaa2A73ff3D88950BdF19Eb4AC029630a2367'.toLowerCase(),
                    aIncentiveData: {
                        tokenAddress: '0x6d0eeb7b37BF26E182EB9a8631DCF79e4EF43DDd',
                        incentiveControllerAddress: '0x5465485D7b15CaBc9196E73A0b1cc457262079e3',
                        rewardsTokenInformation: [
                            {
                                rewardTokenSymbol: 'REW',
                                rewardTokenAddress: '0x1f689325CBdF44B24DBE2ecC2b1fFD4130861b4E',
                                rewardOracleAddress: '0xca8e9B5F9e36EbF74096223fc48810861b4FA642',
                                emissionPerSecond: ethers_1.BigNumber.from({
                                    _hex: '0x04464ecbc45ffe',
                                    _isBigNumber: true,
                                }).toString(),
                                incentivesLastUpdateTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x61a5167a',
                                    _isBigNumber: true,
                                }).toNumber(),
                                tokenIncentivesIndex: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                emissionEndTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x638649fa',
                                    _isBigNumber: true,
                                }).toNumber(),
                                rewardPriceFeed: ethers_1.BigNumber.from({
                                    _hex: '0x05f5e100',
                                    _isBigNumber: true,
                                }).toString(),
                                rewardTokenDecimals: 18,
                                precision: 18,
                                priceFeedDecimals: 0,
                            },
                        ],
                    },
                    vIncentiveData: {
                        tokenAddress: '0xaD99ef885623E8520f631625b2675d6dAd3aaDC1',
                        incentiveControllerAddress: '0x5465485D7b15CaBc9196E73A0b1cc457262079e3',
                        rewardsTokenInformation: [
                            {
                                rewardTokenSymbol: 'REW',
                                rewardTokenAddress: '0x1f689325CBdF44B24DBE2ecC2b1fFD4130861b4E',
                                rewardOracleAddress: '0xca8e9B5F9e36EbF74096223fc48810861b4FA642',
                                emissionPerSecond: ethers_1.BigNumber.from({
                                    _hex: '0x04464ecbc45ffe',
                                    _isBigNumber: true,
                                }).toString(),
                                incentivesLastUpdateTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x61a5167a',
                                    _isBigNumber: true,
                                }).toNumber(),
                                tokenIncentivesIndex: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                emissionEndTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x638649fa',
                                    _isBigNumber: true,
                                }).toNumber(),
                                rewardPriceFeed: ethers_1.BigNumber.from({
                                    _hex: '0x05f5e100',
                                    _isBigNumber: true,
                                }).toString(),
                                rewardTokenDecimals: 18,
                                precision: 18,
                                priceFeedDecimals: 0,
                            },
                        ],
                    },
                    sIncentiveData: {
                        tokenAddress: '0xb2007801F8c9dB4241E12C81E9d83741d14d7227',
                        incentiveControllerAddress: '0x5465485D7b15CaBc9196E73A0b1cc457262079e3',
                        rewardsTokenInformation: [
                            {
                                rewardTokenSymbol: 'REW',
                                rewardTokenAddress: '0x1f689325CBdF44B24DBE2ecC2b1fFD4130861b4E',
                                rewardOracleAddress: '0xca8e9B5F9e36EbF74096223fc48810861b4FA642',
                                emissionPerSecond: ethers_1.BigNumber.from({
                                    _hex: '0x04464ecbc45ffe',
                                    _isBigNumber: true,
                                }).toString(),
                                incentivesLastUpdateTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x61a5167a',
                                    _isBigNumber: true,
                                }).toNumber(),
                                tokenIncentivesIndex: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                emissionEndTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x638649fa',
                                    _isBigNumber: true,
                                }).toNumber(),
                                rewardPriceFeed: ethers_1.BigNumber.from({
                                    _hex: '0x05f5e100',
                                    _isBigNumber: true,
                                }).toString(),
                                rewardTokenDecimals: 18,
                                precision: 18,
                                priceFeedDecimals: 0,
                            },
                        ],
                    },
                },
            ]);
        });
    });
    describe('getUserReservesIncentivesDataHumanized', () => {
        const instance = new index_2.UiIncentiveDataProvider({
            uiIncentiveDataProviderAddress,
            provider,
        });
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('should throw if uiIncentiveDataProvider is not a valid ethereum address', async () => {
            const instance = new index_2.UiIncentiveDataProvider({
                uiIncentiveDataProviderAddress: 'asdf',
                provider,
            });
            await expect(async () => instance.getUserReservesIncentivesDataHumanized({
                lendingPoolAddressProvider,
                user,
            })).rejects.toThrowError('UiIncentiveDataProviderAddress must be an eth valid address');
        });
        it('Expects to fail if lendingPoolAddressProvider not an eth address', async () => {
            const lendingPoolAddressProvider = 'asdf';
            await expect(async () => instance.getUserReservesIncentivesDataHumanized({
                lendingPoolAddressProvider,
                user,
            })).rejects.toThrow(`Address: ${lendingPoolAddressProvider} is not a valid ethereum Address`);
        });
        it('Expects to fail if user not an eth address', async () => {
            const user = 'asdf';
            await expect(async () => instance.getUserReservesIncentivesDataHumanized({
                lendingPoolAddressProvider,
                user,
            })).rejects.toThrow(`Address: ${user} is not a valid ethereum Address`);
        });
        it('should work with finding only', async () => {
            const spy = jest
                .spyOn(IUiIncentiveDataProviderV3__factory_1.IUiIncentiveDataProviderV3__factory, 'connect')
                .mockReturnValue({
                getUserReservesIncentivesData: async () => Promise.resolve(_mocks_1.getUserIncentivesDataMock),
            });
            const response = await instance.getUserReservesIncentivesDataHumanized({
                lendingPoolAddressProvider,
                user,
            });
            expect(spy).toHaveBeenCalled();
            expect(response).toEqual([
                {
                    underlyingAsset: '0xb04Aaa2A73ff3D88950BdF19Eb4AC029630a2367'.toLowerCase(),
                    aTokenIncentivesUserData: {
                        tokenAddress: '0x6d0eeb7b37BF26E182EB9a8631DCF79e4EF43DDd',
                        incentiveControllerAddress: '0x5465485D7b15CaBc9196E73A0b1cc457262079e3',
                        userRewardsInformation: [
                            {
                                rewardTokenSymbol: 'REW',
                                rewardOracleAddress: '0xca8e9B5F9e36EbF74096223fc48810861b4FA642',
                                rewardTokenAddress: '0x1f689325CBdF44B24DBE2ecC2b1fFD4130861b4E',
                                userUnclaimedRewards: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                tokenIncentivesUserIndex: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                rewardPriceFeed: ethers_1.BigNumber.from({
                                    _hex: '0x05f5e100',
                                    _isBigNumber: true,
                                }).toString(),
                                priceFeedDecimals: 0,
                                rewardTokenDecimals: 18,
                            },
                        ],
                    },
                    vTokenIncentivesUserData: {
                        tokenAddress: '0xaD99ef885623E8520f631625b2675d6dAd3aaDC1',
                        incentiveControllerAddress: '0x5465485D7b15CaBc9196E73A0b1cc457262079e3',
                        userRewardsInformation: [
                            {
                                rewardTokenSymbol: 'REW',
                                rewardOracleAddress: '0xca8e9B5F9e36EbF74096223fc48810861b4FA642',
                                rewardTokenAddress: '0x1f689325CBdF44B24DBE2ecC2b1fFD4130861b4E',
                                userUnclaimedRewards: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                tokenIncentivesUserIndex: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                rewardPriceFeed: ethers_1.BigNumber.from({
                                    _hex: '0x05f5e100',
                                    _isBigNumber: true,
                                }).toString(),
                                priceFeedDecimals: 0,
                                rewardTokenDecimals: 18,
                            },
                        ],
                    },
                    sTokenIncentivesUserData: {
                        tokenAddress: '0xb2007801F8c9dB4241E12C81E9d83741d14d7227',
                        incentiveControllerAddress: '0x5465485D7b15CaBc9196E73A0b1cc457262079e3',
                        userRewardsInformation: [],
                    },
                },
            ]);
        });
    });
    describe('getIncentivesDataWithPrice', () => {
        const instance = new index_2.UiIncentiveDataProvider({
            uiIncentiveDataProviderAddress,
            provider,
        });
        const chainlinkFeedsRegistry = '0x0000000000000000000000000000000000000004';
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('should throw if uiIncentiveDataProvider is not a valid ethereum address', async () => {
            const instance = new index_2.UiIncentiveDataProvider({
                uiIncentiveDataProviderAddress: 'asdf',
                provider,
            });
            await expect(async () => instance.getIncentivesDataWithPriceLegacy({
                lendingPoolAddressProvider,
            })).rejects.toThrowError('UiIncentiveDataProviderAddress must be an eth valid address');
        });
        it('Expects to fail if lendingPoolAddressProvider not an eth address', async () => {
            const lendingPoolAddressProvider = 'asdf';
            await expect(async () => instance.getIncentivesDataWithPriceLegacy({
                lendingPoolAddressProvider,
            })).rejects.toThrow(`Address: ${lendingPoolAddressProvider} is not a valid ethereum Address`);
        });
        it('should work with no feed', async () => {
            const clInstance = new index_1.ChainlinkFeedsRegistry({
                chainlinkFeedsRegistry,
                provider,
            });
            utils_1.mocked(clInstance).getPriceFeed.mockReturnValue(Promise.reject());
            const spy = jest
                .spyOn(IUiIncentiveDataProviderV3__factory_1.IUiIncentiveDataProviderV3__factory, 'connect')
                .mockReturnValue({
                getReservesIncentivesData: async () => Promise.resolve(_mocks_1.getReservesIncentivesDataMock),
            });
            const result = await instance.getIncentivesDataWithPriceLegacy({
                lendingPoolAddressProvider,
                chainlinkFeedsRegistry,
                quote: ChainlinkFeedsRegistryTypes_1.Denominations.eth,
            });
            expect(spy).toBeCalled();
            expect(clInstance.getPriceFeed).toBeCalled();
            expect(result).toEqual([
                {
                    underlyingAsset: '0xb04Aaa2A73ff3D88950BdF19Eb4AC029630a2367'.toLowerCase(),
                    aIncentiveData: {
                        tokenAddress: '0x6d0eeb7b37BF26E182EB9a8631DCF79e4EF43DDd',
                        incentiveControllerAddress: '0x5465485D7b15CaBc9196E73A0b1cc457262079e3',
                        rewardsTokenInformation: [
                            {
                                rewardTokenSymbol: 'REW',
                                rewardTokenAddress: '0x1f689325CBdF44B24DBE2ecC2b1fFD4130861b4E',
                                rewardOracleAddress: '0xca8e9B5F9e36EbF74096223fc48810861b4FA642',
                                emissionPerSecond: ethers_1.BigNumber.from({
                                    _hex: '0x04464ecbc45ffe',
                                    _isBigNumber: true,
                                }).toString(),
                                incentivesLastUpdateTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x61a5167a',
                                    _isBigNumber: true,
                                }).toNumber(),
                                tokenIncentivesIndex: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                emissionEndTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x638649fa',
                                    _isBigNumber: true,
                                }).toNumber(),
                                rewardPriceFeed: ethers_1.BigNumber.from({
                                    _hex: '0x05f5e100',
                                    _isBigNumber: true,
                                }).toString(),
                                rewardTokenDecimals: 18,
                                precision: 18,
                                priceFeedDecimals: 0,
                            },
                        ],
                    },
                    vIncentiveData: {
                        tokenAddress: '0xaD99ef885623E8520f631625b2675d6dAd3aaDC1',
                        incentiveControllerAddress: '0x5465485D7b15CaBc9196E73A0b1cc457262079e3',
                        rewardsTokenInformation: [
                            {
                                rewardTokenSymbol: 'REW',
                                rewardTokenAddress: '0x1f689325CBdF44B24DBE2ecC2b1fFD4130861b4E',
                                rewardOracleAddress: '0xca8e9B5F9e36EbF74096223fc48810861b4FA642',
                                emissionPerSecond: ethers_1.BigNumber.from({
                                    _hex: '0x04464ecbc45ffe',
                                    _isBigNumber: true,
                                }).toString(),
                                incentivesLastUpdateTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x61a5167a',
                                    _isBigNumber: true,
                                }).toNumber(),
                                tokenIncentivesIndex: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                emissionEndTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x638649fa',
                                    _isBigNumber: true,
                                }).toNumber(),
                                rewardPriceFeed: ethers_1.BigNumber.from({
                                    _hex: '0x05f5e100',
                                    _isBigNumber: true,
                                }).toString(),
                                rewardTokenDecimals: 18,
                                precision: 18,
                                priceFeedDecimals: 0,
                            },
                        ],
                    },
                    sIncentiveData: {
                        tokenAddress: '0xb2007801F8c9dB4241E12C81E9d83741d14d7227',
                        incentiveControllerAddress: '0x5465485D7b15CaBc9196E73A0b1cc457262079e3',
                        rewardsTokenInformation: [
                            {
                                rewardTokenSymbol: 'REW',
                                rewardTokenAddress: '0x1f689325CBdF44B24DBE2ecC2b1fFD4130861b4E',
                                rewardOracleAddress: '0xca8e9B5F9e36EbF74096223fc48810861b4FA642',
                                emissionPerSecond: ethers_1.BigNumber.from({
                                    _hex: '0x04464ecbc45ffe',
                                    _isBigNumber: true,
                                }).toString(),
                                incentivesLastUpdateTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x61a5167a',
                                    _isBigNumber: true,
                                }).toNumber(),
                                tokenIncentivesIndex: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                emissionEndTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x638649fa',
                                    _isBigNumber: true,
                                }).toNumber(),
                                rewardPriceFeed: ethers_1.BigNumber.from({
                                    _hex: '0x05f5e100',
                                    _isBigNumber: true,
                                }).toString(),
                                rewardTokenDecimals: 18,
                                precision: 18,
                                priceFeedDecimals: 0,
                            },
                        ],
                    },
                },
            ]);
        });
        it('should work with one feed', async () => {
            const clInstance = new index_1.ChainlinkFeedsRegistry({
                chainlinkFeedsRegistry,
                provider,
            });
            utils_1.mocked(clInstance).getPriceFeed.mockReturnValueOnce(Promise.reject());
            utils_1.mocked(clInstance).getPriceFeed.mockReturnValue(Promise.resolve({
                answer: '2',
                updatedAt: 4,
                decimals: 1,
            }));
            jest
                .spyOn(IUiIncentiveDataProviderV3__factory_1.IUiIncentiveDataProviderV3__factory, 'connect')
                .mockReturnValue({
                getReservesIncentivesData: async () => Promise.resolve(_mocks_1.getReservesIncentivesDataMock),
            });
            const result = await instance.getIncentivesDataWithPriceLegacy({
                lendingPoolAddressProvider,
                chainlinkFeedsRegistry,
                quote: ChainlinkFeedsRegistryTypes_1.Denominations.eth,
            });
            expect(clInstance.getPriceFeed).toBeCalled();
            expect(result).toEqual([
                {
                    underlyingAsset: '0xb04Aaa2A73ff3D88950BdF19Eb4AC029630a2367'.toLowerCase(),
                    aIncentiveData: {
                        tokenAddress: '0x6d0eeb7b37BF26E182EB9a8631DCF79e4EF43DDd',
                        incentiveControllerAddress: '0x5465485D7b15CaBc9196E73A0b1cc457262079e3',
                        rewardsTokenInformation: [
                            {
                                rewardTokenSymbol: 'REW',
                                rewardTokenAddress: '0x1f689325CBdF44B24DBE2ecC2b1fFD4130861b4E',
                                rewardOracleAddress: '0xca8e9B5F9e36EbF74096223fc48810861b4FA642',
                                emissionPerSecond: ethers_1.BigNumber.from({
                                    _hex: '0x04464ecbc45ffe',
                                    _isBigNumber: true,
                                }).toString(),
                                incentivesLastUpdateTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x61a5167a',
                                    _isBigNumber: true,
                                }).toNumber(),
                                tokenIncentivesIndex: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                emissionEndTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x638649fa',
                                    _isBigNumber: true,
                                }).toNumber(),
                                rewardPriceFeed: ethers_1.BigNumber.from({
                                    _hex: '0x05f5e100',
                                    _isBigNumber: true,
                                }).toString(),
                                rewardTokenDecimals: 18,
                                precision: 18,
                                priceFeedDecimals: 0,
                            },
                        ],
                    },
                    vIncentiveData: {
                        tokenAddress: '0xaD99ef885623E8520f631625b2675d6dAd3aaDC1',
                        incentiveControllerAddress: '0x5465485D7b15CaBc9196E73A0b1cc457262079e3',
                        rewardsTokenInformation: [
                            {
                                rewardTokenSymbol: 'REW',
                                rewardTokenAddress: '0x1f689325CBdF44B24DBE2ecC2b1fFD4130861b4E',
                                rewardOracleAddress: '0xca8e9B5F9e36EbF74096223fc48810861b4FA642',
                                emissionPerSecond: ethers_1.BigNumber.from({
                                    _hex: '0x04464ecbc45ffe',
                                    _isBigNumber: true,
                                }).toString(),
                                incentivesLastUpdateTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x61a5167a',
                                    _isBigNumber: true,
                                }).toNumber(),
                                tokenIncentivesIndex: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                emissionEndTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x638649fa',
                                    _isBigNumber: true,
                                }).toNumber(),
                                rewardPriceFeed: ethers_1.BigNumber.from({
                                    _hex: '0x05f5e100',
                                    _isBigNumber: true,
                                }).toString(),
                                rewardTokenDecimals: 18,
                                precision: 18,
                                priceFeedDecimals: 0,
                            },
                        ],
                    },
                    sIncentiveData: {
                        tokenAddress: '0xb2007801F8c9dB4241E12C81E9d83741d14d7227',
                        incentiveControllerAddress: '0x5465485D7b15CaBc9196E73A0b1cc457262079e3',
                        rewardsTokenInformation: [
                            {
                                rewardTokenSymbol: 'REW',
                                rewardTokenAddress: '0x1f689325CBdF44B24DBE2ecC2b1fFD4130861b4E',
                                rewardOracleAddress: '0xca8e9B5F9e36EbF74096223fc48810861b4FA642',
                                emissionPerSecond: ethers_1.BigNumber.from({
                                    _hex: '0x04464ecbc45ffe',
                                    _isBigNumber: true,
                                }).toString(),
                                incentivesLastUpdateTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x61a5167a',
                                    _isBigNumber: true,
                                }).toNumber(),
                                tokenIncentivesIndex: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                emissionEndTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x638649fa',
                                    _isBigNumber: true,
                                }).toNumber(),
                                rewardPriceFeed: ethers_1.BigNumber.from({
                                    _hex: '0x05f5e100',
                                    _isBigNumber: true,
                                }).toString(),
                                rewardTokenDecimals: 18,
                                precision: 18,
                                priceFeedDecimals: 0,
                            },
                        ],
                    },
                },
            ]);
        });
        it('should work with all feeds', async () => {
            const clInstance = new index_1.ChainlinkFeedsRegistry({
                chainlinkFeedsRegistry,
                provider: new ethers_1.providers.JsonRpcProvider(),
            });
            utils_1.mocked(clInstance).getPriceFeed.mockReturnValue(Promise.resolve({
                answer: '2',
                updatedAt: 4,
                decimals: 1,
            }));
            jest
                .spyOn(IUiIncentiveDataProviderV3__factory_1.IUiIncentiveDataProviderV3__factory, 'connect')
                .mockReturnValue({
                getReservesIncentivesData: async () => Promise.resolve(_mocks_1.getReservesIncentivesDataMock),
            });
            const result = await instance.getIncentivesDataWithPriceLegacy({
                lendingPoolAddressProvider,
                chainlinkFeedsRegistry,
                quote: ChainlinkFeedsRegistryTypes_1.Denominations.eth,
            });
            expect(clInstance.getPriceFeed).toBeCalled();
            expect(result).toEqual([
                {
                    underlyingAsset: '0xb04Aaa2A73ff3D88950BdF19Eb4AC029630a2367'.toLowerCase(),
                    aIncentiveData: {
                        tokenAddress: '0x6d0eeb7b37BF26E182EB9a8631DCF79e4EF43DDd',
                        incentiveControllerAddress: '0x5465485D7b15CaBc9196E73A0b1cc457262079e3',
                        rewardsTokenInformation: [
                            {
                                rewardTokenSymbol: 'REW',
                                rewardTokenAddress: '0x1f689325CBdF44B24DBE2ecC2b1fFD4130861b4E',
                                rewardOracleAddress: '0xca8e9B5F9e36EbF74096223fc48810861b4FA642',
                                emissionPerSecond: ethers_1.BigNumber.from({
                                    _hex: '0x04464ecbc45ffe',
                                    _isBigNumber: true,
                                }).toString(),
                                incentivesLastUpdateTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x61a5167a',
                                    _isBigNumber: true,
                                }).toNumber(),
                                tokenIncentivesIndex: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                emissionEndTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x638649fa',
                                    _isBigNumber: true,
                                }).toNumber(),
                                rewardPriceFeed: '2',
                                rewardTokenDecimals: 18,
                                precision: 18,
                                priceFeedDecimals: 1,
                            },
                        ],
                    },
                    vIncentiveData: {
                        tokenAddress: '0xaD99ef885623E8520f631625b2675d6dAd3aaDC1',
                        incentiveControllerAddress: '0x5465485D7b15CaBc9196E73A0b1cc457262079e3',
                        rewardsTokenInformation: [
                            {
                                rewardTokenSymbol: 'REW',
                                rewardTokenAddress: '0x1f689325CBdF44B24DBE2ecC2b1fFD4130861b4E',
                                rewardOracleAddress: '0xca8e9B5F9e36EbF74096223fc48810861b4FA642',
                                emissionPerSecond: ethers_1.BigNumber.from({
                                    _hex: '0x04464ecbc45ffe',
                                    _isBigNumber: true,
                                }).toString(),
                                incentivesLastUpdateTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x61a5167a',
                                    _isBigNumber: true,
                                }).toNumber(),
                                tokenIncentivesIndex: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                emissionEndTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x638649fa',
                                    _isBigNumber: true,
                                }).toNumber(),
                                rewardPriceFeed: '2',
                                rewardTokenDecimals: 18,
                                precision: 18,
                                priceFeedDecimals: 1,
                            },
                        ],
                    },
                    sIncentiveData: {
                        tokenAddress: '0xb2007801F8c9dB4241E12C81E9d83741d14d7227',
                        incentiveControllerAddress: '0x5465485D7b15CaBc9196E73A0b1cc457262079e3',
                        rewardsTokenInformation: [
                            {
                                rewardTokenSymbol: 'REW',
                                rewardTokenAddress: '0x1f689325CBdF44B24DBE2ecC2b1fFD4130861b4E',
                                rewardOracleAddress: '0xca8e9B5F9e36EbF74096223fc48810861b4FA642',
                                emissionPerSecond: ethers_1.BigNumber.from({
                                    _hex: '0x04464ecbc45ffe',
                                    _isBigNumber: true,
                                }).toString(),
                                incentivesLastUpdateTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x61a5167a',
                                    _isBigNumber: true,
                                }).toNumber(),
                                tokenIncentivesIndex: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                emissionEndTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x638649fa',
                                    _isBigNumber: true,
                                }).toNumber(),
                                rewardPriceFeed: '2',
                                rewardTokenDecimals: 18,
                                precision: 18,
                                priceFeedDecimals: 1,
                            },
                        ],
                    },
                },
            ]);
        });
        it('should work with all feeds and no quote', async () => {
            const clInstance = new index_1.ChainlinkFeedsRegistry({
                chainlinkFeedsRegistry,
                provider: new ethers_1.providers.JsonRpcProvider(),
            });
            utils_1.mocked(clInstance).getPriceFeed.mockReturnValue(Promise.resolve({
                answer: '2',
                updatedAt: 4,
                decimals: 1,
            }));
            jest
                .spyOn(IUiIncentiveDataProviderV3__factory_1.IUiIncentiveDataProviderV3__factory, 'connect')
                .mockReturnValue({
                getReservesIncentivesData: async () => Promise.resolve(_mocks_1.getReservesIncentivesDataMock),
            });
            const result = await instance.getIncentivesDataWithPriceLegacy({
                lendingPoolAddressProvider,
                chainlinkFeedsRegistry,
            });
            expect(clInstance.getPriceFeed).toBeCalled();
            expect(result).toEqual([
                {
                    underlyingAsset: '0xb04Aaa2A73ff3D88950BdF19Eb4AC029630a2367'.toLowerCase(),
                    aIncentiveData: {
                        tokenAddress: '0x6d0eeb7b37BF26E182EB9a8631DCF79e4EF43DDd',
                        incentiveControllerAddress: '0x5465485D7b15CaBc9196E73A0b1cc457262079e3',
                        rewardsTokenInformation: [
                            {
                                rewardTokenSymbol: 'REW',
                                rewardTokenAddress: '0x1f689325CBdF44B24DBE2ecC2b1fFD4130861b4E',
                                rewardOracleAddress: '0xca8e9B5F9e36EbF74096223fc48810861b4FA642',
                                emissionPerSecond: ethers_1.BigNumber.from({
                                    _hex: '0x04464ecbc45ffe',
                                    _isBigNumber: true,
                                }).toString(),
                                incentivesLastUpdateTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x61a5167a',
                                    _isBigNumber: true,
                                }).toNumber(),
                                tokenIncentivesIndex: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                emissionEndTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x638649fa',
                                    _isBigNumber: true,
                                }).toNumber(),
                                rewardPriceFeed: '2',
                                rewardTokenDecimals: 18,
                                precision: 18,
                                priceFeedDecimals: 1,
                            },
                        ],
                    },
                    vIncentiveData: {
                        tokenAddress: '0xaD99ef885623E8520f631625b2675d6dAd3aaDC1',
                        incentiveControllerAddress: '0x5465485D7b15CaBc9196E73A0b1cc457262079e3',
                        rewardsTokenInformation: [
                            {
                                rewardTokenSymbol: 'REW',
                                rewardTokenAddress: '0x1f689325CBdF44B24DBE2ecC2b1fFD4130861b4E',
                                rewardOracleAddress: '0xca8e9B5F9e36EbF74096223fc48810861b4FA642',
                                emissionPerSecond: ethers_1.BigNumber.from({
                                    _hex: '0x04464ecbc45ffe',
                                    _isBigNumber: true,
                                }).toString(),
                                incentivesLastUpdateTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x61a5167a',
                                    _isBigNumber: true,
                                }).toNumber(),
                                tokenIncentivesIndex: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                emissionEndTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x638649fa',
                                    _isBigNumber: true,
                                }).toNumber(),
                                rewardPriceFeed: '2',
                                rewardTokenDecimals: 18,
                                precision: 18,
                                priceFeedDecimals: 1,
                            },
                        ],
                    },
                    sIncentiveData: {
                        tokenAddress: '0xb2007801F8c9dB4241E12C81E9d83741d14d7227',
                        incentiveControllerAddress: '0x5465485D7b15CaBc9196E73A0b1cc457262079e3',
                        rewardsTokenInformation: [
                            {
                                rewardTokenSymbol: 'REW',
                                rewardTokenAddress: '0x1f689325CBdF44B24DBE2ecC2b1fFD4130861b4E',
                                rewardOracleAddress: '0xca8e9B5F9e36EbF74096223fc48810861b4FA642',
                                emissionPerSecond: ethers_1.BigNumber.from({
                                    _hex: '0x04464ecbc45ffe',
                                    _isBigNumber: true,
                                }).toString(),
                                incentivesLastUpdateTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x61a5167a',
                                    _isBigNumber: true,
                                }).toNumber(),
                                tokenIncentivesIndex: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                emissionEndTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x638649fa',
                                    _isBigNumber: true,
                                }).toNumber(),
                                rewardPriceFeed: '2',
                                rewardTokenDecimals: 18,
                                precision: 18,
                                priceFeedDecimals: 1,
                            },
                        ],
                    },
                },
            ]);
        });
        it('should work with no feed twice', async () => {
            const clInstance = new index_1.ChainlinkFeedsRegistry({
                chainlinkFeedsRegistry,
                provider: new ethers_1.providers.JsonRpcProvider(),
            });
            utils_1.mocked(clInstance).getPriceFeed.mockReturnValue(Promise.reject());
            jest
                .spyOn(IUiIncentiveDataProviderV3__factory_1.IUiIncentiveDataProviderV3__factory, 'connect')
                .mockReturnValue({
                getReservesIncentivesData: async () => Promise.resolve(_mocks_1.getReservesIncentivesDataMock),
            });
            const result = await instance.getIncentivesDataWithPriceLegacy({
                lendingPoolAddressProvider,
                chainlinkFeedsRegistry,
                quote: ChainlinkFeedsRegistryTypes_1.Denominations.eth,
            });
            const result2 = await instance.getIncentivesDataWithPriceLegacy({
                lendingPoolAddressProvider,
                chainlinkFeedsRegistry,
                quote: ChainlinkFeedsRegistryTypes_1.Denominations.eth,
            });
            expect(clInstance.getPriceFeed).toBeCalled();
            expect(result).toEqual([
                {
                    underlyingAsset: '0xb04Aaa2A73ff3D88950BdF19Eb4AC029630a2367'.toLowerCase(),
                    aIncentiveData: {
                        tokenAddress: '0x6d0eeb7b37BF26E182EB9a8631DCF79e4EF43DDd',
                        incentiveControllerAddress: '0x5465485D7b15CaBc9196E73A0b1cc457262079e3',
                        rewardsTokenInformation: [
                            {
                                rewardTokenSymbol: 'REW',
                                rewardTokenAddress: '0x1f689325CBdF44B24DBE2ecC2b1fFD4130861b4E',
                                rewardOracleAddress: '0xca8e9B5F9e36EbF74096223fc48810861b4FA642',
                                emissionPerSecond: ethers_1.BigNumber.from({
                                    _hex: '0x04464ecbc45ffe',
                                    _isBigNumber: true,
                                }).toString(),
                                incentivesLastUpdateTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x61a5167a',
                                    _isBigNumber: true,
                                }).toNumber(),
                                tokenIncentivesIndex: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                emissionEndTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x638649fa',
                                    _isBigNumber: true,
                                }).toNumber(),
                                rewardPriceFeed: ethers_1.BigNumber.from({
                                    _hex: '0x05f5e100',
                                    _isBigNumber: true,
                                }).toString(),
                                rewardTokenDecimals: 18,
                                precision: 18,
                                priceFeedDecimals: 0,
                            },
                        ],
                    },
                    vIncentiveData: {
                        tokenAddress: '0xaD99ef885623E8520f631625b2675d6dAd3aaDC1',
                        incentiveControllerAddress: '0x5465485D7b15CaBc9196E73A0b1cc457262079e3',
                        rewardsTokenInformation: [
                            {
                                rewardTokenSymbol: 'REW',
                                rewardTokenAddress: '0x1f689325CBdF44B24DBE2ecC2b1fFD4130861b4E',
                                rewardOracleAddress: '0xca8e9B5F9e36EbF74096223fc48810861b4FA642',
                                emissionPerSecond: ethers_1.BigNumber.from({
                                    _hex: '0x04464ecbc45ffe',
                                    _isBigNumber: true,
                                }).toString(),
                                incentivesLastUpdateTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x61a5167a',
                                    _isBigNumber: true,
                                }).toNumber(),
                                tokenIncentivesIndex: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                emissionEndTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x638649fa',
                                    _isBigNumber: true,
                                }).toNumber(),
                                rewardPriceFeed: ethers_1.BigNumber.from({
                                    _hex: '0x05f5e100',
                                    _isBigNumber: true,
                                }).toString(),
                                rewardTokenDecimals: 18,
                                precision: 18,
                                priceFeedDecimals: 0,
                            },
                        ],
                    },
                    sIncentiveData: {
                        tokenAddress: '0xb2007801F8c9dB4241E12C81E9d83741d14d7227',
                        incentiveControllerAddress: '0x5465485D7b15CaBc9196E73A0b1cc457262079e3',
                        rewardsTokenInformation: [
                            {
                                rewardTokenSymbol: 'REW',
                                rewardTokenAddress: '0x1f689325CBdF44B24DBE2ecC2b1fFD4130861b4E',
                                rewardOracleAddress: '0xca8e9B5F9e36EbF74096223fc48810861b4FA642',
                                emissionPerSecond: ethers_1.BigNumber.from({
                                    _hex: '0x04464ecbc45ffe',
                                    _isBigNumber: true,
                                }).toString(),
                                incentivesLastUpdateTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x61a5167a',
                                    _isBigNumber: true,
                                }).toNumber(),
                                tokenIncentivesIndex: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                emissionEndTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x638649fa',
                                    _isBigNumber: true,
                                }).toNumber(),
                                rewardPriceFeed: ethers_1.BigNumber.from({
                                    _hex: '0x05f5e100',
                                    _isBigNumber: true,
                                }).toString(),
                                rewardTokenDecimals: 18,
                                precision: 18,
                                priceFeedDecimals: 0,
                            },
                        ],
                    },
                },
            ]);
            expect(result2).toEqual([
                {
                    underlyingAsset: '0xb04Aaa2A73ff3D88950BdF19Eb4AC029630a2367'.toLowerCase(),
                    aIncentiveData: {
                        tokenAddress: '0x6d0eeb7b37BF26E182EB9a8631DCF79e4EF43DDd',
                        incentiveControllerAddress: '0x5465485D7b15CaBc9196E73A0b1cc457262079e3',
                        rewardsTokenInformation: [
                            {
                                rewardTokenSymbol: 'REW',
                                rewardTokenAddress: '0x1f689325CBdF44B24DBE2ecC2b1fFD4130861b4E',
                                rewardOracleAddress: '0xca8e9B5F9e36EbF74096223fc48810861b4FA642',
                                emissionPerSecond: ethers_1.BigNumber.from({
                                    _hex: '0x04464ecbc45ffe',
                                    _isBigNumber: true,
                                }).toString(),
                                incentivesLastUpdateTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x61a5167a',
                                    _isBigNumber: true,
                                }).toNumber(),
                                tokenIncentivesIndex: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                emissionEndTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x638649fa',
                                    _isBigNumber: true,
                                }).toNumber(),
                                rewardPriceFeed: ethers_1.BigNumber.from({
                                    _hex: '0x05f5e100',
                                    _isBigNumber: true,
                                }).toString(),
                                rewardTokenDecimals: 18,
                                precision: 18,
                                priceFeedDecimals: 0,
                            },
                        ],
                    },
                    vIncentiveData: {
                        tokenAddress: '0xaD99ef885623E8520f631625b2675d6dAd3aaDC1',
                        incentiveControllerAddress: '0x5465485D7b15CaBc9196E73A0b1cc457262079e3',
                        rewardsTokenInformation: [
                            {
                                rewardTokenSymbol: 'REW',
                                rewardTokenAddress: '0x1f689325CBdF44B24DBE2ecC2b1fFD4130861b4E',
                                rewardOracleAddress: '0xca8e9B5F9e36EbF74096223fc48810861b4FA642',
                                emissionPerSecond: ethers_1.BigNumber.from({
                                    _hex: '0x04464ecbc45ffe',
                                    _isBigNumber: true,
                                }).toString(),
                                incentivesLastUpdateTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x61a5167a',
                                    _isBigNumber: true,
                                }).toNumber(),
                                tokenIncentivesIndex: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                emissionEndTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x638649fa',
                                    _isBigNumber: true,
                                }).toNumber(),
                                rewardPriceFeed: ethers_1.BigNumber.from({
                                    _hex: '0x05f5e100',
                                    _isBigNumber: true,
                                }).toString(),
                                rewardTokenDecimals: 18,
                                precision: 18,
                                priceFeedDecimals: 0,
                            },
                        ],
                    },
                    sIncentiveData: {
                        tokenAddress: '0xb2007801F8c9dB4241E12C81E9d83741d14d7227',
                        incentiveControllerAddress: '0x5465485D7b15CaBc9196E73A0b1cc457262079e3',
                        rewardsTokenInformation: [
                            {
                                rewardTokenSymbol: 'REW',
                                rewardTokenAddress: '0x1f689325CBdF44B24DBE2ecC2b1fFD4130861b4E',
                                rewardOracleAddress: '0xca8e9B5F9e36EbF74096223fc48810861b4FA642',
                                emissionPerSecond: ethers_1.BigNumber.from({
                                    _hex: '0x04464ecbc45ffe',
                                    _isBigNumber: true,
                                }).toString(),
                                incentivesLastUpdateTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x61a5167a',
                                    _isBigNumber: true,
                                }).toNumber(),
                                tokenIncentivesIndex: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                emissionEndTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x638649fa',
                                    _isBigNumber: true,
                                }).toNumber(),
                                rewardPriceFeed: ethers_1.BigNumber.from({
                                    _hex: '0x05f5e100',
                                    _isBigNumber: true,
                                }).toString(),
                                rewardTokenDecimals: 18,
                                precision: 18,
                                priceFeedDecimals: 0,
                            },
                        ],
                    },
                },
            ]);
        });
        it('should work with chainlinkRegistry address incorrect', async () => {
            jest
                .spyOn(IUiIncentiveDataProviderV3__factory_1.IUiIncentiveDataProviderV3__factory, 'connect')
                .mockReturnValue({
                getReservesIncentivesData: async () => Promise.resolve(_mocks_1.getReservesIncentivesDataMock),
            });
            const result = await instance.getIncentivesDataWithPriceLegacy({
                lendingPoolAddressProvider,
                chainlinkFeedsRegistry,
                quote: ChainlinkFeedsRegistryTypes_1.Denominations.usd,
            });
            expect(result).toEqual([
                {
                    underlyingAsset: '0xb04Aaa2A73ff3D88950BdF19Eb4AC029630a2367'.toLowerCase(),
                    aIncentiveData: {
                        tokenAddress: '0x6d0eeb7b37BF26E182EB9a8631DCF79e4EF43DDd',
                        incentiveControllerAddress: '0x5465485D7b15CaBc9196E73A0b1cc457262079e3',
                        rewardsTokenInformation: [
                            {
                                rewardTokenSymbol: 'REW',
                                rewardTokenAddress: '0x1f689325CBdF44B24DBE2ecC2b1fFD4130861b4E',
                                rewardOracleAddress: '0xca8e9B5F9e36EbF74096223fc48810861b4FA642',
                                emissionPerSecond: ethers_1.BigNumber.from({
                                    _hex: '0x04464ecbc45ffe',
                                    _isBigNumber: true,
                                }).toString(),
                                incentivesLastUpdateTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x61a5167a',
                                    _isBigNumber: true,
                                }).toNumber(),
                                tokenIncentivesIndex: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                emissionEndTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x638649fa',
                                    _isBigNumber: true,
                                }).toNumber(),
                                rewardPriceFeed: ethers_1.BigNumber.from({
                                    _hex: '0x05f5e100',
                                    _isBigNumber: true,
                                }).toString(),
                                rewardTokenDecimals: 18,
                                precision: 18,
                                priceFeedDecimals: 0,
                            },
                        ],
                    },
                    vIncentiveData: {
                        tokenAddress: '0xaD99ef885623E8520f631625b2675d6dAd3aaDC1',
                        incentiveControllerAddress: '0x5465485D7b15CaBc9196E73A0b1cc457262079e3',
                        rewardsTokenInformation: [
                            {
                                rewardTokenSymbol: 'REW',
                                rewardTokenAddress: '0x1f689325CBdF44B24DBE2ecC2b1fFD4130861b4E',
                                rewardOracleAddress: '0xca8e9B5F9e36EbF74096223fc48810861b4FA642',
                                emissionPerSecond: ethers_1.BigNumber.from({
                                    _hex: '0x04464ecbc45ffe',
                                    _isBigNumber: true,
                                }).toString(),
                                incentivesLastUpdateTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x61a5167a',
                                    _isBigNumber: true,
                                }).toNumber(),
                                tokenIncentivesIndex: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                emissionEndTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x638649fa',
                                    _isBigNumber: true,
                                }).toNumber(),
                                rewardPriceFeed: ethers_1.BigNumber.from({
                                    _hex: '0x05f5e100',
                                    _isBigNumber: true,
                                }).toString(),
                                rewardTokenDecimals: 18,
                                precision: 18,
                                priceFeedDecimals: 0,
                            },
                        ],
                    },
                    sIncentiveData: {
                        tokenAddress: '0xb2007801F8c9dB4241E12C81E9d83741d14d7227',
                        incentiveControllerAddress: '0x5465485D7b15CaBc9196E73A0b1cc457262079e3',
                        rewardsTokenInformation: [
                            {
                                rewardTokenSymbol: 'REW',
                                rewardTokenAddress: '0x1f689325CBdF44B24DBE2ecC2b1fFD4130861b4E',
                                rewardOracleAddress: '0xca8e9B5F9e36EbF74096223fc48810861b4FA642',
                                emissionPerSecond: ethers_1.BigNumber.from({
                                    _hex: '0x04464ecbc45ffe',
                                    _isBigNumber: true,
                                }).toString(),
                                incentivesLastUpdateTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x61a5167a',
                                    _isBigNumber: true,
                                }).toNumber(),
                                tokenIncentivesIndex: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                emissionEndTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x638649fa',
                                    _isBigNumber: true,
                                }).toNumber(),
                                rewardPriceFeed: ethers_1.BigNumber.from({
                                    _hex: '0x05f5e100',
                                    _isBigNumber: true,
                                }).toString(),
                                rewardTokenDecimals: 18,
                                precision: 18,
                                priceFeedDecimals: 0,
                            },
                        ],
                    },
                },
            ]);
        });
        it('should work with no chainlinkRegistry address no quote ', async () => {
            jest
                .spyOn(IUiIncentiveDataProviderV3__factory_1.IUiIncentiveDataProviderV3__factory, 'connect')
                .mockReturnValue({
                getReservesIncentivesData: async () => Promise.resolve(_mocks_1.getReservesIncentivesDataMock),
            });
            const result = await instance.getIncentivesDataWithPriceLegacy({
                lendingPoolAddressProvider,
            });
            expect(result).toEqual([
                {
                    underlyingAsset: '0xb04Aaa2A73ff3D88950BdF19Eb4AC029630a2367'.toLowerCase(),
                    aIncentiveData: {
                        tokenAddress: '0x6d0eeb7b37BF26E182EB9a8631DCF79e4EF43DDd',
                        incentiveControllerAddress: '0x5465485D7b15CaBc9196E73A0b1cc457262079e3',
                        rewardsTokenInformation: [
                            {
                                rewardTokenSymbol: 'REW',
                                rewardTokenAddress: '0x1f689325CBdF44B24DBE2ecC2b1fFD4130861b4E',
                                rewardOracleAddress: '0xca8e9B5F9e36EbF74096223fc48810861b4FA642',
                                emissionPerSecond: ethers_1.BigNumber.from({
                                    _hex: '0x04464ecbc45ffe',
                                    _isBigNumber: true,
                                }).toString(),
                                incentivesLastUpdateTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x61a5167a',
                                    _isBigNumber: true,
                                }).toNumber(),
                                tokenIncentivesIndex: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                emissionEndTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x638649fa',
                                    _isBigNumber: true,
                                }).toNumber(),
                                rewardPriceFeed: ethers_1.BigNumber.from({
                                    _hex: '0x05f5e100',
                                    _isBigNumber: true,
                                }).toString(),
                                rewardTokenDecimals: 18,
                                precision: 18,
                                priceFeedDecimals: 0,
                            },
                        ],
                    },
                    vIncentiveData: {
                        tokenAddress: '0xaD99ef885623E8520f631625b2675d6dAd3aaDC1',
                        incentiveControllerAddress: '0x5465485D7b15CaBc9196E73A0b1cc457262079e3',
                        rewardsTokenInformation: [
                            {
                                rewardTokenSymbol: 'REW',
                                rewardTokenAddress: '0x1f689325CBdF44B24DBE2ecC2b1fFD4130861b4E',
                                rewardOracleAddress: '0xca8e9B5F9e36EbF74096223fc48810861b4FA642',
                                emissionPerSecond: ethers_1.BigNumber.from({
                                    _hex: '0x04464ecbc45ffe',
                                    _isBigNumber: true,
                                }).toString(),
                                incentivesLastUpdateTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x61a5167a',
                                    _isBigNumber: true,
                                }).toNumber(),
                                tokenIncentivesIndex: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                emissionEndTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x638649fa',
                                    _isBigNumber: true,
                                }).toNumber(),
                                rewardPriceFeed: ethers_1.BigNumber.from({
                                    _hex: '0x05f5e100',
                                    _isBigNumber: true,
                                }).toString(),
                                rewardTokenDecimals: 18,
                                precision: 18,
                                priceFeedDecimals: 0,
                            },
                        ],
                    },
                    sIncentiveData: {
                        tokenAddress: '0xb2007801F8c9dB4241E12C81E9d83741d14d7227',
                        incentiveControllerAddress: '0x5465485D7b15CaBc9196E73A0b1cc457262079e3',
                        rewardsTokenInformation: [
                            {
                                rewardTokenSymbol: 'REW',
                                rewardTokenAddress: '0x1f689325CBdF44B24DBE2ecC2b1fFD4130861b4E',
                                rewardOracleAddress: '0xca8e9B5F9e36EbF74096223fc48810861b4FA642',
                                emissionPerSecond: ethers_1.BigNumber.from({
                                    _hex: '0x04464ecbc45ffe',
                                    _isBigNumber: true,
                                }).toString(),
                                incentivesLastUpdateTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x61a5167a',
                                    _isBigNumber: true,
                                }).toNumber(),
                                tokenIncentivesIndex: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                emissionEndTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x638649fa',
                                    _isBigNumber: true,
                                }).toNumber(),
                                rewardPriceFeed: ethers_1.BigNumber.from({
                                    _hex: '0x05f5e100',
                                    _isBigNumber: true,
                                }).toString(),
                                rewardTokenDecimals: 18,
                                precision: 18,
                                priceFeedDecimals: 0,
                            },
                        ],
                    },
                },
            ]);
        });
        it('should work with no chainlinkregistry address and quote ', async () => {
            jest
                .spyOn(IUiIncentiveDataProviderV3__factory_1.IUiIncentiveDataProviderV3__factory, 'connect')
                .mockReturnValue({
                getReservesIncentivesData: async () => Promise.resolve(_mocks_1.getReservesIncentivesDataMock),
            });
            const result = await instance.getIncentivesDataWithPriceLegacy({
                lendingPoolAddressProvider,
                quote: ChainlinkFeedsRegistryTypes_1.Denominations.usd,
            });
            expect(result).toEqual([
                {
                    underlyingAsset: '0xb04Aaa2A73ff3D88950BdF19Eb4AC029630a2367'.toLowerCase(),
                    aIncentiveData: {
                        tokenAddress: '0x6d0eeb7b37BF26E182EB9a8631DCF79e4EF43DDd',
                        incentiveControllerAddress: '0x5465485D7b15CaBc9196E73A0b1cc457262079e3',
                        rewardsTokenInformation: [
                            {
                                rewardTokenSymbol: 'REW',
                                rewardTokenAddress: '0x1f689325CBdF44B24DBE2ecC2b1fFD4130861b4E',
                                rewardOracleAddress: '0xca8e9B5F9e36EbF74096223fc48810861b4FA642',
                                emissionPerSecond: ethers_1.BigNumber.from({
                                    _hex: '0x04464ecbc45ffe',
                                    _isBigNumber: true,
                                }).toString(),
                                incentivesLastUpdateTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x61a5167a',
                                    _isBigNumber: true,
                                }).toNumber(),
                                tokenIncentivesIndex: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                emissionEndTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x638649fa',
                                    _isBigNumber: true,
                                }).toNumber(),
                                rewardPriceFeed: ethers_1.BigNumber.from({
                                    _hex: '0x05f5e100',
                                    _isBigNumber: true,
                                }).toString(),
                                rewardTokenDecimals: 18,
                                precision: 18,
                                priceFeedDecimals: 0,
                            },
                        ],
                    },
                    vIncentiveData: {
                        tokenAddress: '0xaD99ef885623E8520f631625b2675d6dAd3aaDC1',
                        incentiveControllerAddress: '0x5465485D7b15CaBc9196E73A0b1cc457262079e3',
                        rewardsTokenInformation: [
                            {
                                rewardTokenSymbol: 'REW',
                                rewardTokenAddress: '0x1f689325CBdF44B24DBE2ecC2b1fFD4130861b4E',
                                rewardOracleAddress: '0xca8e9B5F9e36EbF74096223fc48810861b4FA642',
                                emissionPerSecond: ethers_1.BigNumber.from({
                                    _hex: '0x04464ecbc45ffe',
                                    _isBigNumber: true,
                                }).toString(),
                                incentivesLastUpdateTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x61a5167a',
                                    _isBigNumber: true,
                                }).toNumber(),
                                tokenIncentivesIndex: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                emissionEndTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x638649fa',
                                    _isBigNumber: true,
                                }).toNumber(),
                                rewardPriceFeed: ethers_1.BigNumber.from({
                                    _hex: '0x05f5e100',
                                    _isBigNumber: true,
                                }).toString(),
                                rewardTokenDecimals: 18,
                                precision: 18,
                                priceFeedDecimals: 0,
                            },
                        ],
                    },
                    sIncentiveData: {
                        tokenAddress: '0xb2007801F8c9dB4241E12C81E9d83741d14d7227',
                        incentiveControllerAddress: '0x5465485D7b15CaBc9196E73A0b1cc457262079e3',
                        rewardsTokenInformation: [
                            {
                                rewardTokenSymbol: 'REW',
                                rewardTokenAddress: '0x1f689325CBdF44B24DBE2ecC2b1fFD4130861b4E',
                                rewardOracleAddress: '0xca8e9B5F9e36EbF74096223fc48810861b4FA642',
                                emissionPerSecond: ethers_1.BigNumber.from({
                                    _hex: '0x04464ecbc45ffe',
                                    _isBigNumber: true,
                                }).toString(),
                                incentivesLastUpdateTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x61a5167a',
                                    _isBigNumber: true,
                                }).toNumber(),
                                tokenIncentivesIndex: ethers_1.BigNumber.from({
                                    _hex: '0x00',
                                    _isBigNumber: true,
                                }).toString(),
                                emissionEndTimestamp: ethers_1.BigNumber.from({
                                    _hex: '0x638649fa',
                                    _isBigNumber: true,
                                }).toNumber(),
                                rewardPriceFeed: ethers_1.BigNumber.from({
                                    _hex: '0x05f5e100',
                                    _isBigNumber: true,
                                }).toString(),
                                rewardTokenDecimals: 18,
                                precision: 18,
                                priceFeedDecimals: 0,
                            },
                        ],
                    },
                },
            ]);
        });
    });
});
//# sourceMappingURL=uiIncentiveDataProviderV3.test.js.map