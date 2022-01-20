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
exports.ERC20_2612Service = void 0;
const BaseService_1 = __importDefault(require("../commons/BaseService"));
const methodValidators_1 = require("../commons/validators/methodValidators");
const paramValidators_1 = require("../commons/validators/paramValidators");
const IERC202612__factory_1 = require("./typechain/IERC202612__factory");
class ERC20_2612Service extends BaseService_1.default {
    constructor(provider) {
        super(provider, IERC202612__factory_1.IERC202612__factory);
        this.getNonce = this.getNonce.bind(this);
    }
    async getNonce({ token, owner }) {
        const tokenContract = this.getContractInstance(token);
        let nonce;
        try {
            nonce = await tokenContract.nonces(owner);
            return nonce.toNumber();
        }
        catch (_) {
            // Skip console log here since other nonce method can also work
        }
        try {
            nonce = await tokenContract._nonces(owner);
            return nonce.toNumber();
        }
        catch (_) {
            console.log(`Token ${token} does not implement nonces or _nonces method`);
        }
        return null;
    }
}
__decorate([
    methodValidators_1.ERC20Validator,
    __param(0, paramValidators_1.isEthAddress('token')),
    __param(0, paramValidators_1.isEthAddress('owner')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ERC20_2612Service.prototype, "getNonce", null);
exports.ERC20_2612Service = ERC20_2612Service;
//# sourceMappingURL=index.js.map