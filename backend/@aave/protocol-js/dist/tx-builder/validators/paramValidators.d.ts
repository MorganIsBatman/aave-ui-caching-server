import 'reflect-metadata';
export declare const isEthAddressMetadataKey: unique symbol;
export declare const isEthAddressArrayMetadataKey: unique symbol;
export declare const isEthAddressOrENSMetadataKey: unique symbol;
export declare const isPositiveMetadataKey: unique symbol;
export declare const isPositiveOrMinusOneMetadataKey: unique symbol;
export declare const is0OrPositiveMetadataKey: unique symbol;
export declare const optionalMetadataKey: unique symbol;
export declare type paramsType = {
    index: number;
    field: string | undefined;
};
export declare function IsEthAddress(field?: string): (target: any, propertyKey: string | symbol, parameterIndex: number) => void;
export declare function IsEthAddressArray(field?: string): (target: any, propertyKey: string | symbol, parameterIndex: number) => void;
export declare function IsEthAddressOrENS(field?: string): (target: any, propertyKey: string | symbol, parameterIndex: number) => void;
export declare function IsPositiveAmount(field?: string): (target: any, propertyKey: string | symbol, parameterIndex: number) => void;
export declare function Is0OrPositiveAmount(field?: string): (target: any, propertyKey: string | symbol, parameterIndex: number) => void;
export declare function IsPositiveOrMinusOneAmount(field?: string): (target: any, propertyKey: string | symbol, parameterIndex: number) => void;
export declare function Optional(target: any, propertyKey: string | symbol, parameterIndex: number): void;
