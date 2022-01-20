import { IWETHGateway } from '../contract-types';
import BaseDebtTokenInterface from '../interfaces/BaseDebtToken';
import IERC20ServiceInterface from '../interfaces/ERC20';
import WETHGatewayInterface from '../interfaces/WETHGateway';
import { Configuration, EthereumTransactionTypeExtended } from '../types';
import { WETHBorrowParamsType, WETHDepositParamsType, WETHRepayParamsType, WETHWithdrawParamsType } from '../types/WethGatewayMethodTypes';
import BaseService from './BaseService';
export default class WETHGatewayService extends BaseService<IWETHGateway> implements WETHGatewayInterface {
    readonly wethGatewayAddress: string;
    readonly config: Configuration;
    readonly baseDebtTokenService: BaseDebtTokenInterface;
    readonly erc20Service: IERC20ServiceInterface;
    constructor(config: Configuration, baseDebtTokenService: BaseDebtTokenInterface, erc20Service: IERC20ServiceInterface);
    depositETH({ lendingPool, user, amount, onBehalfOf, referralCode, }: WETHDepositParamsType): Promise<EthereumTransactionTypeExtended[]>;
    borrowETH({ lendingPool, user, amount, debtTokenAddress, interestRateMode, referralCode, }: WETHBorrowParamsType): Promise<EthereumTransactionTypeExtended[]>;
    withdrawETH({ lendingPool, user, amount, onBehalfOf, aTokenAddress, }: WETHWithdrawParamsType): Promise<EthereumTransactionTypeExtended[]>;
    repayETH({ lendingPool, user, amount, interestRateMode, onBehalfOf, }: WETHRepayParamsType): Promise<EthereumTransactionTypeExtended[]>;
}
