import { providers } from 'ethers';
import BaseService from '../commons/BaseService';
import { EthereumTransactionTypeExtended, tEthereumAddress } from '../commons/types';
import { ERC20_2612Interface } from '../erc20-2612';
import { IERC20ServiceInterface } from '../erc20-contract';
import { LiquiditySwapAdapterInterface } from '../paraswap-liquiditySwapAdapter-contract';
import { RepayWithCollateralAdapterInterface } from '../repayWithCollateralAdapter-contract';
import { SynthetixInterface } from '../synthetix-contract';
import { WETHGatewayInterface } from '../wethgateway-contract';
import { LPBorrowParamsType, LPDepositParamsType, LPFlashLiquidation, LPLiquidationCall, LPRepayParamsType, LPRepayWithATokensType, LPRepayWithCollateral, LPRepayWithPermitParamsType, LPSetUsageAsCollateral, LPSetUserEModeType, LPSignERC20ApprovalType, LPSupplyWithPermitType, LPSwapBorrowRateMode, LPSwapCollateral, LPWithdrawParamsType } from './lendingPoolTypes';
import { IPool } from './typechain/IPool';
export interface PoolInterface {
    deposit: (args: LPDepositParamsType) => Promise<EthereumTransactionTypeExtended[]>;
    supply: (args: LPDepositParamsType) => Promise<EthereumTransactionTypeExtended[]>;
    signERC20Approval: (args: LPSignERC20ApprovalType) => Promise<string>;
    supplyWithPermit: (args: LPSupplyWithPermitType) => Promise<EthereumTransactionTypeExtended[]>;
    withdraw: (args: LPWithdrawParamsType) => Promise<EthereumTransactionTypeExtended[]>;
    borrow: (args: LPBorrowParamsType) => Promise<EthereumTransactionTypeExtended[]>;
    repay: (args: LPRepayParamsType) => Promise<EthereumTransactionTypeExtended[]>;
    swapBorrowRateMode: (args: LPSwapBorrowRateMode) => EthereumTransactionTypeExtended[];
    setUsageAsCollateral: (args: LPSetUsageAsCollateral) => EthereumTransactionTypeExtended[];
    swapCollateral: (args: LPSwapCollateral) => Promise<EthereumTransactionTypeExtended[]>;
    repayWithCollateral: (args: LPRepayWithCollateral) => Promise<EthereumTransactionTypeExtended[]>;
    flashLiquidation: (args: LPFlashLiquidation) => Promise<EthereumTransactionTypeExtended[]>;
    repayWithATokens: (args: LPRepayWithATokensType) => Promise<EthereumTransactionTypeExtended[]>;
    setUserEMode: (args: LPSetUserEModeType) => EthereumTransactionTypeExtended[];
}
export declare type LendingPoolMarketConfigV3 = {
    POOL: tEthereumAddress;
    WETH_GATEWAY?: tEthereumAddress;
    FLASH_LIQUIDATION_ADAPTER?: tEthereumAddress;
    REPAY_WITH_COLLATERAL_ADAPTER?: tEthereumAddress;
    SWAP_COLLATERAL_ADAPTER?: tEthereumAddress;
};
export declare class Pool extends BaseService<IPool> implements PoolInterface {
    readonly erc20Service: IERC20ServiceInterface;
    readonly poolAddress: string;
    readonly synthetixService: SynthetixInterface;
    readonly wethGatewayService: WETHGatewayInterface;
    readonly liquiditySwapAdapterService: LiquiditySwapAdapterInterface;
    readonly repayWithCollateralAdapterService: RepayWithCollateralAdapterInterface;
    readonly erc20_2612Service: ERC20_2612Interface;
    readonly flashLiquidationAddress: string;
    readonly swapCollateralAddress: string;
    readonly repayWithCollateralAddress: string;
    constructor(provider: providers.Provider, lendingPoolConfig?: LendingPoolMarketConfigV3);
    deposit({ user, reserve, amount, onBehalfOf, referralCode }: LPDepositParamsType): Promise<EthereumTransactionTypeExtended[]>;
    supply({ user, reserve, amount, onBehalfOf, referralCode }: LPDepositParamsType): Promise<EthereumTransactionTypeExtended[]>;
    signERC20Approval({ user, reserve, amount }: LPSignERC20ApprovalType): Promise<string>;
    supplyWithPermit({ user, reserve, onBehalfOf, amount, referralCode, signature, }: LPSupplyWithPermitType): Promise<EthereumTransactionTypeExtended[]>;
    withdraw({ user, reserve, amount, onBehalfOf, aTokenAddress }: LPWithdrawParamsType): Promise<EthereumTransactionTypeExtended[]>;
    borrow({ user, reserve, amount, interestRateMode, debtTokenAddress, onBehalfOf, referralCode, }: LPBorrowParamsType): Promise<EthereumTransactionTypeExtended[]>;
    repay({ user, reserve, amount, interestRateMode, onBehalfOf }: LPRepayParamsType): Promise<EthereumTransactionTypeExtended[]>;
    repayWithPermit({ user, reserve, amount, interestRateMode, onBehalfOf, signature, }: LPRepayWithPermitParamsType): Promise<EthereumTransactionTypeExtended[]>;
    swapBorrowRateMode({ user, reserve, interestRateMode }: LPSwapBorrowRateMode): EthereumTransactionTypeExtended[];
    setUsageAsCollateral({ user, reserve, usageAsCollateral }: LPSetUsageAsCollateral): EthereumTransactionTypeExtended[];
    liquidationCall({ liquidator, liquidatedUser, debtReserve, collateralReserve, purchaseAmount, getAToken, liquidateAll, }: LPLiquidationCall): Promise<EthereumTransactionTypeExtended[]>;
    swapCollateral({ user, flash, fromAsset, fromAToken, toAsset, fromAmount, minToAmount, permitSignature, swapAll, onBehalfOf, referralCode, augustus, swapCallData, }: LPSwapCollateral): Promise<EthereumTransactionTypeExtended[]>;
    repayWithCollateral({ user, fromAsset, fromAToken, assetToRepay, repayWithAmount, repayAmount, permitSignature, repayAllDebt, rateMode, onBehalfOf, referralCode, flash, useEthPath, }: LPRepayWithCollateral): Promise<EthereumTransactionTypeExtended[]>;
    flashLiquidation({ user, collateralAsset, borrowedAsset, debtTokenCover, liquidateAll, initiator, useEthPath, }: LPFlashLiquidation): Promise<EthereumTransactionTypeExtended[]>;
    repayWithATokens({ user, amount, reserve, rateMode, onBehalfOf }: LPRepayWithATokensType): Promise<EthereumTransactionTypeExtended[]>;
    setUserEMode({ user, categoryId }: LPSetUserEModeType): EthereumTransactionTypeExtended[];
}
//# sourceMappingURL=index.d.ts.map