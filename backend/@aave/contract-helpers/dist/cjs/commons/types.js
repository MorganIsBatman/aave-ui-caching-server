"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stake = exports.GovernanceVote = exports.ProtocolAction = exports.eEthereumTxType = exports.ChainId = exports.ChainIdToNetwork = exports.InterestRate = void 0;
/** InterestRate options */
var InterestRate;
(function (InterestRate) {
    InterestRate["None"] = "None";
    InterestRate["Stable"] = "Stable";
    InterestRate["Variable"] = "Variable";
})(InterestRate = exports.InterestRate || (exports.InterestRate = {}));
exports.ChainIdToNetwork = {
    1: 'mainnet',
    3: 'ropsten',
    4: 'rinkeby',
    42: 'kovan',
    100: 'xDAI',
    137: 'polygon',
    80001: 'mumbai',
    43114: 'avalanche',
    43113: 'fuji',
    42161: 'arbitrum_one',
    421611: 'arbitrum_rinkeby',
};
var ChainId;
(function (ChainId) {
    ChainId[ChainId["mainnet"] = 1] = "mainnet";
    ChainId[ChainId["ropsten"] = 3] = "ropsten";
    ChainId[ChainId["rinkeby"] = 4] = "rinkeby";
    ChainId[ChainId["kovan"] = 42] = "kovan";
    ChainId[ChainId["xdai"] = 100] = "xdai";
    ChainId[ChainId["polygon"] = 137] = "polygon";
    ChainId[ChainId["mumbai"] = 80001] = "mumbai";
    ChainId[ChainId["avalanche"] = 43114] = "avalanche";
    ChainId[ChainId["fuji"] = 43113] = "fuji";
    ChainId[ChainId["arbitrum_one"] = 42161] = "arbitrum_one";
    ChainId[ChainId["arbitrum_rinkeby"] = 421611] = "arbitrum_rinkeby";
})(ChainId = exports.ChainId || (exports.ChainId = {}));
var eEthereumTxType;
(function (eEthereumTxType) {
    eEthereumTxType["ERC20_APPROVAL"] = "ERC20_APPROVAL";
    eEthereumTxType["DLP_ACTION"] = "DLP_ACTION";
    eEthereumTxType["GOVERNANCE_ACTION"] = "GOVERNANCE_ACTION";
    eEthereumTxType["GOV_DELEGATION_ACTION"] = "GOV_DELEGATION_ACTION";
    eEthereumTxType["STAKE_ACTION"] = "STAKE_ACTION";
    eEthereumTxType["MIGRATION_LEND_AAVE"] = "MIGRATION_LEND_AAVE";
    eEthereumTxType["FAUCET_MINT"] = "FAUCET_MINT";
    eEthereumTxType["REWARD_ACTION"] = "REWARD_ACTION";
})(eEthereumTxType = exports.eEthereumTxType || (exports.eEthereumTxType = {}));
var ProtocolAction;
(function (ProtocolAction) {
    ProtocolAction["default"] = "default";
    ProtocolAction["withdraw"] = "withdraw";
    ProtocolAction["deposit"] = "deposit";
    ProtocolAction["liquidationCall"] = "liquidationCall";
    ProtocolAction["liquidationFlash"] = "liquidationFlash";
    ProtocolAction["repay"] = "repay";
    ProtocolAction["swapCollateral"] = "swapCollateral";
    ProtocolAction["repayCollateral"] = "repayCollateral";
    ProtocolAction["withdrawETH"] = "withdrawETH";
    ProtocolAction["borrowETH"] = "borrwoETH";
})(ProtocolAction = exports.ProtocolAction || (exports.ProtocolAction = {}));
var GovernanceVote;
(function (GovernanceVote) {
    GovernanceVote[GovernanceVote["Abstain"] = 0] = "Abstain";
    GovernanceVote[GovernanceVote["Yes"] = 1] = "Yes";
    GovernanceVote[GovernanceVote["No"] = 2] = "No";
})(GovernanceVote = exports.GovernanceVote || (exports.GovernanceVote = {}));
var Stake;
(function (Stake) {
    Stake["aave"] = "aave";
    Stake["bpt"] = "bpt";
})(Stake = exports.Stake || (exports.Stake = {}));
//# sourceMappingURL=types.js.map