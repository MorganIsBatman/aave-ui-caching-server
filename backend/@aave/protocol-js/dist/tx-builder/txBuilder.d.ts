import { providers } from 'ethers';
import FaucetInterface from './interfaces/Faucet';
import IERC20ServiceInterface from './interfaces/ERC20';
import LTAMigratorInterface from './interfaces/LTAMigrator';
import StakingInterface from './interfaces/Staking';
import SynthetixInterface from './interfaces/Synthetix';
import { Configuration, DefaultProviderKeys, Network, Stake } from './types';
import { IncentivesControllerInterface } from './services/IncentivesController';
export default class BaseTxBuilder {
    readonly configuration: Configuration;
    erc20Service: IERC20ServiceInterface;
    synthetixService: SynthetixInterface;
    ltaMigratorService: LTAMigratorInterface;
    faucetService: FaucetInterface;
    incentiveService: IncentivesControllerInterface;
    readonly stakings: {
        [stake: string]: StakingInterface;
    };
    constructor(network?: Network, injectedProvider?: providers.ExternalProvider | providers.StaticJsonRpcProvider | providers.Web3Provider | string | undefined, defaultProviderKeys?: DefaultProviderKeys);
    getStaking: (stake?: Stake | undefined) => StakingInterface;
}
