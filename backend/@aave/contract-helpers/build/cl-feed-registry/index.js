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
exports.ChainlinkFeedsRegistry = void 0;
const utils_1 = require("ethers/lib/utils");
const FeedRegistryInterface__factory_1 = require("./typechain/FeedRegistryInterface__factory");
const ChainlinkFeedsRegistryTypes_1 = require("./types/ChainlinkFeedsRegistryTypes");
__exportStar(require("./types/ChainlinkFeedsRegistryTypes"), exports);
class ChainlinkFeedsRegistry {
    constructor({ provider, chainlinkFeedsRegistry, }) {
        this.latestRoundData = async (tokenAddress, quote) => {
            if (!utils_1.isAddress(tokenAddress)) {
                throw new Error('tokenAddress is not valid');
            }
            return this._registryContract.latestRoundData(tokenAddress, ChainlinkFeedsRegistryTypes_1.DenominationAddresses[quote]);
        };
        this.decimals = async (tokenAddress, quote) => {
            if (!utils_1.isAddress(tokenAddress)) {
                throw new Error('tokenAddress is not valid');
            }
            return this._registryContract.decimals(tokenAddress, ChainlinkFeedsRegistryTypes_1.DenominationAddresses[quote]);
        };
        this.getPriceFeed = async (tokenAddress, quote) => {
            const rawFeed = await this.latestRoundData(tokenAddress, quote);
            const feedDecimals = await this.decimals(tokenAddress, quote);
            return {
                answer: rawFeed[1].toString(),
                updatedAt: rawFeed[3].toNumber(),
                decimals: feedDecimals,
            };
        };
        if (!utils_1.isAddress(chainlinkFeedsRegistry)) {
            throw new Error('contract address is not valid');
        }
        this._registryContract = FeedRegistryInterface__factory_1.FeedRegistryInterface__factory.connect(chainlinkFeedsRegistry, provider);
    }
}
exports.ChainlinkFeedsRegistry = ChainlinkFeedsRegistry;
//# sourceMappingURL=index.js.map