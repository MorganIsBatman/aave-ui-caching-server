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
exports.RepayWithCollateralAdapterService = void 0;
const BaseService_1 = __importDefault(require("../commons/BaseService"));
const types_1 = require("../commons/types");
const methodValidators_1 = require("../commons/validators/methodValidators");
const paramValidators_1 = require("../commons/validators/paramValidators");
const IRepayWithCollateral__factory_1 = require("./typechain/IRepayWithCollateral__factory");
class RepayWithCollateralAdapterService extends BaseService_1.default {
    constructor(provider, repayWithCollateralAddress) {
        super(provider, IRepayWithCollateral__factory_1.IRepayWithCollateral__factory);
        this.repayWithCollateralAddress = repayWithCollateralAddress !== null && repayWithCollateralAddress !== void 0 ? repayWithCollateralAddress : '';
        this.swapAndRepay = this.swapAndRepay.bind(this);
    }
    swapAndRepay({ user, collateralAsset, debtAsset, collateralAmount, debtRepayAmount, debtRateMode, permit, useEthPath, }, txs) {
        const numericInterestRate = debtRateMode === types_1.InterestRate.Stable ? 1 : 2;
        const repayWithCollateralContract = this.getContractInstance(this.repayWithCollateralAddress);
        const txCallback = this.generateTxCallback({
            rawTxMethod: async () => repayWithCollateralContract.populateTransaction.swapAndRepay(collateralAsset, debtAsset, collateralAmount, debtRepayAmount, numericInterestRate, permit, useEthPath !== null && useEthPath !== void 0 ? useEthPath : false),
            from: user,
        });
        return {
            tx: txCallback,
            txType: types_1.eEthereumTxType.DLP_ACTION,
            gas: this.generateTxPriceEstimation(txs !== null && txs !== void 0 ? txs : [], txCallback, types_1.ProtocolAction.repayCollateral),
        };
    }
}
__decorate([
    methodValidators_1.RepayWithCollateralValidator,
    __param(0, paramValidators_1.isEthAddress('user')),
    __param(0, paramValidators_1.isEthAddress('collateralAsset')),
    __param(0, paramValidators_1.isEthAddress('debtAsset')),
    __param(0, paramValidators_1.isPositiveAmount('collateralAmount')),
    __param(0, paramValidators_1.isPositiveAmount('debtRepayAmount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", Object)
], RepayWithCollateralAdapterService.prototype, "swapAndRepay", null);
exports.RepayWithCollateralAdapterService = RepayWithCollateralAdapterService;
//# sourceMappingURL=index.js.map