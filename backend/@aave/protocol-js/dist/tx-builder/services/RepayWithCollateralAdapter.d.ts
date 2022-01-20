import { IRepayWithCollateral } from '../contract-types';
import RepayWithCollateralAdapterInterface from '../interfaces/RepayWithCollateralAdapter';
import { Configuration, EthereumTransactionTypeExtended } from '../types';
import { RepayWithCollateralType } from '../types/RepayWithCollateralMethodTypes';
import BaseService from './BaseService';
export default class RepayWithCollateralAdapterService extends BaseService<IRepayWithCollateral> implements RepayWithCollateralAdapterInterface {
    readonly repayWithCollateralAddress: string;
    constructor(config: Configuration);
    swapAndRepay({ user, collateralAsset, debtAsset, collateralAmount, debtRepayAmount, debtRateMode, permit, useEthPath, }: RepayWithCollateralType): EthereumTransactionTypeExtended;
}
