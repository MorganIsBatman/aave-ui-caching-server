import IERC20ServiceInterface from '../interfaces/ERC20';
import { Configuration, EthereumTransactionTypeExtended, tEthereumAddress, tStringCurrencyUnits, tStringDecimalUnits, TokenMetadataType } from '../types';
import { IERC20Detailed } from '../contract-types';
import BaseService from './BaseService';
export default class ERC20Service extends BaseService<IERC20Detailed> implements IERC20ServiceInterface {
    readonly tokenDecimals: {
        [address: string]: number;
    };
    constructor(config: Configuration);
    approve: (user: tEthereumAddress, token: tEthereumAddress, spender: tEthereumAddress, amount: tStringDecimalUnits) => EthereumTransactionTypeExtended;
    isApproved: (token: tEthereumAddress, userAddress: tEthereumAddress, spender: tEthereumAddress, amount: tStringCurrencyUnits) => Promise<boolean>;
    decimalsOf: (token: tEthereumAddress) => Promise<number>;
    getTokenData: (token: tEthereumAddress) => Promise<TokenMetadataType>;
}
