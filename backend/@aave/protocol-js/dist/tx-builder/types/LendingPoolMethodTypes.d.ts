import { BytesLike } from 'ethers';
import { tEthereumAddress, tStringCurrencyUnits, InterestRate, PermitSignature } from '.';
export declare type LPDepositParamsType = {
    user: tEthereumAddress;
    reserve: tEthereumAddress;
    amount: tStringCurrencyUnits;
    onBehalfOf?: tEthereumAddress;
    referralCode?: string;
};
export declare type LPWithdrawParamsType = {
    user: tEthereumAddress;
    reserve: tEthereumAddress;
    amount: tStringCurrencyUnits;
    onBehalfOf?: tEthereumAddress;
    aTokenAddress?: tEthereumAddress;
};
export declare type LPBorrowParamsType = {
    user: tEthereumAddress;
    reserve: tEthereumAddress;
    amount: tStringCurrencyUnits;
    interestRateMode: InterestRate;
    debtTokenAddress?: tEthereumAddress;
    onBehalfOf?: tEthereumAddress;
    referralCode?: string;
};
export declare type LPRepayParamsType = {
    user: tEthereumAddress;
    reserve: tEthereumAddress;
    amount: tStringCurrencyUnits;
    interestRateMode: InterestRate;
    onBehalfOf?: tEthereumAddress;
};
export declare type LPSwapBorrowRateMode = {
    user: tEthereumAddress;
    reserve: tEthereumAddress;
    interestRateMode: InterestRate;
};
export declare type LPSetUsageAsCollateral = {
    user: tEthereumAddress;
    reserve: tEthereumAddress;
    usageAsCollateral: boolean;
};
export declare type LPLiquidationCall = {
    liquidator: tEthereumAddress;
    liquidatedUser: tEthereumAddress;
    debtReserve: tEthereumAddress;
    collateralReserve: tEthereumAddress;
    purchaseAmount: tStringCurrencyUnits;
    getAToken?: boolean;
    liquidateAll?: boolean;
};
export declare type LPSwapCollateral = {
    user: tEthereumAddress;
    flash?: boolean;
    fromAsset: tEthereumAddress;
    fromAToken: tEthereumAddress;
    toAsset: tEthereumAddress;
    fromAmount: tStringCurrencyUnits;
    minToAmount: tStringCurrencyUnits;
    permitSignature?: PermitSignature;
    swapAll: boolean;
    onBehalfOf?: tEthereumAddress;
    referralCode?: string;
    augustus: tEthereumAddress;
    swapCallData: BytesLike;
};
export declare type LPRepayWithCollateral = {
    user: tEthereumAddress;
    fromAsset: tEthereumAddress;
    fromAToken: tEthereumAddress;
    assetToRepay: tEthereumAddress;
    repayWithAmount: tStringCurrencyUnits;
    repayAmount: tStringCurrencyUnits;
    permitSignature?: PermitSignature;
    repayAllDebt?: boolean;
    rateMode: InterestRate;
    onBehalfOf?: tEthereumAddress;
    referralCode?: string;
    flash?: boolean;
    useEthPath?: boolean;
};
export declare type LPFlashLoan = {
    user: tEthereumAddress;
    receiver: tEthereumAddress;
    assets: tEthereumAddress[];
    amounts: tStringCurrencyUnits[];
    modes: InterestRate[];
    onBehalfOf?: tEthereumAddress;
    referralCode?: string;
};
export declare type LPFlashLiquidation = {
    user: tEthereumAddress;
    collateralAsset: tEthereumAddress;
    borrowedAsset: tEthereumAddress;
    debtTokenCover: string;
    liquidateAll: boolean;
    initiator: tEthereumAddress;
    useEthPath: boolean;
};
