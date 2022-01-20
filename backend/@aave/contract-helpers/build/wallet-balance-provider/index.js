"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletBalanceProvider = void 0;
const utils_1 = require("ethers/lib/utils");
const WalletBalanceProviderFactory_1 = require("./typechain/WalletBalanceProviderFactory");
__exportStar(require("./types/WalletBalanceProviderTypes"), exports);
class WalletBalanceProvider {
    /**
     * Constructor
     * @param context The wallet balance provider context
     */
    constructor(context) {
        this._contract = WalletBalanceProviderFactory_1.WalletBalanceProviderFactory.connect(context.walletBalanceProviderAddress, context.provider);
    }
    /**
     *  Get the balance for a user on a token
     * @param user The user address
     * @param token The token address
     */
    async balanceOf(user, token) {
        if (!utils_1.isAddress(user)) {
            throw new Error('User address is not a valid ethereum address');
        }
        if (!utils_1.isAddress(token)) {
            throw new Error('Token address is not a valid ethereum address');
        }
        return this._contract.balanceOf(user, token);
    }
    /**
     *  Get the balance for a user on a token
     * @param users The users addresses
     * @param tokens The tokens addresses
     */
    async batchBalanceOf(users, tokens) {
        if (!users.every(u => utils_1.isAddress(u))) {
            throw new Error('One of the user address is not a valid ethereum address');
        }
        if (!tokens.every(u => utils_1.isAddress(u))) {
            throw new Error('One of the token address is not a valid ethereum address');
        }
        return this._contract.batchBalanceOf(users, tokens);
    }
    /**
     *  Provides balances of user wallet for all reserves available on the pool
     * @param user The user
     * @param lendingPoolAddressProvider The lending pool address provider
     */
    async getUserWalletBalancesForLendingPoolProvider(user, lendingPoolAddressProvider) {
        if (!utils_1.isAddress(user)) {
            throw new Error('User address is not a valid ethereum address');
        }
        if (!utils_1.isAddress(lendingPoolAddressProvider)) {
            throw new Error('Lending pool address provider is not a valid ethereum address');
        }
        return this._contract.getUserWalletBalances(lendingPoolAddressProvider, user);
    }
}
exports.WalletBalanceProvider = WalletBalanceProvider;
//# sourceMappingURL=index.js.map