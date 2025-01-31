import { BigNumber } from 'ethers';
import { tEthereumAddress } from '.';
export declare enum ProposalState {
    Pending = "Pending",
    Canceled = "Canceled",
    Active = "Active",
    Failed = "Failed",
    Succeeded = "Succeeded",
    Queued = "Queued",
    Expired = "Expired",
    Executed = "Executed"
}
export declare type Proposal = {
    id: number;
    title: string;
    description: string;
    shortDescription: string;
    creator: tEthereumAddress;
    executor: tEthereumAddress;
    targets: tEthereumAddress[];
    values: BigNumber[];
    signatures: string[];
    calldatas: string[];
    withDelegatecalls: boolean[];
    startBlock: number;
    endBlock: number;
    executionTime: string;
    executionTimeWithGracePeriod: string;
    forVotes: string;
    againstVotes: string;
    executed: boolean;
    canceled: boolean;
    strategy: string;
    ipfsHash: string;
    state: ProposalState;
    minimumQuorum: string;
    minimumDiff: string;
    proposalCreated: number;
    totalVotingSupply: string;
};
export declare type ProposalRPC = {
    totalVotingSupply: BigNumber;
    minimumQuorum: BigNumber;
    minimumDiff: BigNumber;
    executionTimeWithGracePeriod: BigNumber;
    proposalCreated: BigNumber;
    id: BigNumber;
    creator: string;
    executor: string;
    targets: string[];
    values: BigNumber[];
    signatures: string[];
    calldatas: string[];
    withDelegatecalls: boolean[];
    startBlock: BigNumber;
    endBlock: BigNumber;
    executionTime: BigNumber;
    forVotes: BigNumber;
    againstVotes: BigNumber;
    executed: boolean;
    canceled: boolean;
    strategy: string;
    ipfsHash: string;
    proposalState: number;
};
export declare type ProposalMetadata = {
    title: string;
    description: string;
    shortDescription: string;
    ipfsHash: string;
};
export declare type Power = {
    votingPower: BigNumber;
    delegatedAddressVotingPower: string;
    propositionPower: BigNumber;
    delegatedAddressPropositionPower: string;
};
export declare type Vote = {
    support: boolean;
    votingPower: BigNumber;
};
