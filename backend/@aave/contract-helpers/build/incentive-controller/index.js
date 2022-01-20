"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
exports.IncentivesController = void 0;
const ethers_1 = require("ethers");
const BaseService_1 = __importDefault(require("../commons/BaseService"));
const types_1 = require("../commons/types");
const methodValidators_1 = require("../commons/validators/methodValidators");
const paramValidators_1 = require("../commons/validators/paramValidators");
const IAaveIncentivesController__factory_1 = require("./typechain/IAaveIncentivesController__factory");
class IncentivesController extends BaseService_1.default {
    constructor(provider) {
        super(provider, IAaveIncentivesController__factory_1.IAaveIncentivesController__factory);
    }
    claimRewards({ user, assets, to, incentivesControllerAddress }) {
        const incentivesContract = this.getContractInstance(incentivesControllerAddress);
        const txCallback = this.generateTxCallback({
            rawTxMethod: async () => incentivesContract.populateTransaction.claimRewards(assets, ethers_1.constants.MaxUint256.toString(), to !== null && to !== void 0 ? to : user),
            from: user,
        });
        return [
            {
                tx: txCallback,
                txType: types_1.eEthereumTxType.REWARD_ACTION,
                gas: this.generateTxPriceEstimation([], txCallback),
            },
        ];
    }
}
__decorate([
    methodValidators_1.IncentivesValidator,
    __param(0, paramValidators_1.isEthAddress('user')),
    __param(0, paramValidators_1.isEthAddress('incentivesControllerAddress')),
    __param(0, paramValidators_1.isEthAddress('to')),
    __param(0, paramValidators_1.isEthAddressArray('assets')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Array)
], IncentivesController.prototype, "claimRewards", null);
exports.IncentivesController = IncentivesController;
//# sourceMappingURL=index.js.map