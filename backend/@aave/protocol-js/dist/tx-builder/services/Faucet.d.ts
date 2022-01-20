import { IFaucet, IMinter } from '../contract-types';
import FaucetInterface from '../interfaces/Faucet';
import { Configuration, EthereumTransactionTypeExtended } from '../types';
import { FaucetParamsType } from '../types/FaucetMethodTypes';
import BaseService from './BaseService';
export default class FaucetService extends BaseService<IMinter> implements FaucetInterface {
    readonly faucetAddress: string;
    readonly faucetContract: IFaucet;
    constructor(config: Configuration);
    mint({ userAddress, reserve, tokenSymbol }: FaucetParamsType): Promise<EthereumTransactionTypeExtended[]>;
}
