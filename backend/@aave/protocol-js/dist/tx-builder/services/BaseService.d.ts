import { Contract } from 'ethers';
import { Configuration, tEthereumAddress, TransactionGenerationMethod, transactionType, GasResponse, EthereumTransactionTypeExtended } from '../types';
import { ContractsFactory } from '../interfaces/ContractsFactory';
export default class BaseService<T extends Contract> {
    readonly contractInstances: {
        [address: string]: T;
    };
    readonly contractFactory: ContractsFactory;
    readonly config: Configuration;
    constructor(config: Configuration, contractFactory: ContractsFactory);
    getContractInstance: (address: tEthereumAddress) => T;
    readonly generateTxCallback: ({ rawTxMethod, from, value, gasSurplus, action, }: TransactionGenerationMethod) => (() => Promise<transactionType>);
    readonly generateTxPriceEstimation: (txs: EthereumTransactionTypeExtended[], txCallback: () => Promise<transactionType>, action?: string) => GasResponse;
}
