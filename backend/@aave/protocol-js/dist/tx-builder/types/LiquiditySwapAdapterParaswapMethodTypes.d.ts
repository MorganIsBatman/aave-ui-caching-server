import { BytesLike } from 'ethers';
import { PermitSignature, tEthereumAddress } from '.';
export declare type SwapAndDepositMethodType = {
    user: tEthereumAddress;
    assetToSwapFrom: tEthereumAddress;
    assetToSwapTo: tEthereumAddress;
    amountToSwap: string;
    minAmountToReceive: string;
    permitParams: PermitSignature;
    swapCallData: BytesLike;
    augustus: tEthereumAddress;
    swapAll: boolean;
};
