"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const _mocks_1 = require("./_mocks");
const PermissionManagerTypes_1 = require("./types/PermissionManagerTypes");
const index_1 = require("./index");
const mockInvalidEthereumAddress = '0x0';
const mockValidEthereumAddress = '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984';
describe('PermissionManager', () => {
    describe('creating', () => {
        it('should throw an error if the contractAddress is not valid', () => {
            expect(() => new index_1.PermissionManager({
                permissionManagerAddress: mockInvalidEthereumAddress,
                provider: new ethers_1.providers.JsonRpcProvider(),
            })).toThrowError('contract address is not valid');
        });
    });
    describe('getHumanizedUserPermissions', () => {
        const instance = new index_1.PermissionManager({
            permissionManagerAddress: mockValidEthereumAddress,
            provider: new ethers_1.providers.JsonRpcProvider(),
        });
        const mock = jest.fn();
        // @ts-expect-error readonly
        instance._contract = {
            getUserPermissions: mock,
        };
        it('should throw an error if the user is not valid', async () => {
            await expect(instance.getHumanizedUserPermissions(mockInvalidEthereumAddress)).rejects.toThrow('User address is not a valid ethereum address');
        });
        it('should throw an error if the permission is not known', async () => {
            mock.mockResolvedValueOnce({
                0: [ethers_1.BigNumber.from(5), ..._mocks_1.getUserPermissionsResponseMock[0]],
                1: _mocks_1.getUserPermissionsResponseMock[1],
            });
            await expect(instance.getHumanizedUserPermissions(mockValidEthereumAddress)).rejects.toThrow('Error parsing permission');
        });
        it('should return human readable response', async () => {
            mock.mockResolvedValueOnce(_mocks_1.getUserPermissionsResponseMock);
            const response = await instance.getHumanizedUserPermissions(mockValidEthereumAddress);
            expect(response).toStrictEqual([
                PermissionManagerTypes_1.PERMISSION.DEPOSITOR,
                PermissionManagerTypes_1.PERMISSION.BORROWER,
            ]);
        });
    });
});
//# sourceMappingURL=permissions-manager.test.js.map