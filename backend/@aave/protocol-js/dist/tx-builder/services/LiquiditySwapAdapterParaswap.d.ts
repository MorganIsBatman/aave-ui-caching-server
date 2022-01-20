import { IParaSwapLiquiditySwapAdapter } from '../contract-types';
import LiquiditySwapAdapterInterface from '../interfaces/LiquiditySwapAdapterParaswap';
import { Configuration, EthereumTransactionTypeExtended } from '../types';
import { SwapAndDepositMethodType } from '../types/LiquiditySwapAdapterParaswapMethodTypes';
import BaseService from './BaseService';
export declare function augustusFromAmountOffsetFromCalldata(calldata: string): number;
export default class LiquiditySwapAdapterService extends BaseService<IParaSwapLiquiditySwapAdapter> implements LiquiditySwapAdapterInterface {
    readonly liquiditySwapAdapterAddress: string;
    constructor(config: Configuration);
    swapAndDeposit({ user, assetToSwapFrom, assetToSwapTo, amountToSwap, minAmountToReceive, permitParams, augustus, swapCallData, swapAll, }: SwapAndDepositMethodType): EthereumTransactionTypeExtended;
}
