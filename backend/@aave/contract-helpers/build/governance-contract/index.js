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
exports.AaveGovernanceService = exports.humanizeProposal = void 0;
const utils_1 = require("ethers/lib/utils");
const BaseService_1 = __importDefault(require("../commons/BaseService"));
const types_1 = require("../commons/types");
const methodValidators_1 = require("../commons/validators/methodValidators");
const paramValidators_1 = require("../commons/validators/paramValidators");
const IAaveGovernanceV2__factory_1 = require("./typechain/IAaveGovernanceV2__factory");
const IGovernanceStrategy__factory_1 = require("./typechain/IGovernanceStrategy__factory");
const IGovernanceV2Helper__factory_1 = require("./typechain/IGovernanceV2Helper__factory");
const types_2 = require("./types");
const humanizeProposal = (rawProposal) => {
    return {
        id: Number(rawProposal.id.toString()),
        creator: rawProposal.creator,
        executor: rawProposal.executor,
        targets: rawProposal.targets,
        values: rawProposal.values,
        signatures: rawProposal.signatures,
        calldatas: rawProposal.calldatas,
        withDelegatecalls: rawProposal.withDelegatecalls,
        startBlock: Number(rawProposal.startBlock.toString()),
        endBlock: Number(rawProposal.endBlock.toString()),
        executionTime: rawProposal.executionTime.toString(),
        forVotes: rawProposal.forVotes.toString(),
        againstVotes: rawProposal.againstVotes.toString(),
        executed: rawProposal.executed,
        canceled: rawProposal.canceled,
        strategy: rawProposal.strategy,
        state: Object.values(types_2.ProposalState)[rawProposal.proposalState],
        minimumQuorum: rawProposal.minimumQuorum.toString(),
        minimumDiff: rawProposal.minimumDiff.toString(),
        executionTimeWithGracePeriod: rawProposal.executionTimeWithGracePeriod.toString(),
        proposalCreated: Number(rawProposal.proposalCreated.toString()),
        totalVotingSupply: rawProposal.totalVotingSupply.toString(),
        ipfsHash: rawProposal.ipfsHash,
    };
};
exports.humanizeProposal = humanizeProposal;
class AaveGovernanceService extends BaseService_1.default {
    constructor(provider, config) {
        var _a;
        super(provider, IAaveGovernanceV2__factory_1.IAaveGovernanceV2__factory);
        this.aaveGovernanceV2Address = config.GOVERNANCE_ADDRESS;
        this.aaveGovernanceV2HelperAddress = (_a = config.GOVERNANCE_HELPER_ADDRESS) !== null && _a !== void 0 ? _a : '';
    }
    submitVote({ user, proposalId, support }) {
        const txs = [];
        const govContract = this.getContractInstance(this.aaveGovernanceV2Address);
        const txCallback = this.generateTxCallback({
            rawTxMethod: async () => govContract.populateTransaction.submitVote(proposalId, support),
            from: user,
        });
        txs.push({
            tx: txCallback,
            txType: types_1.eEthereumTxType.GOVERNANCE_ACTION,
            gas: this.generateTxPriceEstimation(txs, txCallback),
        });
        return txs;
    }
    async getProposals({ skip, limit, }) {
        const helper = IGovernanceV2Helper__factory_1.IGovernanceV2Helper__factory.connect(this.aaveGovernanceV2HelperAddress, this.provider);
        const result = await helper.getProposals(skip.toString(), limit.toString(), this.aaveGovernanceV2Address);
        return result.map(proposal => exports.humanizeProposal(proposal));
    }
    async getProposal({ proposalId }) {
        const helper = IGovernanceV2Helper__factory_1.IGovernanceV2Helper__factory.connect(this.aaveGovernanceV2HelperAddress, this.provider);
        const result = await helper.getProposal(proposalId, this.aaveGovernanceV2Address);
        return exports.humanizeProposal(result);
    }
    async getVotingPowerAt({ user, block, strategy }) {
        const proposalStrategy = IGovernanceStrategy__factory_1.IGovernanceStrategy__factory.connect(strategy, this.provider);
        const power = await proposalStrategy.getVotingPowerAt(user, block.toString());
        return utils_1.formatEther(power);
    }
    async getTokensPower({ user, tokens }) {
        const helper = IGovernanceV2Helper__factory_1.IGovernanceV2Helper__factory.connect(this.aaveGovernanceV2HelperAddress, this.provider);
        return helper.getTokensPower(user, tokens);
    }
    async getVoteOnProposal({ proposalId, user }) {
        const govContract = this.getContractInstance(this.aaveGovernanceV2Address);
        return govContract.getVoteOnProposal(proposalId, user);
    }
}
__decorate([
    methodValidators_1.GovValidator,
    __param(0, paramValidators_1.isEthAddress('user')),
    __param(0, paramValidators_1.is0OrPositiveAmount('proposalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Array)
], AaveGovernanceService.prototype, "submitVote", null);
__decorate([
    methodValidators_1.GovHelperValidator,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AaveGovernanceService.prototype, "getProposals", null);
__decorate([
    methodValidators_1.GovHelperValidator,
    __param(0, paramValidators_1.is0OrPositiveAmount('proposalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AaveGovernanceService.prototype, "getProposal", null);
__decorate([
    methodValidators_1.GovValidator,
    __param(0, paramValidators_1.isEthAddress('user')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AaveGovernanceService.prototype, "getVotingPowerAt", null);
__decorate([
    methodValidators_1.GovHelperValidator,
    __param(0, paramValidators_1.isEthAddress('user')),
    __param(0, paramValidators_1.isEthAddressArray('tokens')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AaveGovernanceService.prototype, "getTokensPower", null);
__decorate([
    methodValidators_1.GovValidator,
    __param(0, paramValidators_1.isEthAddress('user')),
    __param(0, paramValidators_1.is0OrPositiveAmount('proposalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AaveGovernanceService.prototype, "getVoteOnProposal", null);
exports.AaveGovernanceService = AaveGovernanceService;
//# sourceMappingURL=index.js.map