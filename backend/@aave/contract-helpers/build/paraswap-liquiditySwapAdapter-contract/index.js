"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiquiditySwapAdapterService = exports.augustusFromAmountOffsetFromCalldata = void 0;
const BaseService_1 = __importDefault(require("../commons/BaseService"));
const types_1 = require("../commons/types");
const methodValidators_1 = require("../commons/validators/methodValidators");
const paramValidators_1 = require("../commons/validators/paramValidators");
const IParaSwapLiquiditySwapAdapter__factory_1 = require("./typechain/IParaSwapLiquiditySwapAdapter__factory");
function augustusFromAmountOffsetFromCalldata(calldata) {
    switch (calldata.slice(0, 10)) {
        case '0xda8567c8': // Augustus V3 multiSwap
            return 100; // 4 + 3 * 32
        case '0x58b9d179': // Augustus V4 swapOnUniswap
            return 4; // 4 + 0 * 32
        case '0x0863b7ac': // Augustus V4 swapOnUniswapFork
            return 68; // 4 + 2 * 32
        case '0x8f00eccb': // Augustus V4 multiSwap
            return 68; // 4 + 2 * 32
        case '0xec1d21dd': // Augustus V4 megaSwap
            return 68; // 4 + 2 * 32
        case '0x54840d1a': // Augustus V5 swapOnUniswap
            return 4; // 4 + 0 * 32
        case '0xf5661034': // Augustus V5 swapOnUniswapFork
            return 68; // 4 + 2 * 32
        case '0x64466805': // Augustus V5 swapOnZeroXv4
            return 68; // 4 + 2 * 32
        case '0xa94e78ef': // Augustus V5 multiSwap
            return 68; // 4 + 2 * 32
        case '0x46c67b6d': // Augustus V5 megaSwap
            return 68; // 4 + 2 * 32
        default:
            throw new Error('Unrecognized function selector for Augustus');
    }
}
exports.augustusFromAmountOffsetFromCalldata = augustusFromAmountOffsetFromCalldata;
class LiquiditySwapAdapterService extends BaseService_1.default {
    constructor(provider, swapCollateralAdapterAddress) {
        super(provider, IParaSwapLiquiditySwapAdapter__factory_1.IParaSwapLiquiditySwapAdapter__factory);
        this.liquiditySwapAdapterAddress = swapCollateralAdapterAddress !== null && swapCollateralAdapterAddress !== void 0 ? swapCollateralAdapterAddress : '';
        this.swapAndDeposit = this.swapAndDeposit.bind(this);
    }
    swapAndDeposit({ user, assetToSwapFrom, assetToSwapTo, amountToSwap, minAmountToReceive, permitParams, augustus, swapCallData, swapAll, }, txs) {
        const liquiditySwapContract = this.getContractInstance(this.liquiditySwapAdapterAddress);
        const txCallback = this.generateTxCallback({
            rawTxMethod: async () => liquiditySwapContract.populateTransaction.swapAndDeposit(assetToSwapFrom, assetToSwapTo, amountToSwap, minAmountToReceive, swapAll
                ? augustusFromAmountOffsetFromCalldata(swapCallData)
                : 0, swapCallData, augustus, permitParams),
            from: user,
        });
        return {
            tx: txCallback,
            txType: types_1.eEthereumTxType.DLP_ACTION,
            gas: this.generateTxPriceEstimation(txs !== null && txs !== void 0 ? txs : [], txCallback, types_1.ProtocolAction.swapCollateral),
        };
    }
}
__decorate([
    methodValidators_1.LiquiditySwapValidator,
    __param(0, paramValidators_1.isEthAddress('user')),
    __param(0, paramValidators_1.isEthAddress('assetToSwapFrom')),
    __param(0, paramValidators_1.isEthAddress('assetToSwapTo')),
    __param(0, paramValidators_1.isEthAddress('augustus')),
    __param(0, paramValidators_1.isPositiveAmount('amountToSwap')),
    __param(0, paramValidators_1.isPositiveAmount('minAmountToReceive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", Object)
], LiquiditySwapAdapterService.prototype, "swapAndDeposit", null);
exports.LiquiditySwapAdapterService = LiquiditySwapAdapterService;
//# sourceMappingURL=index.js.map