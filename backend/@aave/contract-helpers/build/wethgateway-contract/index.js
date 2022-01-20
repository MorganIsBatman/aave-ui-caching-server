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
exports.WETHGatewayService = void 0;
const ethers_1 = require("ethers");
const baseDebtToken_contract_1 = require("../baseDebtToken-contract");
const BaseService_1 = __importDefault(require("../commons/BaseService"));
const types_1 = require("../commons/types");
const utils_1 = require("../commons/utils");
const methodValidators_1 = require("../commons/validators/methodValidators");
const paramValidators_1 = require("../commons/validators/paramValidators");
const IWETHGateway__factory_1 = require("./typechain/IWETHGateway__factory");
class WETHGatewayService extends BaseService_1.default {
    constructor(provider, erc20Service, wethGatewayAddress) {
        super(provider, IWETHGateway__factory_1.IWETHGateway__factory);
        this.erc20Service = erc20Service;
        this.baseDebtTokenService = new baseDebtToken_contract_1.BaseDebtToken(this.provider, this.erc20Service);
        this.wethGatewayAddress = wethGatewayAddress !== null && wethGatewayAddress !== void 0 ? wethGatewayAddress : '';
        this.depositETH = this.depositETH.bind(this);
        this.withdrawETH = this.withdrawETH.bind(this);
        this.repayETH = this.repayETH.bind(this);
        this.borrowETH = this.borrowETH.bind(this);
    }
    depositETH({ lendingPool, user, amount, onBehalfOf, referralCode, }) {
        const convertedAmount = utils_1.valueToWei(amount, 18);
        const wethGatewayContract = this.getContractInstance(this.wethGatewayAddress);
        const txCallback = this.generateTxCallback({
            rawTxMethod: async () => wethGatewayContract.populateTransaction.depositETH(lendingPool, onBehalfOf !== null && onBehalfOf !== void 0 ? onBehalfOf : user, referralCode !== null && referralCode !== void 0 ? referralCode : '0'),
            from: user,
            value: convertedAmount,
        });
        return [
            {
                tx: txCallback,
                txType: types_1.eEthereumTxType.DLP_ACTION,
                gas: this.generateTxPriceEstimation([], txCallback),
            },
        ];
    }
    async borrowETH({ lendingPool, user, amount, debtTokenAddress, interestRateMode, referralCode, }) {
        const txs = [];
        const convertedAmount = utils_1.valueToWei(amount, 18);
        const numericRateMode = interestRateMode === types_1.InterestRate.Variable ? 2 : 1;
        const delegationApproved = await this.baseDebtTokenService.isDelegationApproved({
            debtTokenAddress,
            allowanceGiver: user,
            allowanceReceiver: this.wethGatewayAddress,
            amount,
        });
        if (!delegationApproved) {
            const approveDelegationTx = this.baseDebtTokenService.approveDelegation({
                user,
                delegatee: this.wethGatewayAddress,
                debtTokenAddress,
                amount: ethers_1.constants.MaxUint256.toString(),
            });
            txs.push(approveDelegationTx);
        }
        const wethGatewayContract = this.getContractInstance(this.wethGatewayAddress);
        const txCallback = this.generateTxCallback({
            rawTxMethod: async () => wethGatewayContract.populateTransaction.borrowETH(lendingPool, convertedAmount, numericRateMode, referralCode !== null && referralCode !== void 0 ? referralCode : '0'),
            from: user,
        });
        txs.push({
            tx: txCallback,
            txType: types_1.eEthereumTxType.DLP_ACTION,
            gas: this.generateTxPriceEstimation(txs, txCallback, types_1.ProtocolAction.borrowETH),
        });
        return txs;
    }
    async withdrawETH({ lendingPool, user, amount, onBehalfOf, aTokenAddress, }) {
        const txs = [];
        const { isApproved, approve } = this.erc20Service;
        const convertedAmount = amount === '-1'
            ? ethers_1.constants.MaxUint256.toString()
            : utils_1.valueToWei(amount, 18);
        const approved = await isApproved({
            token: aTokenAddress,
            user,
            spender: this.wethGatewayAddress,
            amount,
        });
        if (!approved) {
            const approveTx = approve({
                user,
                token: aTokenAddress,
                spender: this.wethGatewayAddress,
                amount: ethers_1.constants.MaxUint256.toString(),
            });
            txs.push(approveTx);
        }
        const wethGatewayContract = this.getContractInstance(this.wethGatewayAddress);
        const txCallback = this.generateTxCallback({
            rawTxMethod: async () => wethGatewayContract.populateTransaction.withdrawETH(lendingPool, convertedAmount, onBehalfOf !== null && onBehalfOf !== void 0 ? onBehalfOf : user),
            from: user,
        });
        txs.push({
            tx: txCallback,
            txType: types_1.eEthereumTxType.DLP_ACTION,
            gas: this.generateTxPriceEstimation(txs, txCallback, types_1.ProtocolAction.withdrawETH),
        });
        return txs;
    }
    repayETH({ lendingPool, user, amount, interestRateMode, onBehalfOf, }) {
        const convertedAmount = utils_1.valueToWei(amount, 18);
        const numericRateMode = interestRateMode === types_1.InterestRate.Variable ? 2 : 1;
        const wethGatewayContract = this.getContractInstance(this.wethGatewayAddress);
        const txCallback = this.generateTxCallback({
            rawTxMethod: async () => wethGatewayContract.populateTransaction.repayETH(lendingPool, convertedAmount, numericRateMode, onBehalfOf !== null && onBehalfOf !== void 0 ? onBehalfOf : user),
            gasSurplus: 30,
            from: user,
            value: convertedAmount,
        });
        return [
            {
                tx: txCallback,
                txType: types_1.eEthereumTxType.DLP_ACTION,
                gas: this.generateTxPriceEstimation([], txCallback),
            },
        ];
    }
}
__decorate([
    methodValidators_1.WETHValidator,
    __param(0, paramValidators_1.isEthAddress('lendingPool')),
    __param(0, paramValidators_1.isEthAddress('user')),
    __param(0, paramValidators_1.isEthAddress('onBehalfOf')),
    __param(0, paramValidators_1.isPositiveAmount('amount')),
    __param(0, paramValidators_1.is0OrPositiveAmount('referralCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Array)
], WETHGatewayService.prototype, "depositETH", null);
__decorate([
    methodValidators_1.WETHValidator,
    __param(0, paramValidators_1.isEthAddress('lendingPool')),
    __param(0, paramValidators_1.isEthAddress('user')),
    __param(0, paramValidators_1.isPositiveAmount('amount')),
    __param(0, paramValidators_1.isEthAddress('debtTokenAddress')),
    __param(0, paramValidators_1.is0OrPositiveAmount('referralCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WETHGatewayService.prototype, "borrowETH", null);
__decorate([
    methodValidators_1.WETHValidator,
    __param(0, paramValidators_1.isEthAddress('lendingPool')),
    __param(0, paramValidators_1.isEthAddress('user')),
    __param(0, paramValidators_1.isEthAddress('onBehalfOf')),
    __param(0, paramValidators_1.isPositiveOrMinusOneAmount('amount')),
    __param(0, paramValidators_1.isEthAddress('aTokenAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WETHGatewayService.prototype, "withdrawETH", null);
__decorate([
    methodValidators_1.WETHValidator,
    __param(0, paramValidators_1.isEthAddress('lendingPool')),
    __param(0, paramValidators_1.isEthAddress('user')),
    __param(0, paramValidators_1.isEthAddress('onBehalfOf')),
    __param(0, paramValidators_1.isPositiveAmount('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Array)
], WETHGatewayService.prototype, "repayETH", null);
exports.WETHGatewayService = WETHGatewayService;
//# sourceMappingURL=index.js.map