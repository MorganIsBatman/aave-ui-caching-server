import { IDebtTokenBase } from '../contract-types';
import BaseDebtTokenInterface from '../interfaces/BaseDebtToken';
import IERC20ServiceInterface from '../interfaces/ERC20';
import { Configuration, EthereumTransactionTypeExtended, tEthereumAddress, tStringCurrencyUnits, tStringDecimalUnits } from '../types';
import BaseService from './BaseService';
export default class BaseDebtToken extends BaseService<IDebtTokenBase> implements BaseDebtTokenInterface {
    readonly erc20Service: IERC20ServiceInterface;
    constructor(config: Configuration, erc20Service: IERC20ServiceInterface);
    approveDelegation(user: tEthereumAddress, delegatee: tEthereumAddress, debtTokenAddress: tEthereumAddress, amount: tStringDecimalUnits): EthereumTransactionTypeExtended;
    isDelegationApproved(debtTokenAddress: tEthereumAddress, allowanceGiver: tEthereumAddress, allowanceReceiver: tEthereumAddress, amount: tStringCurrencyUnits): Promise<boolean>;
}
