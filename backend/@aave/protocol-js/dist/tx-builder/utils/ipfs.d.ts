import { ProposalMetadata } from '../types/GovernanceV2ReturnTypes';
export declare function getLink(hash: string): string;
export declare function getProposalMetadata(hash: string): Promise<ProposalMetadata>;
