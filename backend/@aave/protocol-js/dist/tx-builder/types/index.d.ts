import { providers, BigNumber, BytesLike, PopulatedTransaction } from 'ethers';
export declare type tEthereumAddress = string;
export declare type tStringCurrencyUnits = string;
export declare type tStringDecimalUnits = string;
export declare type ENS = string;
/** InterestRate options */
export declare enum InterestRate {
    None = "None",
    Stable = "Stable",
    Variable = "Variable"
}
export declare enum Market {
    Proto = "proto",
    AMM = "amm"
}
export declare enum Network {
    mainnet = "mainnet",
    ropsten = "ropsten",
    kovan = "kovan",
    polygon = "polygon",
    fork = "fork",
    mumbai = "mumbai",
    polygon_fork = "polygon_fork"
}
export declare enum ChainId {
    mainnet = 1,
    ropsten = 3,
    kovan = 42,
    polygon = 137,
    fork = 1337,
    mumbai = 80001,
    polygon_fork = 1338
}
export declare enum eEthereumTxType {
    ERC20_APPROVAL = "ERC20_APPROVAL",
    DLP_ACTION = "DLP_ACTION",
    GOVERNANCE_ACTION = "GOVERNANCE_ACTION",
    GOV_DELEGATION_ACTION = "GOV_DELEGATION_ACTION",
    STAKE_ACTION = "STAKE_ACTION",
    MIGRATION_LEND_AAVE = "MIGRATION_LEND_AAVE",
    FAUCET_MINT = "FAUCET_MINT",
    REWARD_ACTION = "REWARD_ACTION"
}
export declare enum ProtocolAction {
    default = "default",
    withdraw = "withdraw",
    deposit = "deposit",
    liquidationCall = "liquidationCall",
    liquidationFlash = "liquidationFlash",
    repay = "repay",
    swapCollateral = "swapCollateral",
    repayCollateral = "repayCollateral",
    withdrawETH = "withdrawETH",
    borrowETH = "borrwoETH"
}
export declare enum GovernanceVote {
    Abstain = 0,
    Yes = 1,
    No = 2
}
export declare enum Stake {
    Aave = "Aave",
    Balancer = "Balancer"
}
export declare type GasRecommendationType = {
    [action: string]: {
        limit: string;
        recommended: string;
    };
};
export declare type GeneratedTx = {
    tx: transactionType;
    gas: {
        price: string;
        limit: string;
    };
};
export declare type transactionType = {
    value?: string;
    from?: string;
    to?: string;
    nonce?: number;
    gasLimit?: BigNumber;
    gasPrice?: BigNumber;
    data?: string;
    chainId?: number;
};
export declare type AddressModel = {
    ADDRESS_PROVIDER_ADDRESS: tEthereumAddress;
    LENDINGPOOL_ADDRESS: tEthereumAddress;
    LENDINGPOOL_CORE_ADDRESS: tEthereumAddress;
    SYNTHETIX_PROXY_ADDRESS: tEthereumAddress;
    GOVERNANCE_PROTO_CONTRACT: tEthereumAddress;
    LEND_TO_AAVE_MIGRATOR: tEthereumAddress;
    WETH_GATEWAY: tEthereumAddress;
    FAUCET: tEthereumAddress;
    SWAP_COLLATERAL_ADAPTER: tEthereumAddress;
    REPAY_WITH_COLLATERAL_ADAPTER: tEthereumAddress;
    AAVE_GOVERNANCE_V2: tEthereumAddress;
    AAVE_GOVERNANCE_V2_EXECUTOR_SHORT: tEthereumAddress;
    AAVE_GOVERNANCE_V2_EXECUTOR_LONG: tEthereumAddress;
    AAVE_GOVERNANCE_V2_HELPER: tEthereumAddress;
    FLASHLIQUIDATION: tEthereumAddress;
    INCENTIVES_CONTROLLER: tEthereumAddress;
    INCENTIVES_CONTROLLER_REWARD_TOKEN: tEthereumAddress;
};
export declare type tCommonContractAddressBetweenMarkets = Pick<AddressModel, 'SYNTHETIX_PROXY_ADDRESS' | 'GOVERNANCE_PROTO_CONTRACT' | 'LEND_TO_AAVE_MIGRATOR' | 'WETH_GATEWAY' | 'FAUCET' | 'SWAP_COLLATERAL_ADAPTER' | 'REPAY_WITH_COLLATERAL_ADAPTER' | 'FLASHLIQUIDATION' | 'INCENTIVES_CONTROLLER' | 'INCENTIVES_CONTROLLER_REWARD_TOKEN'>;
export declare type tDistinctContractAddressBetweenMarkets = Pick<AddressModel, 'ADDRESS_PROVIDER_ADDRESS' | 'LENDINGPOOL_ADDRESS' | 'LENDINGPOOL_CORE_ADDRESS'>;
export declare type tDistinctContractAddressBetweenMarketsV2 = Pick<AddressModel, 'LENDINGPOOL_ADDRESS'>;
export declare type tDistinctGovernanceV2Addresses = Pick<AddressModel, 'AAVE_GOVERNANCE_V2' | 'AAVE_GOVERNANCE_V2_EXECUTOR_SHORT' | 'AAVE_GOVERNANCE_V2_EXECUTOR_LONG' | 'AAVE_GOVERNANCE_V2_HELPER'>;
export declare type tdistinctStakingAddressesBetweenTokens = {
    TOKEN_STAKING_ADDRESS: tEthereumAddress;
    STAKING_REWARD_TOKEN_ADDRESS: tEthereumAddress;
    STAKING_HELPER_ADDRESS: tEthereumAddress;
    canUsePermit: boolean;
};
export declare type ContractAddresses = {
    [contractName: string]: tEthereumAddress;
};
export declare type Configuration = {
    network: Network;
    provider: providers.Provider;
};
export declare type EthereumTransactionTypeExtended = {
    txType: eEthereumTxType;
    tx: () => Promise<transactionType>;
    gas: GasResponse;
};
export declare type TransactionGenerationMethod = {
    rawTxMethod: () => Promise<PopulatedTransaction>;
    from: tEthereumAddress;
    value?: string;
    gasSurplus?: number;
    action?: ProtocolAction;
};
export declare type TransactionGasGenerationMethod = {
    txCallback: () => Promise<transactionType>;
    action?: ProtocolAction;
};
export declare type GasType = {
    gasLimit: string | undefined;
    gasPrice: string;
};
export declare type GasResponse = (force?: boolean) => Promise<GasType | null>;
export declare type TokenMetadataType = {
    name: string;
    symbol: string;
    decimals: number;
    address: string;
};
export declare type DefaultProviderKeys = {
    etherscan?: string;
    infura?: string;
    alchemy?: string;
};
export declare type GovernanceConfigType = {
    [network: string]: tDistinctGovernanceV2Addresses;
};
export declare type StakingConfigType = {
    [sToken: string]: {
        [network: string]: tdistinctStakingAddressesBetweenTokens;
    };
};
export declare type CommonConfigType = {
    [network: string]: tCommonContractAddressBetweenMarkets;
};
export declare type LendingPoolConfigType = {
    [pool: string]: {
        [network: string]: tDistinctContractAddressBetweenMarketsV2;
    };
};
export declare type EnabledNetworksType = {
    staking: {
        [sToken: string]: Network[];
    };
    lendingPool: {
        [market: string]: Network[];
    };
    governance: Network[];
    wethGateway: Network[];
    faucet: Network[];
    liquiditySwapAdapter: Network[];
    repayWithCollateralAdapter: Network[];
    aaveGovernanceV2: Network[];
    ltaMigrator: Network[];
    incentivesController: Network[];
};
export declare type PermitSignature = {
    amount: tStringCurrencyUnits;
    deadline: string;
    v: number;
    r: BytesLike;
    s: BytesLike;
};
export declare type FlashLoanParams = {
    assetToSwapToList: tEthereumAddress[];
    minAmountsToReceive: string[];
    swapAllBalance: boolean[];
    permitAmount: string[];
    deadline: string[];
    v: number[];
    r: BytesLike[];
    s: BytesLike[];
};
