import BigNumber from 'bignumber.js';
import { ReserveData, UserReserveData, UserSummaryData, ReserveRatesData } from './types';
import { BigNumberValue } from '../helpers/bignumber';
export declare type GetCompoundedBorrowBalanceParamsReserve = Pick<ReserveData, 'variableBorrowRate' | 'lastUpdateTimestamp' | 'variableBorrowIndex'>;
export declare type GetCompoundedBorrowBalanceParamsUserReserve = Pick<UserReserveData, 'principalBorrows' | 'borrowRateMode' | 'variableBorrowIndex' | 'borrowRate' | 'lastUpdateTimestamp'>;
export declare function getCompoundedBorrowBalance(reserve: GetCompoundedBorrowBalanceParamsReserve, userReserve: GetCompoundedBorrowBalanceParamsUserReserve, currentTimestamp: number): BigNumber;
export declare const calculateCompoundedInterest: (rate: BigNumberValue, currentTimestamp: number, lastUpdateTimestamp: number) => BigNumber;
export declare function calculateHealthFactorFromBalances(collateralBalanceETH: BigNumberValue, borrowBalanceETH: BigNumberValue, totalFeesETH: BigNumberValue, currentLiquidationThreshold: BigNumberValue): BigNumber;
export declare function calculateHealthFactorFromBalancesBigUnits(collateralBalanceETH: BigNumberValue, borrowBalanceETH: BigNumberValue, totalFeesETH: BigNumberValue, currentLiquidationThreshold: BigNumberValue): BigNumber;
export declare function calculateAvailableBorrowsETH(collateralBalanceETH: BigNumberValue, borrowBalanceETH: BigNumberValue, totalFeesETH: BigNumberValue, currentLtv: BigNumberValue): BigNumber;
export declare type CalculateCumulatedBalancePoolReserve = {
    liquidityRate: BigNumberValue;
    liquidityIndex: BigNumberValue;
    lastUpdateTimestamp: number;
};
export declare type CalculateCumulatedBalanceUserReserve = Pick<UserReserveData, 'userBalanceIndex'>;
export declare function calculateCumulatedBalance(balance: BigNumberValue, userReserve: CalculateCumulatedBalanceUserReserve, poolReserve: CalculateCumulatedBalancePoolReserve, currentTimestamp: number): BigNumber;
export declare type CalculateCurrentUnderlyingBalancePoolReserve = CalculateCumulatedBalancePoolReserve;
export declare type CalculateCurrentUnderlyingBalanceUserReserve = CalculateCumulatedBalanceUserReserve & Pick<UserReserveData, 'principalATokenBalance' | 'redirectedBalance' | 'interestRedirectionAddress'>;
export declare function calculateCurrentUnderlyingBalance(userReserve: CalculateCurrentUnderlyingBalanceUserReserve, poolReserve: CalculateCurrentUnderlyingBalancePoolReserve, currentTimestamp: number): BigNumber;
export declare function computeRawUserSummaryData(poolReservesData: ReserveData[], rawUserReserves: UserReserveData[], userId: string, usdPriceEth: BigNumberValue, currentTimestamp: number): UserSummaryData;
export declare function formatUserSummaryData(poolReservesData: ReserveData[], rawUserReserves: UserReserveData[], userId: string, usdPriceEth: BigNumberValue, currentTimestamp: number): UserSummaryData;
export declare function formatReserves(reserves: ReserveData[], reserveIndexes30DaysAgo?: ReserveRatesData[]): ReserveData[];
export declare function calculateInterestRates(reserve: ReserveData, amountToDeposit: BigNumberValue, amountToBorrow: BigNumberValue, borrowMode?: 'stable' | 'variable'): {
    variableBorrowRate: string;
    stableBorrowRate: string;
    liquidityRate: string;
};
