"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UiIncentiveDataProvider = void 0;
const utils_1 = require("ethers/lib/utils");
const index_1 = require("../cl-feed-registry/index");
const ChainlinkFeedsRegistryTypes_1 = require("../cl-feed-registry/types/ChainlinkFeedsRegistryTypes");
const BaseService_1 = __importDefault(require("../commons/BaseService"));
const methodValidators_1 = require("../commons/validators/methodValidators");
const paramValidators_1 = require("../commons/validators/paramValidators");
const IUiIncentiveDataProviderV3__factory_1 = require("./typechain/IUiIncentiveDataProviderV3__factory");
__exportStar(require("./types"), exports);
class UiIncentiveDataProvider extends BaseService_1.default {
    /**
     * Constructor
     * @param context The ui incentive data provider context
     */
    constructor({ provider, uiIncentiveDataProviderAddress, }) {
        super(provider, IUiIncentiveDataProviderV3__factory_1.IUiIncentiveDataProviderV3__factory);
        this._getFeed = async (rewardToken, chainlinkFeedsRegistry, quote) => {
            const feed = await this._chainlinkFeedsRegistries[chainlinkFeedsRegistry].getPriceFeed(rewardToken, quote);
            return {
                ...feed,
                rewardTokenAddress: rewardToken,
            };
        };
        this.uiIncentiveDataProviderAddress = uiIncentiveDataProviderAddress;
        this._chainlinkFeedsRegistries = {};
    }
    /**
     *  Get the full reserve incentive data for the lending pool and the user
     * @param user The user address
     */
    async getFullReservesIncentiveData({ user, lendingPoolAddressProvider }) {
        const uiIncentiveContract = this.getContractInstance(this.uiIncentiveDataProviderAddress);
        return uiIncentiveContract.getFullReservesIncentiveData(lendingPoolAddressProvider, user);
    }
    /**
     *  Get the reserve incentive data for the lending pool
     */
    async getReservesIncentivesData(lendingPoolAddressProvider) {
        const uiIncentiveContract = this.getContractInstance(this.uiIncentiveDataProviderAddress);
        return uiIncentiveContract.getReservesIncentivesData(lendingPoolAddressProvider);
    }
    /**
     *  Get the reserve incentive data for the user
     * @param user The user address
     */
    async getUserReservesIncentivesData({ user, lendingPoolAddressProvider }) {
        const uiIncentiveContract = this.getContractInstance(this.uiIncentiveDataProviderAddress);
        return uiIncentiveContract.getUserReservesIncentivesData(lendingPoolAddressProvider, user);
    }
    async getReservesIncentivesDataHumanized(lendingPoolAddressProvider) {
        const response = await this.getReservesIncentivesData(lendingPoolAddressProvider);
        return response.map(r => ({
            underlyingAsset: r.underlyingAsset.toLowerCase(),
            aIncentiveData: this._formatIncentiveData(r.aIncentiveData),
            vIncentiveData: this._formatIncentiveData(r.vIncentiveData),
            sIncentiveData: this._formatIncentiveData(r.sIncentiveData),
        }));
    }
    async getUserReservesIncentivesDataHumanized({ user, lendingPoolAddressProvider }) {
        const response = await this.getUserReservesIncentivesData({
            user,
            lendingPoolAddressProvider,
        });
        return response.map(r => ({
            underlyingAsset: r.underlyingAsset.toLowerCase(),
            aTokenIncentivesUserData: this._formatUserIncentiveData(r.aTokenIncentivesUserData),
            vTokenIncentivesUserData: this._formatUserIncentiveData(r.vTokenIncentivesUserData),
            sTokenIncentivesUserData: this._formatUserIncentiveData(r.sTokenIncentivesUserData),
        }));
    }
    async getIncentivesDataWithPriceLegacy({ lendingPoolAddressProvider, chainlinkFeedsRegistry, quote = ChainlinkFeedsRegistryTypes_1.Denominations.eth, }) {
        const incentives = await this.getReservesIncentivesDataHumanized(lendingPoolAddressProvider);
        const feeds = [];
        if (chainlinkFeedsRegistry && utils_1.isAddress(chainlinkFeedsRegistry)) {
            if (!this._chainlinkFeedsRegistries[chainlinkFeedsRegistry]) {
                this._chainlinkFeedsRegistries[chainlinkFeedsRegistry] =
                    new index_1.ChainlinkFeedsRegistry({
                        provider: this.provider,
                        chainlinkFeedsRegistry,
                    });
            }
            const allIncentiveRewardTokens = new Set();
            incentives.forEach(incentive => {
                incentive.aIncentiveData.rewardsTokenInformation.map(rewardInfo => allIncentiveRewardTokens.add(rewardInfo.rewardTokenAddress));
                incentive.vIncentiveData.rewardsTokenInformation.map(rewardInfo => allIncentiveRewardTokens.add(rewardInfo.rewardTokenAddress));
                incentive.sIncentiveData.rewardsTokenInformation.map(rewardInfo => allIncentiveRewardTokens.add(rewardInfo.rewardTokenAddress));
            });
            const incentiveRewardTokens = Array.from(allIncentiveRewardTokens);
            // eslint-disable-next-line @typescript-eslint/promise-function-async
            const rewardFeedPromises = incentiveRewardTokens.map(rewardToken => this._getFeed(rewardToken, chainlinkFeedsRegistry, quote));
            const feedResults = await Promise.allSettled(rewardFeedPromises);
            feedResults.forEach(feedResult => {
                if (feedResult.status === 'fulfilled')
                    feeds.push(feedResult.value);
            });
        }
        return incentives.map((incentive) => {
            return {
                underlyingAsset: incentive.underlyingAsset,
                aIncentiveData: {
                    ...incentive.aIncentiveData,
                    rewardsTokenInformation: incentive.aIncentiveData.rewardsTokenInformation.map(rewardTokenInfo => {
                        const feed = feeds.find(feed => feed.rewardTokenAddress ===
                            rewardTokenInfo.rewardTokenAddress);
                        return {
                            ...rewardTokenInfo,
                            rewardPriceFeed: (feed === null || feed === void 0 ? void 0 : feed.answer) ? feed.answer
                                : rewardTokenInfo.rewardPriceFeed,
                            priceFeedDecimals: (feed === null || feed === void 0 ? void 0 : feed.decimals) ? feed.decimals
                                : rewardTokenInfo.priceFeedDecimals,
                        };
                    }),
                },
                vIncentiveData: {
                    ...incentive.vIncentiveData,
                    rewardsTokenInformation: incentive.vIncentiveData.rewardsTokenInformation.map(rewardTokenInfo => {
                        const feed = feeds.find(feed => feed.rewardTokenAddress ===
                            rewardTokenInfo.rewardTokenAddress);
                        return {
                            ...rewardTokenInfo,
                            rewardPriceFeed: (feed === null || feed === void 0 ? void 0 : feed.answer) ? feed.answer
                                : rewardTokenInfo.rewardPriceFeed,
                            priceFeedDecimals: (feed === null || feed === void 0 ? void 0 : feed.decimals) ? feed.decimals
                                : rewardTokenInfo.priceFeedDecimals,
                        };
                    }),
                },
                sIncentiveData: {
                    ...incentive.sIncentiveData,
                    rewardsTokenInformation: incentive.sIncentiveData.rewardsTokenInformation.map(rewardTokenInfo => {
                        const feed = feeds.find(feed => feed.rewardTokenAddress ===
                            rewardTokenInfo.rewardTokenAddress);
                        return {
                            ...rewardTokenInfo,
                            rewardPriceFeed: (feed === null || feed === void 0 ? void 0 : feed.answer) ? feed.answer
                                : rewardTokenInfo.rewardPriceFeed,
                            priceFeedDecimals: (feed === null || feed === void 0 ? void 0 : feed.decimals) ? feed.decimals
                                : rewardTokenInfo.priceFeedDecimals,
                        };
                    }),
                },
            };
        });
    }
    _formatIncentiveData(data) {
        return {
            tokenAddress: data.tokenAddress,
            incentiveControllerAddress: data.incentiveControllerAddress,
            rewardsTokenInformation: data.rewardsTokenInformation.map((rawRewardInfo) => ({
                precision: rawRewardInfo.precision,
                rewardTokenAddress: rawRewardInfo.rewardTokenAddress,
                rewardTokenDecimals: rawRewardInfo.rewardTokenDecimals,
                emissionPerSecond: rawRewardInfo.emissionPerSecond.toString(),
                incentivesLastUpdateTimestamp: rawRewardInfo.incentivesLastUpdateTimestamp.toNumber(),
                tokenIncentivesIndex: rawRewardInfo.tokenIncentivesIndex.toString(),
                emissionEndTimestamp: rawRewardInfo.emissionEndTimestamp.toNumber(),
                rewardTokenSymbol: rawRewardInfo.rewardTokenSymbol,
                rewardOracleAddress: rawRewardInfo.rewardOracleAddress,
                rewardPriceFeed: rawRewardInfo.rewardPriceFeed.toString(),
                priceFeedDecimals: rawRewardInfo.priceFeedDecimals,
            })),
        };
    }
    _formatUserIncentiveData(data) {
        return {
            tokenAddress: data.tokenAddress,
            incentiveControllerAddress: data.incentiveControllerAddress,
            userRewardsInformation: data.userRewardsInformation.map((userRewardInformation) => ({
                rewardTokenAddress: userRewardInformation.rewardTokenAddress,
                rewardTokenDecimals: userRewardInformation.rewardTokenDecimals,
                tokenIncentivesUserIndex: userRewardInformation.tokenIncentivesUserIndex.toString(),
                userUnclaimedRewards: userRewardInformation.userUnclaimedRewards.toString(),
                rewardTokenSymbol: userRewardInformation.rewardTokenSymbol,
                rewardOracleAddress: userRewardInformation.rewardOracleAddress,
                rewardPriceFeed: userRewardInformation.rewardPriceFeed.toString(),
                priceFeedDecimals: userRewardInformation.priceFeedDecimals,
            })),
        };
    }
}
__decorate([
    methodValidators_1.UiIncentiveDataProviderValidator,
    __param(0, paramValidators_1.isEthAddress('user')),
    __param(0, paramValidators_1.isEthAddress('lendingPoolAddressProvider')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UiIncentiveDataProvider.prototype, "getFullReservesIncentiveData", null);
__decorate([
    methodValidators_1.UiIncentiveDataProviderValidator,
    __param(0, paramValidators_1.isEthAddress()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UiIncentiveDataProvider.prototype, "getReservesIncentivesData", null);
__decorate([
    methodValidators_1.UiIncentiveDataProviderValidator,
    __param(0, paramValidators_1.isEthAddress('user')),
    __param(0, paramValidators_1.isEthAddress('lendingPoolAddressProvider')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UiIncentiveDataProvider.prototype, "getUserReservesIncentivesData", null);
__decorate([
    methodValidators_1.UiIncentiveDataProviderValidator,
    __param(0, paramValidators_1.isEthAddress()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UiIncentiveDataProvider.prototype, "getReservesIncentivesDataHumanized", null);
__decorate([
    methodValidators_1.UiIncentiveDataProviderValidator,
    __param(0, paramValidators_1.isEthAddress('user')),
    __param(0, paramValidators_1.isEthAddress('lendingPoolAddressProvider')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UiIncentiveDataProvider.prototype, "getUserReservesIncentivesDataHumanized", null);
__decorate([
    methodValidators_1.UiIncentiveDataProviderValidator,
    __param(0, paramValidators_1.isEthAddress('lendingPoolAddressProvider')),
    __param(0, paramValidators_1.isEthAddress('chainlinkFeedsRegistry')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UiIncentiveDataProvider.prototype, "getIncentivesDataWithPriceLegacy", null);
exports.UiIncentiveDataProvider = UiIncentiveDataProvider;
//# sourceMappingURL=index.js.map