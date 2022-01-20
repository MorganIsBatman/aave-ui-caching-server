import BigNumber from 'bignumber.js';
export declare type BigNumberValue = string | number | BigNumber;
export declare const BigNumberZD: typeof BigNumber;
export declare function valueToBigNumber(amount: BigNumberValue): BigNumber;
export declare function valueToZDBigNumber(amount: BigNumberValue): BigNumber;
/**
 * It's a performance optimized version of 10 ** x, which essentially memoizes previously used pows and resolves them as lookup.
 * @param decimals
 * @returns 10 ** decimals
 */
export declare function pow10(decimals: number): BigNumber;
export declare function normalize(n: BigNumberValue, decimals: number): string;
export declare function normalizeBN(n: BigNumberValue, decimals: number): BigNumber;
