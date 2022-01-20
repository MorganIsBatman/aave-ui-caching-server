import IERC20ServiceInterface from '../interfaces/ERC20';
import { IStakedToken, IAaveStakingHelper } from '../contract-types';
import StakingInterface from '../interfaces/Staking';
import { Configuration, EthereumTransactionTypeExtended, Stake, tEthereumAddress, tStringCurrencyUnits } from '../types';
import BaseService from './BaseService';
export default class StakingService extends BaseService<IStakedToken> implements StakingInterface {
    readonly stakingHelperContract: IAaveStakingHelper;
    readonly stakingContractAddress: tEthereumAddress;
    readonly stakingRewardTokenContractAddress: tEthereumAddress;
    readonly stakingHelperContractAddress: string;
    readonly erc20Service: IERC20ServiceInterface;
    readonly tokenStake: Stake;
    readonly canUsePermit: boolean;
    constructor(config: Configuration, erc20Service: IERC20ServiceInterface, tokenStake: Stake);
    signStaking(user: tEthereumAddress, amount: tStringCurrencyUnits, nonce: string): Promise<string>;
    stakeWithPermit(user: tEthereumAddress, amount: tStringCurrencyUnits, signature: string): Promise<EthereumTransactionTypeExtended[]>;
    stake(user: tEthereumAddress, amount: tStringCurrencyUnits, onBehalfOf?: tEthereumAddress): Promise<EthereumTransactionTypeExtended[]>;
    redeem(user: tEthereumAddress, amount: tStringCurrencyUnits): Promise<EthereumTransactionTypeExtended[]>;
    cooldown(user: tEthereumAddress): Promise<EthereumTransactionTypeExtended[]>;
    claimRewards(user: tEthereumAddress, amount: tStringCurrencyUnits): Promise<EthereumTransactionTypeExtended[]>;
}
