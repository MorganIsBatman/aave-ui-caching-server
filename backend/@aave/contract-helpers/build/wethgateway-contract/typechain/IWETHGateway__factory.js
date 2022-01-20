"use strict";
/* Autogenerated file. Do not edit manually. */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IWETHGateway__factory = void 0;
const ethers_1 = require("ethers");
class IWETHGateway__factory {
    static connect(address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    }
}
exports.IWETHGateway__factory = IWETHGateway__factory;
const _abi = [
    {
        inputs: [
            {
                internalType: 'address',
                name: 'lendingPool',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'interesRateMode',
                type: 'uint256',
            },
            {
                internalType: 'uint16',
                name: 'referralCode',
                type: 'uint16',
            },
        ],
        name: 'borrowETH',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'lendingPool',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'onBehalfOf',
                type: 'address',
            },
            {
                internalType: 'uint16',
                name: 'referralCode',
                type: 'uint16',
            },
        ],
        name: 'depositETH',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'lendingPool',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'rateMode',
                type: 'uint256',
            },
            {
                internalType: 'address',
                name: 'onBehalfOf',
                type: 'address',
            },
        ],
        name: 'repayETH',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'lendingPool',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
            },
            {
                internalType: 'address',
                name: 'onBehalfOf',
                type: 'address',
            },
        ],
        name: 'withdrawETH',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
];
//# sourceMappingURL=IWETHGateway__factory.js.map