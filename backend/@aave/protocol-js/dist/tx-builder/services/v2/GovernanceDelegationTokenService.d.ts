import { IGovernancePowerDelegationToken } from '../../contract-types';
import GovernanceDelegationTokenInterface from '../../interfaces/v2/GovernanceDelegationToken';
import { Configuration, EthereumTransactionTypeExtended, tEthereumAddress, tStringDecimalUnits } from '../../types';
import { GovDelegate, GovDelegateBySig, GovDelegateByType, GovDelegateByTypeBySig, GovGetDelegateeByType, GovGetNonce, GovGetPowerAtBlock, GovGetPowerCurrent, GovPrepareDelegateSig, GovPrepareDelegateSigByType } from '../../types/GovDelegationMethodTypes';
import BaseService from '../BaseService';
export default class GovernanceDelegationTokenService extends BaseService<IGovernancePowerDelegationToken> implements GovernanceDelegationTokenInterface {
    constructor(config: Configuration);
    delegate({ user, delegatee, governanceToken }: GovDelegate): Promise<EthereumTransactionTypeExtended[]>;
    delegateByType({ user, delegatee, delegationType, governanceToken }: GovDelegateByType): Promise<EthereumTransactionTypeExtended[]>;
    delegateBySig({ user, delegatee, expiry, signature, governanceToken }: GovDelegateBySig): Promise<EthereumTransactionTypeExtended[]>;
    delegateByTypeBySig({ user, delegatee, delegationType, expiry, signature, governanceToken, }: GovDelegateByTypeBySig): Promise<EthereumTransactionTypeExtended[]>;
    prepareDelegateSignature({ delegatee, nonce, expiry, governanceTokenName, governanceToken, }: GovPrepareDelegateSig): Promise<string>;
    prepareDelegateByTypeSignature({ delegatee, type, nonce, expiry, governanceTokenName, governanceToken, }: GovPrepareDelegateSigByType): Promise<string>;
    getDelegateeByType({ delegator, delegationType, governanceToken }: GovGetDelegateeByType): Promise<tEthereumAddress>;
    getPowerCurrent({ user, delegationType, governanceToken }: GovGetPowerCurrent): Promise<tStringDecimalUnits>;
    getPowerAtBlock({ user, blockNumber, delegationType, governanceToken }: GovGetPowerAtBlock): Promise<tStringDecimalUnits>;
    getNonce({ user, governanceToken }: GovGetNonce): Promise<tStringDecimalUnits>;
    private getDelegateeAddress;
}
