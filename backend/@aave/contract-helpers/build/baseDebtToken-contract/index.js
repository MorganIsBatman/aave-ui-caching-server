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
exports.BaseDebtToken = void 0;
const ethers_1 = require("ethers");
const BaseService_1 = __importDefault(require("../commons/BaseService"));
const types_1 = require("../commons/types");
const utils_1 = require("../commons/utils");
const methodValidators_1 = require("../commons/validators/methodValidators");
const paramValidators_1 = require("../commons/validators/paramValidators");
const IDebtTokenBase__factory_1 = require("./typechain/IDebtTokenBase__factory");
class BaseDebtToken extends BaseService_1.default {
    constructor(provider, erc20Service) {
        super(provider, IDebtTokenBase__factory_1.IDebtTokenBase__factory);
        this.erc20Service = erc20Service;
    }
    approveDelegation({ user, delegatee, debtTokenAddress, amount }) {
        const debtTokenContract = this.getContractInstance(debtTokenAddress);
        const txCallback = this.generateTxCallback({
            rawTxMethod: async () => debtTokenContract.populateTransaction.approveDelegation(delegatee, amount),
            from: user,
        });
        return {
            tx: txCallback,
            txType: types_1.eEthereumTxType.ERC20_APPROVAL,
            gas: this.generateTxPriceEstimation([], txCallback),
        };
    }
    async isDelegationApproved({ debtTokenAddress, allowanceGiver, allowanceReceiver, amount, }) {
        const decimals = await this.erc20Service.decimalsOf(debtTokenAddress);
        const debtTokenContract = this.getContractInstance(debtTokenAddress);
        const delegatedAllowance = await debtTokenContract.borrowAllowance(allowanceGiver, allowanceReceiver);
        const amountBNWithDecimals = ethers_1.BigNumber.from(utils_1.valueToWei(amount, decimals));
        return delegatedAllowance.gt(amountBNWithDecimals);
    }
}
__decorate([
    methodValidators_1.DebtTokenValidator,
    __param(0, paramValidators_1.isEthAddress('user')),
    __param(0, paramValidators_1.isEthAddress('delegatee')),
    __param(0, paramValidators_1.isEthAddress('debtTokenAddress')),
    __param(0, paramValidators_1.isPositiveAmount('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], BaseDebtToken.prototype, "approveDelegation", null);
__decorate([
    methodValidators_1.DebtTokenValidator,
    __param(0, paramValidators_1.isEthAddress('debtTokenAddress')),
    __param(0, paramValidators_1.isEthAddress('allowanceGiver')),
    __param(0, paramValidators_1.isEthAddress('allowanceReceiver')),
    __param(0, paramValidators_1.isPositiveAmount('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BaseDebtToken.prototype, "isDelegationApproved", null);
exports.BaseDebtToken = BaseDebtToken;
//# sourceMappingURL=index.js.map