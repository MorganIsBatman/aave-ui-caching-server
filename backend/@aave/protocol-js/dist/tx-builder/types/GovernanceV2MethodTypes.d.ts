import { BytesLike } from 'ethers';
import { tEthereumAddress } from '.';
export declare enum ExecutorType {
    Short = 0,
    Long = 1
}
export declare type GovCreateType = {
    user: tEthereumAddress;
    targets: tEthereumAddress[];
    values: string[];
    signatures: string[];
    calldatas: BytesLike[];
    withDelegateCalls: boolean[];
    ipfsHash: BytesLike;
    executor: ExecutorType;
};
export declare type GovCancelType = {
    user: tEthereumAddress;
    proposalId: number;
};
export declare type GovQueueType = {
    user: tEthereumAddress;
    proposalId: number;
};
export declare type GovExecuteType = {
    user: tEthereumAddress;
    proposalId: number;
};
export declare type GovSubmitVoteType = {
    user: tEthereumAddress;
    proposalId: number;
    support: boolean;
};
export declare type GovSubmitVoteSignType = {
    user: tEthereumAddress;
    proposalId: number;
    support: boolean;
    signature: string;
};
export declare type GovSignVotingType = {
    user: tEthereumAddress;
    support: boolean;
    proposalId: number;
    nonce: number;
};
export declare type GovGetProposalsType = {
    skip: number;
    limit: number;
};
export declare type GovGetProposalType = {
    proposalId: number;
};
export declare type GovGetVotingSupplyType = {
    block: number;
    strategy: tEthereumAddress;
};
export declare type GovGetVotingAtBlockType = {
    user: tEthereumAddress;
    strategy: tEthereumAddress;
    block: number;
};
export declare type GovGetTokensVotingPower = {
    user: tEthereumAddress;
    tokens: tEthereumAddress[];
};
export declare type GovGetVoteOnProposal = {
    proposalId: string;
    user: tEthereumAddress;
};
