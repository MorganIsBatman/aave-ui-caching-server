import { Signer } from 'ethers';
import { Provider } from '@ethersproject/providers';
import type { IPool } from './IPool';
export declare class IPoolFactory {
    static connect(address: string, signerOrProvider: Signer | Provider): IPool;
}
//# sourceMappingURL=IPoolFactory.d.ts.map