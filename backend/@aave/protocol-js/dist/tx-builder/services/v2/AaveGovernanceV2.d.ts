import { IAaveGovernanceV2 } from '../../contract-types/IAaveGovernanceV2';
import AaveGovernanceV2Interface from '../../interfaces/v2/AaveGovernanceV2';
import { Configuration, EthereumTransactionTypeExtended, tEthereumAddress } from '../../types';
import { GovCancelType, GovCreateType, GovExecuteType, GovGetProposalsType, GovGetProposalType, GovGetVotingAtBlockType, GovGetVotingSupplyType, GovQueueType, GovSignVotingType, GovSubmitVoteSignType, GovSubmitVoteType, GovGetTokensVotingPower as GovGetPower, GovGetVoteOnProposal } from '../../types/GovernanceV2MethodTypes';
import { Proposal, Power, Vote } from '../../types/GovernanceV2ReturnTypes';
import BaseService from '../BaseService';
export default class AaveGovernanceV2Service extends BaseService<IAaveGovernanceV2> implements AaveGovernanceV2Interface {
    readonly aaveGovernanceV2Address: string;
    readonly aaveGovernanceV2HelperAddress: string;
    readonly executors: tEthereumAddress[];
    constructor(config: Configuration);
    create({ user, targets, values, signatures, calldatas, withDelegateCalls, ipfsHash, executor, }: GovCreateType): Promise<EthereumTransactionTypeExtended[]>;
    cancel({ user, proposalId }: GovCancelType): Promise<EthereumTransactionTypeExtended[]>;
    queue({ user, proposalId }: GovQueueType): Promise<EthereumTransactionTypeExtended[]>;
    execute({ user, proposalId }: GovExecuteType): Promise<EthereumTransactionTypeExtended[]>;
    submitVote({ user, proposalId, support }: GovSubmitVoteType): Promise<EthereumTransactionTypeExtended[]>;
    signVoting({ support, proposalId }: GovSignVotingType): Promise<string>;
    submitVoteBySignature({ user, proposalId, support, signature }: GovSubmitVoteSignType): Promise<EthereumTransactionTypeExtended[]>;
    getProposals({ skip, limit, }: GovGetProposalsType): Promise<Proposal[]>;
    getProposal({ proposalId, }: GovGetProposalType): Promise<Proposal>;
    getPropositionPowerAt({ user, block, strategy, }: GovGetVotingAtBlockType): Promise<string>;
    getVotingPowerAt({ user, block, strategy, }: GovGetVotingAtBlockType): Promise<string>;
    getTotalPropositionSupplyAt({ block, strategy, }: GovGetVotingSupplyType): Promise<string>;
    getTotalVotingSupplyAt({ block, strategy, }: GovGetVotingSupplyType): Promise<string>;
    getTokensPower({ user, tokens }: GovGetPower): Promise<Power[]>;
    getVoteOnProposal({ proposalId, user, }: GovGetVoteOnProposal): Promise<Vote>;
}
