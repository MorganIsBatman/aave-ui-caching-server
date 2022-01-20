import { BigNumber } from 'ethers';
import { transactionType, Configuration } from '../types';
export declare const estimateGas: (tx: transactionType, config: Configuration, gasSurplus?: number | undefined) => Promise<BigNumber>;
export declare const estimateGasByNetwork: (tx: transactionType, config: Configuration, gasSurplus?: number | undefined) => Promise<BigNumber>;
export declare const getGasPrice: (config: Configuration) => Promise<BigNumber>;
