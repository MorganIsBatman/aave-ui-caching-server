import { providers } from 'ethers';
import { Network, Market, DefaultProviderKeys } from './types';
import TxBuilderInterface from './interfaces/TxBuilder';
import LendingPoolInterface from './interfaces/v2/LendingPool';
import BaseTxBuilder from './txBuilder';
import WETHGatewayInterface from './interfaces/WETHGateway';
import BaseDebtTokenInterface from './interfaces/BaseDebtToken';
import LiquiditySwapAdapterInterface from './interfaces/LiquiditySwapAdapterParaswap';
import RepayWithCollateralAdapterInterface from './interfaces/RepayWithCollateralAdapter';
import AaveGovernanceV2Interface from './interfaces/v2/AaveGovernanceV2';
import GovernanceDelegationTokenInterface from './interfaces/v2/GovernanceDelegationToken';
export default class TxBuilder extends BaseTxBuilder implements TxBuilderInterface {
    readonly lendingPools: {
        [market: string]: LendingPoolInterface;
    };
    readonly baseDebtTokenService: BaseDebtTokenInterface;
    readonly liquiditySwapAdapterService: LiquiditySwapAdapterInterface;
    readonly repayWithCollateralAdapterService: RepayWithCollateralAdapterInterface;
    aaveGovernanceV2Service: AaveGovernanceV2Interface;
    governanceDelegationTokenService: GovernanceDelegationTokenInterface;
    wethGatewayService: WETHGatewayInterface;
    constructor(network?: Network, injectedProvider?: providers.ExternalProvider | providers.Web3Provider | string | undefined, defaultProviderKeys?: DefaultProviderKeys);
    getLendingPool: (market: Market) => LendingPoolInterface;
}
