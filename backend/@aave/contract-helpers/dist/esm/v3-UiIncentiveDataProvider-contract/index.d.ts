import { providers } from 'ethers';
import { Denominations } from '../cl-feed-registry/types/ChainlinkFeedsRegistryTypes';
import BaseService from '../commons/BaseService';
import { IUiIncentiveDataProviderV3 } from './typechain/IUiIncentiveDataProviderV3';
import { FullReservesIncentiveDataResponse, FullReservesIncentiveDataType, ReservesIncentiveData, ReservesIncentiveDataHumanized, UserReservesIncentivesData, UserReservesIncentivesDataHumanized, UserReservesIncentivesDataType } from './types';
export * from './types';
export interface UiIncentiveDataProviderInterface {
    getFullReservesIncentiveData: (args: FullReservesIncentiveDataType) => Promise<FullReservesIncentiveDataResponse>;
    getReservesIncentivesData: (lendingPoolAddressProvider: string) => Promise<ReservesIncentiveData[]>;
    getUserReservesIncentivesData: (args: UserReservesIncentivesDataType) => Promise<UserReservesIncentivesData[]>;
    getReservesIncentivesDataHumanized: (lendingPoolAddressProvider: string) => Promise<ReservesIncentiveDataHumanized[]>;
    getUserReservesIncentivesDataHumanized: (args: UserReservesIncentivesDataType) => Promise<UserReservesIncentivesDataHumanized[]>;
    getIncentivesDataWithPriceLegacy: (args: GetIncentivesDataWithPriceType) => Promise<ReservesIncentiveDataHumanized[]>;
}
export interface FeedResultSuccessful {
    rewardTokenAddress: string;
    answer: string;
    updatedAt: number;
    decimals: number;
}
export interface GetIncentivesDataWithPriceType {
    lendingPoolAddressProvider: string;
    chainlinkFeedsRegistry?: string;
    quote?: Denominations;
}
export interface UiIncentiveDataProviderContext {
    uiIncentiveDataProviderAddress: string;
    provider: providers.Provider;
}
export declare class UiIncentiveDataProvider extends BaseService<IUiIncentiveDataProviderV3> implements UiIncentiveDataProviderInterface {
    readonly uiIncentiveDataProviderAddress: string;
    private readonly _chainlinkFeedsRegistries;
    /**
     * Constructor
     * @param context The ui incentive data provider context
     */
    constructor({ provider, uiIncentiveDataProviderAddress, }: UiIncentiveDataProviderContext);
    /**
     *  Get the full reserve incentive data for the lending pool and the user
     * @param user The user address
     */
    getFullReservesIncentiveData({ user, lendingPoolAddressProvider }: FullReservesIncentiveDataType): Promise<FullReservesIncentiveDataResponse>;
    /**
     *  Get the reserve incentive data for the lending pool
     */
    getReservesIncentivesData(lendingPoolAddressProvider: string): Promise<ReservesIncentiveData[]>;
    /**
     *  Get the reserve incentive data for the user
     * @param user The user address
     */
    getUserReservesIncentivesData({ user, lendingPoolAddressProvider }: UserReservesIncentivesDataType): Promise<UserReservesIncentivesData[]>;
    getReservesIncentivesDataHumanized(lendingPoolAddressProvider: string): Promise<ReservesIncentiveDataHumanized[]>;
    getUserReservesIncentivesDataHumanized({ user, lendingPoolAddressProvider }: UserReservesIncentivesDataType): Promise<UserReservesIncentivesDataHumanized[]>;
    getIncentivesDataWithPriceLegacy({ lendingPoolAddressProvider, chainlinkFeedsRegistry, quote, }: GetIncentivesDataWithPriceType): Promise<ReservesIncentiveDataHumanized[]>;
    private readonly _getFeed;
    private _formatIncentiveData;
    private _formatUserIncentiveData;
}
//# sourceMappingURL=index.d.ts.map