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
exports.StakingService = void 0;
const ethers_1 = require("ethers");
const BaseService_1 = __importDefault(require("../commons/BaseService"));
const types_1 = require("../commons/types");
const utils_1 = require("../commons/utils");
const methodValidators_1 = require("../commons/validators/methodValidators");
const paramValidators_1 = require("../commons/validators/paramValidators");
const erc20_contract_1 = require("../erc20-contract");
const IAaveStakingHelper__factory_1 = require("./typechain/IAaveStakingHelper__factory");
const IStakedToken__factory_1 = require("./typechain/IStakedToken__factory");
class StakingService extends BaseService_1.default {
    constructor(provider, stakingServiceConfig) {
        var _a;
        super(provider, IStakedToken__factory_1.IStakedToken__factory);
        this.erc20Service = new erc20_contract_1.ERC20Service(provider);
        this.stakingContractAddress = stakingServiceConfig.TOKEN_STAKING_ADDRESS;
        this.stakingHelperContractAddress = (_a = stakingServiceConfig.STAKING_HELPER_ADDRESS) !== null && _a !== void 0 ? _a : '';
        if (this.stakingHelperContractAddress !== '') {
            this.stakingHelperContract = IAaveStakingHelper__factory_1.IAaveStakingHelper__factory.connect(this.stakingHelperContractAddress, provider);
        }
    }
    async signStaking(user, amount, nonce) {
        const { getTokenData } = this.erc20Service;
        const stakingContract = this.getContractInstance(this.stakingContractAddress);
        // eslint-disable-next-line new-cap
        const stakedToken = await stakingContract.STAKED_TOKEN();
        const { name, decimals } = await getTokenData(stakedToken);
        const convertedAmount = utils_1.valueToWei(amount, decimals);
        const { chainId } = await this.provider.getNetwork();
        const typeData = {
            types: {
                EIP712Domain: [
                    { name: 'name', type: 'string' },
                    { name: 'version', type: 'string' },
                    { name: 'chainId', type: 'uint256' },
                    { name: 'verifyingContract', type: 'address' },
                ],
                Permit: [
                    { name: 'owner', type: 'address' },
                    { name: 'spender', type: 'address' },
                    { name: 'value', type: 'uint256' },
                    { name: 'nonce', type: 'uint256' },
                    { name: 'deadline', type: 'uint256' },
                ],
            },
            primaryType: 'Permit',
            domain: {
                name,
                version: '1',
                chainId,
                verifyingContract: stakedToken,
            },
            message: {
                owner: user,
                spender: this.stakingHelperContractAddress,
                value: convertedAmount,
                nonce,
                deadline: ethers_1.constants.MaxUint256.toString(),
            },
        };
        return JSON.stringify(typeData);
    }
    async stakeWithPermit(user, amount, signature) {
        const txs = [];
        const { decimalsOf } = this.erc20Service;
        const stakingContract = this.getContractInstance(this.stakingContractAddress);
        // eslint-disable-next-line new-cap
        const stakedToken = await stakingContract.STAKED_TOKEN();
        const stakedTokenDecimals = await decimalsOf(stakedToken);
        const convertedAmount = utils_1.valueToWei(amount, stakedTokenDecimals);
        const sig = ethers_1.utils.splitSignature(signature);
        const txCallback = this.generateTxCallback({
            rawTxMethod: async () => this.stakingHelperContract.populateTransaction.stake(user, convertedAmount, sig.v, sig.r, sig.s),
            from: user,
        });
        txs.push({
            tx: txCallback,
            txType: types_1.eEthereumTxType.STAKE_ACTION,
            gas: this.generateTxPriceEstimation(txs, txCallback),
        });
        return txs;
    }
    async stake(user, amount, onBehalfOf) {
        const txs = [];
        const { decimalsOf, isApproved, approve } = this.erc20Service;
        const stakingContract = this.getContractInstance(this.stakingContractAddress);
        // eslint-disable-next-line new-cap
        const stakedToken = await stakingContract.STAKED_TOKEN();
        const stakedTokenDecimals = await decimalsOf(stakedToken);
        const convertedAmount = utils_1.valueToWei(amount, stakedTokenDecimals);
        const approved = await isApproved({
            token: stakedToken,
            user,
            spender: this.stakingContractAddress,
            amount,
        });
        if (!approved) {
            const approveTx = approve({
                user,
                token: stakedToken,
                spender: this.stakingContractAddress,
                amount: utils_1.DEFAULT_APPROVE_AMOUNT,
            });
            txs.push(approveTx);
        }
        console.log(stakingContract);
        const txCallback = this.generateTxCallback({
            rawTxMethod: async () => stakingContract.populateTransaction.stake(onBehalfOf !== null && onBehalfOf !== void 0 ? onBehalfOf : user, convertedAmount),
            from: user,
        });
        txs.push({
            tx: txCallback,
            txType: types_1.eEthereumTxType.STAKE_ACTION,
            gas: this.generateTxPriceEstimation(txs, txCallback),
        });
        return txs;
    }
    async redeem(user, amount) {
        let convertedAmount;
        const stakingContract = this.getContractInstance(this.stakingContractAddress);
        if (amount === '-1') {
            convertedAmount = ethers_1.constants.MaxUint256.toString();
        }
        else {
            const { decimalsOf } = this.erc20Service;
            // eslint-disable-next-line new-cap
            const stakedToken = await stakingContract.STAKED_TOKEN();
            const stakedTokenDecimals = await decimalsOf(stakedToken);
            convertedAmount = utils_1.valueToWei(amount, stakedTokenDecimals);
        }
        const txCallback = this.generateTxCallback({
            rawTxMethod: async () => stakingContract.populateTransaction.redeem(user, convertedAmount),
            from: user,
            gasSurplus: 20,
        });
        return [
            {
                tx: txCallback,
                txType: types_1.eEthereumTxType.STAKE_ACTION,
                gas: this.generateTxPriceEstimation([], txCallback),
            },
        ];
    }
    cooldown(user) {
        const stakingContract = this.getContractInstance(this.stakingContractAddress);
        const txCallback = this.generateTxCallback({
            rawTxMethod: async () => stakingContract.populateTransaction.cooldown(),
            from: user,
        });
        return [
            {
                tx: txCallback,
                txType: types_1.eEthereumTxType.STAKE_ACTION,
                gas: this.generateTxPriceEstimation([], txCallback),
            },
        ];
    }
    async claimRewards(user, amount) {
        let convertedAmount;
        const stakingContract = this.getContractInstance(this.stakingContractAddress);
        if (amount === '-1') {
            convertedAmount = ethers_1.constants.MaxUint256.toString();
        }
        else {
            const { decimalsOf } = this.erc20Service;
            // eslint-disable-next-line new-cap
            const stakedToken = await stakingContract.REWARD_TOKEN();
            const stakedTokenDecimals = await decimalsOf(stakedToken);
            convertedAmount = utils_1.valueToWei(amount, stakedTokenDecimals);
        }
        const txCallback = this.generateTxCallback({
            rawTxMethod: async () => stakingContract.populateTransaction.claimRewards(user, convertedAmount),
            from: user,
            gasSurplus: 20,
        });
        return [
            {
                tx: txCallback,
                txType: types_1.eEthereumTxType.STAKE_ACTION,
                gas: this.generateTxPriceEstimation([], txCallback),
            },
        ];
    }
}
__decorate([
    methodValidators_1.SignStakingValidator,
    __param(0, paramValidators_1.isEthAddress()),
    __param(1, paramValidators_1.isPositiveAmount()),
    __param(2, paramValidators_1.is0OrPositiveAmount()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], StakingService.prototype, "signStaking", null);
__decorate([
    methodValidators_1.SignStakingValidator,
    __param(0, paramValidators_1.isEthAddress()),
    __param(1, paramValidators_1.isPositiveAmount()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], StakingService.prototype, "stakeWithPermit", null);
__decorate([
    methodValidators_1.StakingValidator,
    __param(0, paramValidators_1.isEthAddress()),
    __param(1, paramValidators_1.isPositiveAmount()),
    __param(2, paramValidators_1.isEthAddress()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], StakingService.prototype, "stake", null);
__decorate([
    methodValidators_1.StakingValidator,
    __param(0, paramValidators_1.isEthAddress()),
    __param(1, paramValidators_1.isPositiveOrMinusOneAmount()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StakingService.prototype, "redeem", null);
__decorate([
    methodValidators_1.StakingValidator,
    __param(0, paramValidators_1.isEthAddress()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Array)
], StakingService.prototype, "cooldown", null);
__decorate([
    methodValidators_1.StakingValidator,
    __param(0, paramValidators_1.isEthAddress()),
    __param(1, paramValidators_1.isPositiveOrMinusOneAmount()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StakingService.prototype, "claimRewards", null);
exports.StakingService = StakingService;
//# sourceMappingURL=index.js.map