import { InterestRate, tEthereumAddress, tStringCurrencyUnits } from '.';
export declare type WETHDepositParamsType = {
    lendingPool: tEthereumAddress;
    user: tEthereumAddress;
    amount: tStringCurrencyUnits;
    onBehalfOf?: tEthereumAddress;
    referralCode?: string;
};
export declare type WETHWithdrawParamsType = {
    lendingPool: tEthereumAddress;
    user: tEthereumAddress;
    amount: tStringCurrencyUnits;
    aTokenAddress: tEthereumAddress;
    onBehalfOf?: tEthereumAddress;
};
export declare type WETHRepayParamsType = {
    lendingPool: tEthereumAddress;
    user: tEthereumAddress;
    amount: tStringCurrencyUnits;
    interestRateMode: InterestRate;
    onBehalfOf?: tEthereumAddress;
};
export declare type WETHBorrowParamsType = {
    lendingPool: tEthereumAddress;
    user: tEthereumAddress;
    amount: tStringCurrencyUnits;
    debtTokenAddress: tEthereumAddress;
    interestRateMode: InterestRate;
    referralCode?: string;
};
