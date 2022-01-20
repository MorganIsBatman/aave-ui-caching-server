import { Signer } from 'ethers';
import { Provider } from '@ethersproject/providers';
import type { IUiPoolDataProvider, IUiPoolDataProviderInterface } from './IUiPoolDataProvider';
export declare class IUiPoolDataProvider__factory {
    static readonly abi: {
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: ({
            components: {
                internalType: string;
                name: string;
                type: string;
            }[];
            internalType: string;
            name: string;
            type: string;
        } | {
            internalType: string;
            name: string;
            type: string;
            components?: undefined;
        })[];
        stateMutability: string;
        type: string;
    }[];
    static createInterface(): IUiPoolDataProviderInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IUiPoolDataProvider;
}
//# sourceMappingURL=IUiPoolDataProvider__factory.d.ts.map