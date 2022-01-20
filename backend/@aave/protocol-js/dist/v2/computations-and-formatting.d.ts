import BigNumber from 'bignumber.js';
import { BigNumberValue } from '../helpers/bignumber';
import { ComputedUserReserve, ReserveData, UserReserveData, UserSummaryData, ReserveRatesData, ComputedReserveData, Supplies, ReserveSupplyData, RewardsInformation } from './types';
export declare function getEthAndUsdBalance(balance: BigNumberValue, priceInEth: BigNumberValue, decimals: number, usdPriceEth: BigNumberValue): [string, string];
export declare function computeUserReserveData(poolReserve: ReserveData, userReserve: UserReserveData, usdPriceEth: BigNumberValue, currentTimestamp: number, rewardsInfo: RewardsInformation): ComputedUserReserve;
export declare function computeRawUserSummaryData(poolReservesData: ReserveData[], rawUserReserves: UserReserveData[], userId: string, usdPriceEth: BigNumberValue, currentTimestamp: number, rewardsInfo: RewardsInformation): UserSummaryData;
export declare function formatUserSummaryData(poolReservesData: ReserveData[], rawUserReserves: UserReserveData[], userId: string, usdPriceEth: BigNumberValue, currentTimestamp: number, rewardsInfo: RewardsInformation): UserSummaryData;
/**
 * Calculates the formatted debt accrued to a given point in time.
 * @param reserve
 * @param currentTimestamp unix timestamp which must be higher than reserve.lastUpdateTimestamp
 */
export declare function calculateReserveDebt(reserve: ReserveData, currentTimestamp: number): {
    totalVariableDebt: string;
    totalStableDebt: string;
};
export declare function formatReserves(reserves: ReserveData[], currentTimestamp?: number, reserveIndexes30DaysAgo?: ReserveRatesData[], rewardTokenPriceEth?: string, emissionEndTimestamp?: number): ComputedReserveData[];
/**
 * Calculates the debt accrued to a given point in time.
 * @param reserve
 * @param currentTimestamp unix timestamp which must be higher than reserve.lastUpdateTimestamp
 */
export declare function calculateReserveDebtSuppliesRaw(reserve: ReserveSupplyData, currentTimestamp: number): {
    totalVariableDebt: BigNumber;
    totalStableDebt: BigNumber;
};
export declare function calculateSupplies(reserve: ReserveSupplyData, currentTimestamp: number): Supplies;
export declare function calculateIncentivesAPY(emissionPerSecond: string, rewardTokenPriceInEth: string, tokenTotalSupplyNormalized: string, tokenPriceInEth: string): string;
export declare function calculateRewards(principalUserBalance: string, reserveIndex: string, userIndex: string, precision: number, rewardTokenDecimals: number, reserveIndexTimestamp: number, emissionPerSecond: string, totalSupply: BigNumber, currentTimestamp: number, emissionEndTimestamp: number): string;
