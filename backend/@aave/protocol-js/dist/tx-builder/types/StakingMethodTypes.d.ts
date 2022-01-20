import { tEthereumAddress, tStringCurrencyUnits } from '.';
export declare type signStakingParamsType = {
    user: tEthereumAddress;
    amount: tStringCurrencyUnits;
    nonce: string;
};
export declare type stakeWithPermitParamsType = {
    user: tEthereumAddress;
    amount: tStringCurrencyUnits;
    signature: string;
};
export declare type stakeParamsType = {
    user: tEthereumAddress;
    amount: tStringCurrencyUnits;
    onBehalfOf?: tEthereumAddress;
};
export declare type redeemParamsType = {
    user: tEthereumAddress;
    amount: tStringCurrencyUnits;
};
export declare type cooldownParamsType = {
    user: tEthereumAddress;
};
export declare type claimRewardsParamsType = {
    user: tEthereumAddress;
    amount: tStringCurrencyUnits;
};
