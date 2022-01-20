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
exports.SynthetixService = exports.synthetixProxyByChainId = void 0;
const ethers_1 = require("ethers");
const BaseService_1 = __importDefault(require("../commons/BaseService"));
const types_1 = require("../commons/types");
const methodValidators_1 = require("../commons/validators/methodValidators");
const paramValidators_1 = require("../commons/validators/paramValidators");
const ISynthetix__factory_1 = require("./typechain/ISynthetix__factory");
exports.synthetixProxyByChainId = {
    [types_1.ChainId.mainnet]: '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f',
};
class SynthetixService extends BaseService_1.default {
    constructor(provider) {
        super(provider, ISynthetix__factory_1.ISynthetix__factory);
        this.synthetixValidation = this.synthetixValidation.bind(this);
    }
    async synthetixValidation({ user, reserve, amount, }) {
        const { chainId } = await this.provider.getNetwork();
        if (exports.synthetixProxyByChainId[chainId] &&
            reserve.toLowerCase() === exports.synthetixProxyByChainId[chainId].toLowerCase()) {
            const synthContract = this.getContractInstance(exports.synthetixProxyByChainId[chainId]);
            const transferableAmount = await synthContract.transferableSynthetix(user);
            return ethers_1.BigNumber.from(amount).lte(transferableAmount);
        }
        return true;
    }
}
__decorate([
    methodValidators_1.SynthetixValidator,
    __param(0, paramValidators_1.isEthAddress('user')),
    __param(0, paramValidators_1.isEthAddress('reserve')),
    __param(0, paramValidators_1.isPositiveAmount('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SynthetixService.prototype, "synthetixValidation", null);
exports.SynthetixService = SynthetixService;
//# sourceMappingURL=index.js.map