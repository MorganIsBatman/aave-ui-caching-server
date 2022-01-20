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
exports.ERC20Service = void 0;
const ethers_1 = require("ethers");
const BaseService_1 = __importDefault(require("../commons/BaseService"));
const types_1 = require("../commons/types");
const utils_1 = require("../commons/utils");
const methodValidators_1 = require("../commons/validators/methodValidators");
const paramValidators_1 = require("../commons/validators/paramValidators");
const IERC20Detailed__factory_1 = require("./typechain/IERC20Detailed__factory");
class ERC20Service extends BaseService_1.default {
    constructor(provider) {
        super(provider, IERC20Detailed__factory_1.IERC20Detailed__factory);
        this.tokenDecimals = {};
        this.tokenMetadata = {};
        this.approve = this.approve.bind(this);
        this.isApproved = this.isApproved.bind(this);
        this.getTokenData = this.getTokenData.bind(this);
        this.decimalsOf = this.decimalsOf.bind(this);
    }
    approve({ user, token, spender, amount }) {
        const erc20Contract = this.getContractInstance(token);
        const txCallback = this.generateTxCallback({
            rawTxMethod: async () => erc20Contract.populateTransaction.approve(spender, amount),
            from: user,
        });
        return {
            tx: txCallback,
            txType: types_1.eEthereumTxType.ERC20_APPROVAL,
            gas: this.generateTxPriceEstimation([], txCallback),
        };
    }
    async isApproved({ user, token, spender, amount }) {
        if (token.toLowerCase() === utils_1.API_ETH_MOCK_ADDRESS.toLowerCase())
            return true;
        const decimals = await this.decimalsOf(token);
        const erc20Contract = this.getContractInstance(token);
        const allowance = await erc20Contract.allowance(user, spender);
        const amountBNWithDecimals = amount === '-1'
            ? ethers_1.BigNumber.from(utils_1.SUPER_BIG_ALLOWANCE_NUMBER)
            : ethers_1.BigNumber.from(utils_1.valueToWei(amount, decimals));
        return allowance.gte(amountBNWithDecimals);
    }
    async decimalsOf(token) {
        if (token.toLowerCase() === utils_1.API_ETH_MOCK_ADDRESS.toLowerCase())
            return 18;
        if (!this.tokenDecimals[token]) {
            const erc20Contract = this.getContractInstance(token);
            this.tokenDecimals[token] = await erc20Contract.decimals();
        }
        return this.tokenDecimals[token];
    }
    async getTokenData(token) {
        if (token.toLowerCase() === utils_1.API_ETH_MOCK_ADDRESS.toLowerCase()) {
            return {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
                address: token,
            };
        }
        // Needed because MKR does not return string for symbol and Name
        if (token.toLowerCase() ===
            '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2'.toLowerCase()) {
            return {
                name: 'Maker',
                symbol: 'MKR',
                decimals: 18,
                address: token,
            };
        }
        if (!this.tokenMetadata[token]) {
            const { name: nameGetter, symbol: symbolGetter } = this.getContractInstance(token);
            const [name, symbol, decimals] = await Promise.all([
                nameGetter(),
                symbolGetter(),
                this.decimalsOf(token),
            ]);
            this.tokenMetadata[token] = {
                name,
                symbol,
                decimals,
                address: token,
            };
        }
        return this.tokenMetadata[token];
    }
}
__decorate([
    methodValidators_1.ERC20Validator,
    __param(0, paramValidators_1.isEthAddress('user')),
    __param(0, paramValidators_1.isEthAddress('token')),
    __param(0, paramValidators_1.isEthAddress('spender')),
    __param(0, paramValidators_1.isPositiveAmount('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], ERC20Service.prototype, "approve", null);
__decorate([
    methodValidators_1.ERC20Validator,
    __param(0, paramValidators_1.isEthAddress('user')),
    __param(0, paramValidators_1.isEthAddress('token')),
    __param(0, paramValidators_1.isEthAddress('spender')),
    __param(0, paramValidators_1.isPositiveOrMinusOneAmount('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ERC20Service.prototype, "isApproved", null);
__decorate([
    methodValidators_1.ERC20Validator,
    __param(0, paramValidators_1.isEthAddress()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ERC20Service.prototype, "decimalsOf", null);
__decorate([
    methodValidators_1.ERC20Validator,
    __param(0, paramValidators_1.isEthAddress()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ERC20Service.prototype, "getTokenData", null);
exports.ERC20Service = ERC20Service;
//# sourceMappingURL=index.js.map