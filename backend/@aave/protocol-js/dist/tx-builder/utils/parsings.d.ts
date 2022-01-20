import { tStringDecimalUnits } from '../types';
export declare const parseNumber: (value: string, decimals: number) => string;
export declare const decimalsToCurrencyUnits: (value: string, decimals: number) => string;
export declare const getTxValue: (reserve: string, amount: string) => string;
export declare const mintAmountsPerToken: {
    [token: string]: tStringDecimalUnits;
};
export declare const canBeEnsAddress: (ensAddress: string) => boolean;
