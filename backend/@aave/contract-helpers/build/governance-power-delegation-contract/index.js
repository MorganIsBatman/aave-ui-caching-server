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
exports.GovernancePowerDelegationTokenService = void 0;
const bytes_1 = require("@ethersproject/bytes");
const BaseService_1 = __importDefault(require("../commons/BaseService"));
const types_1 = require("../commons/types");
const utils_1 = require("../commons/utils");
const methodValidators_1 = require("../commons/validators/methodValidators");
const paramValidators_1 = require("../commons/validators/paramValidators");
const IGovernancePowerDelegationToken__factory_1 = require("./typechain/IGovernancePowerDelegationToken__factory");
class GovernancePowerDelegationTokenService extends BaseService_1.default {
    constructor(provider) {
        super(provider, IGovernancePowerDelegationToken__factory_1.IGovernancePowerDelegationToken__factory);
    }
    async delegate({ user, delegatee, governanceToken }) {
        const txs = [];
        const governanceDelegationToken = this.getContractInstance(governanceToken);
        const delegateeAddress = await this.getDelegateeAddress(delegatee);
        const txCallback = this.generateTxCallback({
            rawTxMethod: async () => governanceDelegationToken.populateTransaction.delegate(delegateeAddress),
            from: user,
        });
        txs.push({
            tx: txCallback,
            txType: types_1.eEthereumTxType.GOV_DELEGATION_ACTION,
            gas: this.generateTxPriceEstimation(txs, txCallback),
        });
        return txs;
    }
    async delegateByType({ user, delegatee, delegationType, governanceToken }) {
        const txs = [];
        const governanceDelegationToken = this.getContractInstance(governanceToken);
        const delegateeAddress = await this.getDelegateeAddress(delegatee);
        const txCallback = this.generateTxCallback({
            rawTxMethod: async () => governanceDelegationToken.populateTransaction.delegateByType(delegateeAddress, delegationType),
            from: user,
        });
        txs.push({
            tx: txCallback,
            txType: types_1.eEthereumTxType.GOV_DELEGATION_ACTION,
            gas: this.generateTxPriceEstimation(txs, txCallback),
        });
        return txs;
    }
    async delegateBySig({ user, delegatee, expiry, signature, governanceToken }) {
        const txs = [];
        const governanceDelegationToken = this.getContractInstance(governanceToken);
        const nonce = await this.getNonce({ user, governanceToken });
        const { v, r, s } = bytes_1.splitSignature(signature);
        const delegateeAddress = await this.getDelegateeAddress(delegatee);
        const txCallback = this.generateTxCallback({
            rawTxMethod: async () => governanceDelegationToken.populateTransaction.delegateBySig(delegateeAddress, nonce, expiry, v, r, s),
            from: user,
        });
        txs.push({
            tx: txCallback,
            txType: types_1.eEthereumTxType.GOV_DELEGATION_ACTION,
            gas: this.generateTxPriceEstimation(txs, txCallback),
        });
        return txs;
    }
    async delegateByTypeBySig({ user, delegatee, delegationType, expiry, signature, governanceToken, }) {
        const txs = [];
        const governanceDelegationToken = this.getContractInstance(governanceToken);
        const nonce = await this.getNonce({ user, governanceToken });
        const { v, r, s } = bytes_1.splitSignature(signature);
        const delegateeAddress = await this.getDelegateeAddress(delegatee);
        const txCallback = this.generateTxCallback({
            rawTxMethod: async () => governanceDelegationToken.populateTransaction.delegateByTypeBySig(delegateeAddress, delegationType, nonce, expiry, v, r, s),
            from: user,
        });
        txs.push({
            tx: txCallback,
            txType: types_1.eEthereumTxType.GOV_DELEGATION_ACTION,
            gas: this.generateTxPriceEstimation(txs, txCallback),
        });
        return txs;
    }
    async prepareDelegateSignature({ delegatee, nonce, expiry, governanceTokenName, governanceToken, }) {
        const delegateeAddress = await this.getDelegateeAddress(delegatee);
        const { chainId } = await this.provider.getNetwork();
        const typeData = {
            types: {
                EIP712Domain: [
                    { name: 'name', type: 'string' },
                    { name: 'chainId', type: 'uint256' },
                    { name: 'verifyingContract', type: 'address' },
                ],
                Delegate: [
                    { name: 'delegatee', type: 'address' },
                    { name: 'nonce', type: 'uint256' },
                    { name: 'expiry', type: 'uint256' },
                ],
            },
            primaryType: 'Delegate',
            domain: {
                name: governanceTokenName,
                chainId,
                verifyingContract: governanceToken,
            },
            message: {
                delegatee: delegateeAddress,
                nonce,
                expiry,
            },
        };
        return JSON.stringify(typeData);
    }
    async prepareDelegateByTypeSignature({ delegatee, type, nonce, expiry, governanceTokenName, governanceToken, }) {
        const delegateeAddress = await this.getDelegateeAddress(delegatee);
        const { chainId } = await this.provider.getNetwork();
        const typeData = {
            types: {
                EIP712Domain: [
                    { name: 'name', type: 'string' },
                    { name: 'chainId', type: 'uint256' },
                    { name: 'verifyingContract', type: 'address' },
                ],
                DelegateByType: [
                    { name: 'delegatee', type: 'address' },
                    { name: 'type', type: 'uint256' },
                    { name: 'nonce', type: 'uint256' },
                    { name: 'expiry', type: 'uint256' },
                ],
            },
            primaryType: 'DelegateByType',
            domain: {
                name: governanceTokenName,
                chainId,
                verifyingContract: governanceToken,
            },
            message: {
                delegatee: delegateeAddress,
                type,
                nonce,
                expiry,
            },
        };
        return JSON.stringify(typeData);
    }
    async getDelegateeByType({ delegator, delegationType, governanceToken }) {
        const governanceDelegationToken = this.getContractInstance(governanceToken);
        return governanceDelegationToken.getDelegateeByType(delegator, delegationType);
    }
    async getPowerCurrent({ user, delegationType, governanceToken }) {
        const governanceDelegationToken = this.getContractInstance(governanceToken);
        return (await governanceDelegationToken.getPowerCurrent(user, delegationType)).toString();
    }
    async getPowerAtBlock({ user, blockNumber, delegationType, governanceToken }) {
        const governanceDelegationToken = this.getContractInstance(governanceToken);
        return (await governanceDelegationToken.getPowerAtBlock(user, blockNumber, delegationType)).toString();
    }
    async getNonce({ user, governanceToken }) {
        const governanceDelegationToken = this.getContractInstance(governanceToken);
        return (await governanceDelegationToken._nonces(user)).toString();
    }
    async getDelegateeAddress(delegatee) {
        if (utils_1.canBeEnsAddress(delegatee)) {
            const delegateeAddress = await this.provider.resolveName(delegatee);
            if (!delegateeAddress)
                throw new Error(`Address: ${delegatee} is not a valid ENS address`);
            return delegateeAddress;
        }
        return delegatee;
    }
}
__decorate([
    methodValidators_1.GovDelegationValidator,
    __param(0, paramValidators_1.isEthAddress('user')),
    __param(0, paramValidators_1.isEthAddressOrENS('delegatee')),
    __param(0, paramValidators_1.isEthAddress('governanceToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GovernancePowerDelegationTokenService.prototype, "delegate", null);
__decorate([
    methodValidators_1.GovDelegationValidator,
    __param(0, paramValidators_1.isEthAddress('user')),
    __param(0, paramValidators_1.isEthAddressOrENS('delegatee')),
    __param(0, paramValidators_1.isEthAddress('governanceToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GovernancePowerDelegationTokenService.prototype, "delegateByType", null);
__decorate([
    methodValidators_1.GovDelegationValidator,
    __param(0, paramValidators_1.isEthAddress('user')),
    __param(0, paramValidators_1.isEthAddressOrENS('delegatee')),
    __param(0, paramValidators_1.isEthAddress('governanceToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GovernancePowerDelegationTokenService.prototype, "delegateBySig", null);
__decorate([
    methodValidators_1.GovDelegationValidator,
    __param(0, paramValidators_1.isEthAddress('user')),
    __param(0, paramValidators_1.isEthAddressOrENS('delegatee')),
    __param(0, paramValidators_1.isEthAddress('governanceToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GovernancePowerDelegationTokenService.prototype, "delegateByTypeBySig", null);
__decorate([
    methodValidators_1.GovDelegationValidator,
    __param(0, paramValidators_1.isEthAddressOrENS('delegatee')),
    __param(0, paramValidators_1.isEthAddress('governanceToken')),
    __param(0, paramValidators_1.is0OrPositiveAmount('nonce')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GovernancePowerDelegationTokenService.prototype, "prepareDelegateSignature", null);
__decorate([
    methodValidators_1.GovDelegationValidator,
    __param(0, paramValidators_1.isEthAddressOrENS('delegatee')),
    __param(0, paramValidators_1.isEthAddress('governanceToken')),
    __param(0, paramValidators_1.is0OrPositiveAmount('nonce')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GovernancePowerDelegationTokenService.prototype, "prepareDelegateByTypeSignature", null);
__decorate([
    methodValidators_1.GovDelegationValidator,
    __param(0, paramValidators_1.isEthAddress('delegator')),
    __param(0, paramValidators_1.isEthAddress('governanceToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GovernancePowerDelegationTokenService.prototype, "getDelegateeByType", null);
__decorate([
    methodValidators_1.GovDelegationValidator,
    __param(0, paramValidators_1.isEthAddress('user')),
    __param(0, paramValidators_1.isEthAddress('governanceToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GovernancePowerDelegationTokenService.prototype, "getPowerCurrent", null);
__decorate([
    methodValidators_1.GovDelegationValidator,
    __param(0, paramValidators_1.isEthAddress('user')),
    __param(0, paramValidators_1.isEthAddress('governanceToken')),
    __param(0, paramValidators_1.isPositiveAmount('blockNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GovernancePowerDelegationTokenService.prototype, "getPowerAtBlock", null);
__decorate([
    methodValidators_1.GovDelegationValidator,
    __param(0, paramValidators_1.isEthAddress('user')),
    __param(0, paramValidators_1.isEthAddress('governanceToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GovernancePowerDelegationTokenService.prototype, "getNonce", null);
exports.GovernancePowerDelegationTokenService = GovernancePowerDelegationTokenService;
//# sourceMappingURL=index.js.map