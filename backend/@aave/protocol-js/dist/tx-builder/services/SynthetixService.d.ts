import BaseService from './BaseService';
import { Configuration, tStringDecimalUnits } from '../types';
import { ISynthetix } from '../contract-types';
import SynthetixInterface from '../interfaces/Synthetix';
export default class SynthetixService extends BaseService<ISynthetix> implements SynthetixInterface {
    constructor(config: Configuration);
    synthetixValidation: (userAddress: string, reserve: string, amount: tStringDecimalUnits) => Promise<boolean>;
    readonly isSnxTransferable: (userAddress: string, amount: tStringDecimalUnits) => Promise<boolean>;
}
