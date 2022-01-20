import { ENS, tEthereumAddress, tStringDecimalUnits } from '.';
export declare type GovDelegate = {
    user: tEthereumAddress;
    delegatee: tEthereumAddress | ENS;
    governanceToken: tEthereumAddress;
};
export declare type GovDelegateByType = {
    user: tEthereumAddress;
    delegatee: tEthereumAddress | ENS;
    delegationType: tStringDecimalUnits;
    governanceToken: tEthereumAddress;
};
export declare type GovDelegateBySig = {
    user: tEthereumAddress;
    delegatee: tEthereumAddress | ENS;
    expiry: tStringDecimalUnits;
    signature: string;
    governanceToken: tEthereumAddress;
};
export declare type GovDelegateByTypeBySig = {
    user: tEthereumAddress;
    delegatee: tEthereumAddress | ENS;
    delegationType: tStringDecimalUnits;
    expiry: tStringDecimalUnits;
    signature: string;
    governanceToken: tEthereumAddress;
};
export declare type GovPrepareDelegateSig = {
    delegatee: tEthereumAddress | ENS;
    nonce: tStringDecimalUnits;
    expiry: tStringDecimalUnits;
    governanceTokenName: string;
    governanceToken: tEthereumAddress;
};
export declare type GovPrepareDelegateSigByType = {
    delegatee: tEthereumAddress | ENS;
    type: tStringDecimalUnits;
    nonce: tStringDecimalUnits;
    expiry: tStringDecimalUnits;
    governanceTokenName: string;
    governanceToken: tEthereumAddress;
};
export declare type GovGetDelegateeByType = {
    delegator: tEthereumAddress;
    delegationType: tStringDecimalUnits;
    governanceToken: tEthereumAddress;
};
export declare type GovGetPowerCurrent = {
    user: tEthereumAddress;
    delegationType: tStringDecimalUnits;
    governanceToken: tEthereumAddress;
};
export declare type GovGetPowerAtBlock = {
    user: tEthereumAddress;
    blockNumber: tStringDecimalUnits;
    delegationType: tStringDecimalUnits;
    governanceToken: tEthereumAddress;
};
export declare type GovGetNonce = {
    user: tEthereumAddress;
    governanceToken: tEthereumAddress;
};
