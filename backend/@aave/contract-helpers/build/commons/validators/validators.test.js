"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const paramValidators_1 = require("./paramValidators");
const validations_1 = require("./validations");
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class Test {
}
describe('validators', () => {
    const target = Test;
    const propertyName = 'claimRewards';
    const propertyKey = 'claimRewards';
    describe('isEthAddressValidator', () => {
        it('Expects to run with correct address', () => {
            const methodArguments = {
                '0': {
                    to: '0x0000000000000000000000000000000000000001',
                },
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: 'to',
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isEthAddressMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.isEthAddressValidator(target, propertyName, methodArguments);
            }).not.toThrow();
        });
        it('Expects to run with no field: @isEthAddress()', () => {
            const methodArguments = {
                '0': '0x0000000000000000000000000000000000000001',
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: undefined,
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isEthAddressMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.isEthAddressValidator(target, propertyName, methodArguments);
            }).not.toThrow();
        });
        it('Expects to run with no params', () => {
            const methodArguments = {
                '0': {
                    to: '0x0000000000000000000000000000000000000001',
                },
            };
            Reflect.defineMetadata(paramValidators_1.isEthAddressMetadataKey, undefined, target, propertyKey);
            expect(() => {
                validations_1.isEthAddressValidator(target, propertyName, methodArguments);
            }).not.toThrow();
        });
        it('Expects to run with no address if optional', () => {
            const methodArguments = {
                '0': {},
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: undefined,
                },
            ];
            const isParamOptional = [true];
            Reflect.defineMetadata(paramValidators_1.isEthAddressMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.isEthAddressValidator(target, propertyName, methodArguments, isParamOptional);
            }).not.toThrow();
        });
        it('Expects to not run with incorrect address', () => {
            const methodArguments = {
                '0': {
                    to: 'asdfasdf',
                },
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: 'to',
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isEthAddressMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.isEthAddressValidator(target, propertyName, methodArguments);
            }).toThrowError(`Address: ${methodArguments[0].to} is not a valid ethereum Address`);
        });
        it('Expects to throw when no address and not optional', () => {
            const methodArguments = {
                '0': {},
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: undefined,
                },
            ];
            const isParamOptional = [false];
            Reflect.defineMetadata(paramValidators_1.isEthAddressMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.isEthAddressValidator(target, propertyName, methodArguments, isParamOptional);
            }).toThrowError(new Error(`Address: [object Object] is not a valid ethereum Address`));
        });
        it('Expects to throw when no address and not optional passed', () => {
            const methodArguments = {
                '0': {},
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: undefined,
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isEthAddressMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.isEthAddressValidator(target, propertyName, methodArguments);
            }).toThrowError(new Error(`Address: [object Object] is not a valid ethereum Address`));
        });
    });
    describe('isEthAddressArrayValidatorNotEmpty', () => {
        it('Expects to run with correct address', () => {
            const methodArguments = {
                '0': {
                    to: ['0x0000000000000000000000000000000000000001'],
                },
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: 'to',
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isEthAddressArrayMetadataKeyNotEmpty, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.isEthAddressArrayValidatorNotEmpty(target, propertyName, methodArguments);
            }).not.toThrow();
        });
        it('Expects to run with correct address when no field passed ()', () => {
            const methodArguments = {
                '0': ['0x0000000000000000000000000000000000000001'],
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: undefined,
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isEthAddressArrayMetadataKeyNotEmpty, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.isEthAddressArrayValidatorNotEmpty(target, propertyName, methodArguments);
            }).not.toThrow();
        });
        it('Expects to run with correct address but in other field', () => {
            const methodArguments = {
                '0': {
                    from: ['0x0000000000000000000000000000000000000001'],
                },
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: 'to',
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isEthAddressArrayMetadataKeyNotEmpty, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.isEthAddressArrayValidatorNotEmpty(target, propertyName, methodArguments);
            }).not.toThrow();
        });
        it('Expects to run with no params', () => {
            const methodArguments = {
                '0': {
                    to: ['0x0000000000000000000000000000000000000001'],
                },
            };
            Reflect.defineMetadata(paramValidators_1.isEthAddressArrayMetadataKeyNotEmpty, undefined, target, propertyKey);
            expect(() => {
                validations_1.isEthAddressArrayValidatorNotEmpty(target, propertyName, methodArguments);
            }).not.toThrow();
        });
        it('Expects to run with no address if optional', () => {
            const methodArguments = {
                '0': [],
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: undefined,
                },
            ];
            const isParamOptional = [true];
            Reflect.defineMetadata(paramValidators_1.isEthAddressArrayMetadataKeyNotEmpty, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.isEthAddressArrayValidatorNotEmpty(target, propertyName, methodArguments, isParamOptional);
            }).not.toThrow();
        });
        it('Expects to not run with incorrect address', () => {
            const methodArguments = {
                '0': {
                    to: ['asdfasdf'],
                },
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: 'to',
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isEthAddressArrayMetadataKeyNotEmpty, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.isEthAddressArrayValidatorNotEmpty(target, propertyName, methodArguments);
            }).toThrowError(`Address: ${methodArguments[0].to[0]} is not a valid ethereum Address`);
        });
        it('Expects to throw when no address and not optional', () => {
            const methodArguments = {
                '0': ['asdf'],
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: undefined,
                },
            ];
            const isParamOptional = [false];
            Reflect.defineMetadata(paramValidators_1.isEthAddressArrayMetadataKeyNotEmpty, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.isEthAddressArrayValidatorNotEmpty(target, propertyName, methodArguments, isParamOptional);
            }).toThrowError(new Error(`Address: asdf is not a valid ethereum Address`));
        });
        it('Expects to throw when no address and not optional passed', () => {
            const methodArguments = {
                '0': {
                    to: ['asdf'],
                },
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: undefined,
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isEthAddressArrayMetadataKeyNotEmpty, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.isEthAddressArrayValidatorNotEmpty(target, propertyName, methodArguments);
            }).toThrowError(new Error(`Addresses Array should not be empty`));
        });
        it('Expects to throw when empty array', () => {
            const methodArguments = {
                '0': {
                    to: [],
                },
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: 'to',
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isEthAddressArrayMetadataKeyNotEmpty, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.isEthAddressArrayValidatorNotEmpty(target, propertyName, methodArguments);
            }).toThrowError(new Error(`Addresses Array should not be empty`));
        });
    });
    describe('isEthAddressArrayValidator', () => {
        it('Expects to run with correct address', () => {
            const methodArguments = {
                '0': {
                    to: ['0x0000000000000000000000000000000000000001'],
                },
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: 'to',
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isEthAddressArrayMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.isEthAddressArrayValidator(target, propertyName, methodArguments);
            }).not.toThrow();
        });
        it('Expects to run when empty array', () => {
            const methodArguments = {
                '0': {
                    to: [],
                },
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: 'to',
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isEthAddressArrayMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.isEthAddressArrayValidator(target, propertyName, methodArguments);
            }).not.toThrow();
        });
        it('Expects to run when empty array and no field', () => {
            const methodArguments = {
                '0': [],
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: undefined,
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isEthAddressArrayMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.isEthAddressArrayValidator(target, propertyName, methodArguments);
            }).not.toThrow();
        });
        it('Expects to run with correct address when no field passed ()', () => {
            const methodArguments = {
                '0': ['0x0000000000000000000000000000000000000001'],
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: undefined,
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isEthAddressArrayMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.isEthAddressArrayValidator(target, propertyName, methodArguments);
            }).not.toThrow();
        });
        it('Expects to run with correct address but in other field', () => {
            const methodArguments = {
                '0': {
                    from: ['0x0000000000000000000000000000000000000001'],
                },
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: 'to',
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isEthAddressArrayMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.isEthAddressArrayValidator(target, propertyName, methodArguments);
            }).not.toThrow();
        });
        it('Expects to run with no params', () => {
            const methodArguments = {
                '0': {
                    to: ['0x0000000000000000000000000000000000000001'],
                },
            };
            Reflect.defineMetadata(paramValidators_1.isEthAddressArrayMetadataKey, undefined, target, propertyKey);
            expect(() => {
                validations_1.isEthAddressArrayValidator(target, propertyName, methodArguments);
            }).not.toThrow();
        });
        it('Expects to run with no address if optional', () => {
            const methodArguments = {
                '0': [],
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: undefined,
                },
            ];
            const isParamOptional = [true];
            Reflect.defineMetadata(paramValidators_1.isEthAddressArrayMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.isEthAddressArrayValidator(target, propertyName, methodArguments, isParamOptional);
            }).not.toThrow();
        });
        it('Expects to not run with incorrect address', () => {
            const methodArguments = {
                '0': {
                    to: ['asdfasdf'],
                },
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: 'to',
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isEthAddressArrayMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.isEthAddressArrayValidator(target, propertyName, methodArguments);
            }).toThrowError(`Address: ${methodArguments[0].to[0]} is not a valid ethereum Address`);
        });
        it('Expects to throw when no address and not optional', () => {
            const methodArguments = {
                '0': ['asdf'],
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: undefined,
                },
            ];
            const isParamOptional = [false];
            Reflect.defineMetadata(paramValidators_1.isEthAddressArrayMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.isEthAddressArrayValidator(target, propertyName, methodArguments, isParamOptional);
            }).toThrowError(new Error(`Address: asdf is not a valid ethereum Address`));
        });
    });
    describe('isEthAddressOrEnsValidator', () => {
        it('should not throw for valid ens with isParaOptional omitted', () => {
            const methodArguments = {
                '0': 'aave.eth',
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: undefined,
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isEthAddressOrENSMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.isEthAddressOrEnsValidator(target, propertyName, methodArguments);
            }).not.toThrow();
        });
        it('should not throw for valid ens with isParaOptional truthy', () => {
            const methodArguments = {
                '0': 'aave.eth',
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: undefined,
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isEthAddressOrENSMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.isEthAddressOrEnsValidator(target, propertyName, methodArguments, [
                    true,
                ]);
            }).not.toThrow();
        });
        it('should not throw for valid ens with isParaOptional falsy', () => {
            const methodArguments = {
                '0': 'aave.eth',
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: undefined,
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isEthAddressOrENSMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.isEthAddressOrEnsValidator(target, propertyName, methodArguments, [
                    false,
                ]);
            }).not.toThrow();
        });
        it('should throw for invalid address', () => {
            const methodArguments = {
                '0': 'aave',
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: undefined,
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isEthAddressOrENSMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.isEthAddressOrEnsValidator(target, propertyName, methodArguments, [
                    false,
                ]);
            }).toThrow();
        });
    });
    describe('amountGtThan0Validator', () => {
        it('Expects to run if all params correct', () => {
            const methodArguments = {
                '0': {
                    amount: '1000000000000000000',
                },
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: 'amount',
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isPositiveMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.amountGtThan0Validator(target, propertyName, methodArguments);
            }).not.toThrow();
        });
        it('Expects to run if all params correct and no field', () => {
            const methodArguments = {
                '0': '1000000000000000000',
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: undefined,
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isPositiveMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.amountGtThan0Validator(target, propertyName, methodArguments);
            }).not.toThrow();
        });
        it('Expects to run if no params and optional', () => {
            const methodArguments = {
                '0': {},
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: 'amount',
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isPositiveMetadataKey, existingPossibleAddresses, target, propertyKey);
            const isOptional = [true];
            expect(() => {
                validations_1.amountGtThan0Validator(target, propertyName, methodArguments, isOptional);
            }).not.toThrow();
        });
        it('Expects to run if no params and optional and no field', () => {
            const methodArguments = {};
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: undefined,
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isPositiveMetadataKey, existingPossibleAddresses, target, propertyKey);
            const isOptional = [true];
            expect(() => {
                validations_1.amountGtThan0Validator(target, propertyName, methodArguments, isOptional);
            }).not.toThrow();
        });
        it('Expects to fail when amount 0', () => {
            const methodArguments = {
                '0': {
                    amount: '0',
                },
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: 'amount',
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isPositiveMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.amountGtThan0Validator(target, propertyName, methodArguments);
            }).toThrowError(new Error(`Amount: 0 needs to be greater than 0`));
        });
        it('Expects to fail when amount not number', () => {
            const methodArguments = {
                '0': {
                    amount: 'asdf',
                },
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: 'amount',
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isPositiveMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.amountGtThan0Validator(target, propertyName, methodArguments);
            }).toThrowError(new Error(`Amount: asdf needs to be greater than 0`));
        });
        it('Expects to fail when amount 0 and no field', () => {
            const methodArguments = {
                '0': '0',
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: undefined,
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isPositiveMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.amountGtThan0Validator(target, propertyName, methodArguments);
            }).toThrowError(new Error(`Amount: 0 needs to be greater than 0`));
        });
        it('Expects to fail when amount not number and no field', () => {
            const methodArguments = {
                '0': 'asdf',
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: undefined,
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isPositiveMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.amountGtThan0Validator(target, propertyName, methodArguments);
            }).toThrowError(new Error(`Amount: asdf needs to be greater than 0`));
        });
    });
    describe('amountGtThan0OrMinus1', () => {
        it('Expects to run with all params correct', () => {
            const methodArguments = {
                '0': {
                    amount: '1000000000000000000',
                },
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: 'amount',
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isPositiveOrMinusOneMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.amountGtThan0OrMinus1(target, propertyName, methodArguments);
            }).not.toThrow();
        });
        it('Expects to run if all params corrects and no field', () => {
            const methodArguments = {
                '0': '1000000000000000000',
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: undefined,
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isPositiveOrMinusOneMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.amountGtThan0OrMinus1(target, propertyName, methodArguments);
            }).not.toThrow();
        });
        it('Expects to run if -1', () => {
            const methodArguments = {
                '0': {
                    amount: '-1',
                },
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: 'amount',
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isPositiveOrMinusOneMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.amountGtThan0OrMinus1(target, propertyName, methodArguments);
            }).not.toThrow();
        });
        it('Expects to run if -1 and no field', () => {
            const methodArguments = {
                '0': '-1',
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: undefined,
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isPositiveOrMinusOneMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.amountGtThan0OrMinus1(target, propertyName, methodArguments);
            }).not.toThrow();
        });
        it('Expects to run if all no params but optional', () => {
            const methodArguments = {
                '0': {},
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: 'amount',
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isPositiveOrMinusOneMetadataKey, existingPossibleAddresses, target, propertyKey);
            const isOptional = [true];
            expect(() => {
                validations_1.amountGtThan0OrMinus1(target, propertyName, methodArguments, isOptional);
            }).not.toThrow();
        });
        it('Expects to run if no params and no field but optional', () => {
            const methodArguments = {};
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: undefined,
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isPositiveOrMinusOneMetadataKey, existingPossibleAddresses, target, propertyKey);
            const isOptional = [true];
            expect(() => {
                validations_1.amountGtThan0OrMinus1(target, propertyName, methodArguments, isOptional);
            }).not.toThrow();
        });
        it('Expects to fail when 0', () => {
            const methodArguments = {
                '0': {
                    amount: '0',
                },
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: 'amount',
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isPositiveOrMinusOneMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.amountGtThan0OrMinus1(target, propertyName, methodArguments);
            }).toThrowError(new Error(`Amount: 0 needs to be greater than 0 or -1`));
        });
        it('Expects to fail when amount not a number', () => {
            const methodArguments = {
                '0': {
                    amount: 'asdf',
                },
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: 'amount',
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isPositiveOrMinusOneMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.amountGtThan0OrMinus1(target, propertyName, methodArguments);
            }).toThrowError(new Error(`Amount: asdf needs to be greater than 0 or -1`));
        });
        it('Expects to fail when 0 and no field', () => {
            const methodArguments = {
                '0': '0',
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: undefined,
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isPositiveOrMinusOneMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.amountGtThan0OrMinus1(target, propertyName, methodArguments);
            }).toThrowError(new Error(`Amount: 0 needs to be greater than 0 or -1`));
        });
        it('Expects to fail when amount not a number and no field', () => {
            const methodArguments = {
                '0': 'asdf',
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: undefined,
                },
            ];
            Reflect.defineMetadata(paramValidators_1.isPositiveOrMinusOneMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.amountGtThan0OrMinus1(target, propertyName, methodArguments);
            }).toThrowError(new Error(`Amount: asdf needs to be greater than 0 or -1`));
        });
    });
    describe('amount0OrPositiveValidator', () => {
        it('Expects to run with all params correct', () => {
            const methodArguments = {
                '0': {
                    amount: '1000000000000000000',
                },
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: 'amount',
                },
            ];
            Reflect.defineMetadata(paramValidators_1.is0OrPositiveMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.amount0OrPositiveValidator(target, propertyName, methodArguments);
            }).not.toThrow();
        });
        it('Expects to run with all params correct and no field', () => {
            const methodArguments = {
                '0': '1000000000000000000',
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: undefined,
                },
            ];
            Reflect.defineMetadata(paramValidators_1.is0OrPositiveMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.amount0OrPositiveValidator(target, propertyName, methodArguments);
            }).not.toThrow();
        });
        it('Expects to run if 0', () => {
            const methodArguments = {
                '0': {
                    amount: '0',
                },
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: 'amount',
                },
            ];
            Reflect.defineMetadata(paramValidators_1.is0OrPositiveMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.amount0OrPositiveValidator(target, propertyName, methodArguments);
            }).not.toThrow();
        });
        it('Expects to run if 0 and no field', () => {
            const methodArguments = {
                '0': '0',
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: undefined,
                },
            ];
            Reflect.defineMetadata(paramValidators_1.is0OrPositiveMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.amount0OrPositiveValidator(target, propertyName, methodArguments);
            }).not.toThrow();
        });
        it('Expects to run if no params but optional', () => {
            const methodArguments = {
                '0': {},
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: 'amount',
                },
            ];
            Reflect.defineMetadata(paramValidators_1.is0OrPositiveMetadataKey, existingPossibleAddresses, target, propertyKey);
            const isOptional = [true];
            expect(() => {
                validations_1.amount0OrPositiveValidator(target, propertyName, methodArguments, isOptional);
            }).not.toThrow();
        });
        it('Expects to run if no params and no field but optional', () => {
            const methodArguments = {};
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: undefined,
                },
            ];
            Reflect.defineMetadata(paramValidators_1.is0OrPositiveMetadataKey, existingPossibleAddresses, target, propertyKey);
            const isOptional = [true];
            expect(() => {
                validations_1.amount0OrPositiveValidator(target, propertyName, methodArguments, isOptional);
            }).not.toThrow();
        });
        it('Expects to fail when negative amount', () => {
            const methodArguments = {
                '0': {
                    amount: '-1',
                },
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: 'amount',
                },
            ];
            Reflect.defineMetadata(paramValidators_1.is0OrPositiveMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.amount0OrPositiveValidator(target, propertyName, methodArguments);
            }).toThrowError(new Error(`Amount: -1 needs to be greater or equal than 0`));
        });
        it('Expects to fail when amount not a number', () => {
            const methodArguments = {
                '0': {
                    amount: 'asdf',
                },
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: 'amount',
                },
            ];
            Reflect.defineMetadata(paramValidators_1.is0OrPositiveMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.amount0OrPositiveValidator(target, propertyName, methodArguments);
            }).toThrowError(new Error(`Amount: asdf needs to be greater or equal than 0`));
        });
        it('Expects to fail when negative amount and no field', () => {
            const methodArguments = {
                '0': '-1',
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: undefined,
                },
            ];
            Reflect.defineMetadata(paramValidators_1.is0OrPositiveMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.amount0OrPositiveValidator(target, propertyName, methodArguments);
            }).toThrowError(new Error(`Amount: -1 needs to be greater or equal than 0`));
        });
        it('Expects to fail when amount not a number and no field', () => {
            const methodArguments = {
                '0': 'asdf',
            };
            const existingPossibleAddresses = [
                {
                    index: 0,
                    field: undefined,
                },
            ];
            Reflect.defineMetadata(paramValidators_1.is0OrPositiveMetadataKey, existingPossibleAddresses, target, propertyKey);
            expect(() => {
                validations_1.amount0OrPositiveValidator(target, propertyName, methodArguments);
            }).toThrowError(new Error(`Amount: asdf needs to be greater or equal than 0`));
        });
    });
});
//# sourceMappingURL=validators.test.js.map