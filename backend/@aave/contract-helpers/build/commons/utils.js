"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mintAmountsPerToken = exports.gasLimitRecommendations = exports.SURPLUS = exports.uniswapEthAmount = exports.API_ETH_MOCK_ADDRESS = exports.SUPER_BIG_ALLOWANCE_NUMBER = exports.MAX_UINT_AMOUNT = exports.DEFAULT_APPROVE_AMOUNT = exports.DEFAULT_NULL_VALUE_ON_TX = exports.getTxValue = exports.decimalsToCurrencyUnits = exports.canBeEnsAddress = exports.valueToWei = void 0;
const bignumber_js_1 = require("bignumber.js");
const ethers_1 = require("ethers");
const types_1 = require("./types");
const valueToWei = (value, decimals) => {
    return new bignumber_js_1.BigNumber(value).shiftedBy(decimals).toFixed(0);
};
exports.valueToWei = valueToWei;
const canBeEnsAddress = (ensAddress) => {
    return ensAddress.toLowerCase().endsWith('.eth');
};
exports.canBeEnsAddress = canBeEnsAddress;
const decimalsToCurrencyUnits = (value, decimals) => new bignumber_js_1.BigNumber(value).shiftedBy(decimals * -1).toFixed();
exports.decimalsToCurrencyUnits = decimalsToCurrencyUnits;
// .div(new BigNumberJs(10).pow(decimals)).toFixed();
const getTxValue = (reserve, amount) => {
    return reserve.toLowerCase() === exports.API_ETH_MOCK_ADDRESS.toLowerCase()
        ? amount
        : exports.DEFAULT_NULL_VALUE_ON_TX;
};
exports.getTxValue = getTxValue;
exports.DEFAULT_NULL_VALUE_ON_TX = ethers_1.BigNumber.from(0).toHexString();
exports.DEFAULT_APPROVE_AMOUNT = ethers_1.constants.MaxUint256.toString();
exports.MAX_UINT_AMOUNT = '115792089237316195423570985008687907853269984665640564039457584007913129639935';
exports.SUPER_BIG_ALLOWANCE_NUMBER = '11579208923731619542357098500868790785326998466564056403945758400791';
exports.API_ETH_MOCK_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
exports.uniswapEthAmount = '0.1';
exports.SURPLUS = '0.05';
exports.gasLimitRecommendations = {
    [types_1.ProtocolAction.default]: {
        limit: '210000',
        recommended: '210000',
    },
    [types_1.ProtocolAction.deposit]: {
        limit: '300000',
        recommended: '300000',
    },
    [types_1.ProtocolAction.withdraw]: {
        limit: '230000',
        recommended: '300000',
    },
    [types_1.ProtocolAction.liquidationCall]: {
        limit: '700000',
        recommended: '700000',
    },
    [types_1.ProtocolAction.liquidationFlash]: {
        limit: '995000',
        recommended: '995000',
    },
    [types_1.ProtocolAction.repay]: {
        limit: '300000',
        recommended: '300000',
    },
    [types_1.ProtocolAction.borrowETH]: {
        limit: '450000',
        recommended: '450000',
    },
    [types_1.ProtocolAction.withdrawETH]: {
        limit: '640000',
        recommended: '640000',
    },
    [types_1.ProtocolAction.swapCollateral]: {
        limit: '1000000',
        recommended: '1000000',
    },
    [types_1.ProtocolAction.repayCollateral]: {
        limit: '700000',
        recommended: '700000',
    },
};
exports.mintAmountsPerToken = {
    AAVE: exports.valueToWei('100', 18),
    BAT: exports.valueToWei('100000', 18),
    BUSD: exports.valueToWei('10000', 18),
    DAI: exports.valueToWei('10000', 18),
    ENJ: exports.valueToWei('100000', 18),
    KNC: exports.valueToWei('10000', 18),
    LEND: exports.valueToWei('1000', 18),
    LINK: exports.valueToWei('1000', 18),
    MANA: exports.valueToWei('100000', 18),
    MKR: exports.valueToWei('10', 18),
    WETH: exports.valueToWei('10', 18),
    REN: exports.valueToWei('10000', 18),
    REP: exports.valueToWei('1000', 18),
    SNX: exports.valueToWei('100', 18),
    SUSD: exports.valueToWei('10000', 18),
    TUSD: '0',
    UNI: exports.valueToWei('1000', 18),
    USDC: exports.valueToWei('10000', 6),
    USDT: exports.valueToWei('10000', 6),
    WBTC: exports.valueToWei('1', 8),
    YFI: exports.valueToWei('1', 18),
    ZRX: exports.valueToWei('100000', 18),
    UNIUSDC: exports.valueToWei(exports.uniswapEthAmount, 6),
    UNIDAI: exports.valueToWei(exports.uniswapEthAmount, 18),
    UNIUSDT: exports.valueToWei(exports.uniswapEthAmount, 6),
    UNIDAIETH: exports.valueToWei(exports.uniswapEthAmount, 18),
    UNIUSDCETH: exports.valueToWei(exports.uniswapEthAmount, 18),
    UNISETHETH: exports.valueToWei(exports.uniswapEthAmount, 18),
    UNILENDETH: exports.valueToWei(exports.uniswapEthAmount, 18),
    UNILINKETH: exports.valueToWei(exports.uniswapEthAmount, 18),
    UNIMKRETH: exports.valueToWei(exports.uniswapEthAmount, 18),
    EURS: exports.valueToWei('10000', 2),
};
//# sourceMappingURL=utils.js.map