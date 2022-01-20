import { IAaveIncentivesController } from '../contract-types';
import { Configuration, EthereumTransactionTypeExtended, tEthereumAddress } from '../types';
import BaseService from './BaseService';
export declare type ClaimRewardsMethodType = {
    user: string;
    assets: string[];
    to: string;
};
export interface IncentivesControllerInterface {
    incentivesControllerRewardTokenAddress: tEthereumAddress;
    claimRewards: (args: ClaimRewardsMethodType) => EthereumTransactionTypeExtended[];
}
export default class IncentivesController extends BaseService<IAaveIncentivesController> implements IncentivesControllerInterface {
    readonly incentivesControllerRewardTokenAddress: tEthereumAddress;
    readonly incentivesControllerAddress: string;
    constructor(config: Configuration);
    claimRewards({ user, assets, to }: ClaimRewardsMethodType): EthereumTransactionTypeExtended[];
}
