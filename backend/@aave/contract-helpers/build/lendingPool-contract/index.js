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
exports.LendingPool = void 0;
const ethers_1 = require("ethers");
const BaseService_1 = __importDefault(require("../commons/BaseService"));
const types_1 = require("../commons/types");
const utils_1 = require("../commons/utils");
const methodValidators_1 = require("../commons/validators/methodValidators");
const paramValidators_1 = require("../commons/validators/paramValidators");
const erc20_contract_1 = require("../erc20-contract");
const paraswap_liquiditySwapAdapter_contract_1 = require("../paraswap-liquiditySwapAdapter-contract");
const repayWithCollateralAdapter_contract_1 = require("../repayWithCollateralAdapter-contract");
const synthetix_contract_1 = require("../synthetix-contract");
const wethgateway_contract_1 = require("../wethgateway-contract");
const ILendingPool__factory_1 = require("./typechain/ILendingPool__factory");
const buildParaSwapLiquiditySwapParams = (assetToSwapTo, minAmountToReceive, swapAllBalanceOffset, swapCalldata, augustus, permitAmount, deadline, v, r, s) => {
    return ethers_1.utils.defaultAbiCoder.encode([
        'address',
        'uint256',
        'uint256',
        'bytes',
        'address',
        'tuple(uint256,uint256,uint8,bytes32,bytes32)',
    ], [
        assetToSwapTo,
        minAmountToReceive,
        swapAllBalanceOffset,
        swapCalldata,
        augustus,
        [permitAmount, deadline, v, r, s],
    ]);
};
class LendingPool extends BaseService_1.default {
    constructor(provider, lendingPoolConfig) {
        super(provider, ILendingPool__factory_1.ILendingPool__factory);
        const { LENDING_POOL, FLASH_LIQUIDATION_ADAPTER, REPAY_WITH_COLLATERAL_ADAPTER, SWAP_COLLATERAL_ADAPTER, WETH_GATEWAY, } = lendingPoolConfig !== null && lendingPoolConfig !== void 0 ? lendingPoolConfig : {};
        this.lendingPoolAddress = LENDING_POOL !== null && LENDING_POOL !== void 0 ? LENDING_POOL : '';
        this.flashLiquidationAddress = FLASH_LIQUIDATION_ADAPTER !== null && FLASH_LIQUIDATION_ADAPTER !== void 0 ? FLASH_LIQUIDATION_ADAPTER : '';
        this.swapCollateralAddress = SWAP_COLLATERAL_ADAPTER !== null && SWAP_COLLATERAL_ADAPTER !== void 0 ? SWAP_COLLATERAL_ADAPTER : '';
        this.repayWithCollateralAddress = REPAY_WITH_COLLATERAL_ADAPTER !== null && REPAY_WITH_COLLATERAL_ADAPTER !== void 0 ? REPAY_WITH_COLLATERAL_ADAPTER : '';
        // initialize services
        this.erc20Service = new erc20_contract_1.ERC20Service(provider);
        this.synthetixService = new synthetix_contract_1.SynthetixService(provider);
        this.wethGatewayService = new wethgateway_contract_1.WETHGatewayService(provider, this.erc20Service, WETH_GATEWAY);
        this.liquiditySwapAdapterService = new paraswap_liquiditySwapAdapter_contract_1.LiquiditySwapAdapterService(provider, SWAP_COLLATERAL_ADAPTER);
        this.repayWithCollateralAdapterService =
            new repayWithCollateralAdapter_contract_1.RepayWithCollateralAdapterService(provider, REPAY_WITH_COLLATERAL_ADAPTER);
    }
    async deposit({ user, reserve, amount, onBehalfOf, referralCode }) {
        if (reserve.toLowerCase() === utils_1.API_ETH_MOCK_ADDRESS.toLowerCase()) {
            return this.wethGatewayService.depositETH({
                lendingPool: this.lendingPoolAddress,
                user,
                amount,
                onBehalfOf,
                referralCode,
            });
        }
        const { isApproved, approve, decimalsOf } = this.erc20Service;
        const txs = [];
        const reserveDecimals = await decimalsOf(reserve);
        const convertedAmount = utils_1.valueToWei(amount, reserveDecimals);
        const fundsAvailable = await this.synthetixService.synthetixValidation({
            user,
            reserve,
            amount: convertedAmount,
        });
        if (!fundsAvailable) {
            throw new Error('Not enough funds to execute operation');
        }
        const approved = await isApproved({
            token: reserve,
            user,
            spender: this.lendingPoolAddress,
            amount,
        });
        if (!approved) {
            const approveTx = approve({
                user,
                token: reserve,
                spender: this.lendingPoolAddress,
                amount: utils_1.DEFAULT_APPROVE_AMOUNT,
            });
            txs.push(approveTx);
        }
        const lendingPoolContract = this.getContractInstance(this.lendingPoolAddress);
        const txCallback = this.generateTxCallback({
            rawTxMethod: async () => lendingPoolContract.populateTransaction.deposit(reserve, convertedAmount, onBehalfOf !== null && onBehalfOf !== void 0 ? onBehalfOf : user, referralCode !== null && referralCode !== void 0 ? referralCode : '0'),
            from: user,
            value: utils_1.getTxValue(reserve, convertedAmount),
        });
        txs.push({
            tx: txCallback,
            txType: types_1.eEthereumTxType.DLP_ACTION,
            gas: this.generateTxPriceEstimation(txs, txCallback, types_1.ProtocolAction.deposit),
        });
        return txs;
    }
    async withdraw({ user, reserve, amount, onBehalfOf, aTokenAddress }) {
        if (reserve.toLowerCase() === utils_1.API_ETH_MOCK_ADDRESS.toLowerCase()) {
            if (!aTokenAddress) {
                throw new Error('To withdraw ETH you need to pass the aWETH token address');
            }
            return this.wethGatewayService.withdrawETH({
                lendingPool: this.lendingPoolAddress,
                user,
                amount,
                onBehalfOf,
                aTokenAddress,
            });
        }
        const { decimalsOf } = this.erc20Service;
        const decimals = await decimalsOf(reserve);
        const convertedAmount = amount === '-1'
            ? ethers_1.constants.MaxUint256.toString()
            : utils_1.valueToWei(amount, decimals);
        const lendingPoolContract = this.getContractInstance(this.lendingPoolAddress);
        const txCallback = this.generateTxCallback({
            rawTxMethod: async () => lendingPoolContract.populateTransaction.withdraw(reserve, convertedAmount, onBehalfOf !== null && onBehalfOf !== void 0 ? onBehalfOf : user),
            from: user,
            action: types_1.ProtocolAction.withdraw,
        });
        return [
            {
                tx: txCallback,
                txType: types_1.eEthereumTxType.DLP_ACTION,
                gas: this.generateTxPriceEstimation([], txCallback, types_1.ProtocolAction.withdraw),
            },
        ];
    }
    async borrow({ user, reserve, amount, interestRateMode, debtTokenAddress, onBehalfOf, referralCode, }) {
        if (reserve.toLowerCase() === utils_1.API_ETH_MOCK_ADDRESS.toLowerCase()) {
            if (!debtTokenAddress) {
                throw new Error(`To borrow ETH you need to pass the stable or variable WETH debt Token Address corresponding the interestRateMode`);
            }
            return this.wethGatewayService.borrowETH({
                lendingPool: this.lendingPoolAddress,
                user,
                amount,
                debtTokenAddress,
                interestRateMode,
                referralCode,
            });
        }
        const { decimalsOf } = this.erc20Service;
        const reserveDecimals = await decimalsOf(reserve);
        const formatAmount = utils_1.valueToWei(amount, reserveDecimals);
        const numericRateMode = interestRateMode === types_1.InterestRate.Variable ? 2 : 1;
        const lendingPoolContract = this.getContractInstance(this.lendingPoolAddress);
        const txCallback = this.generateTxCallback({
            rawTxMethod: async () => lendingPoolContract.populateTransaction.borrow(reserve, formatAmount, numericRateMode, referralCode !== null && referralCode !== void 0 ? referralCode : 0, onBehalfOf !== null && onBehalfOf !== void 0 ? onBehalfOf : user),
            from: user,
        });
        return [
            {
                tx: txCallback,
                txType: types_1.eEthereumTxType.DLP_ACTION,
                gas: this.generateTxPriceEstimation([], txCallback),
            },
        ];
    }
    async repay({ user, reserve, amount, interestRateMode, onBehalfOf }) {
        if (reserve.toLowerCase() === utils_1.API_ETH_MOCK_ADDRESS.toLowerCase()) {
            return this.wethGatewayService.repayETH({
                lendingPool: this.lendingPoolAddress,
                user,
                amount,
                interestRateMode,
                onBehalfOf,
            });
        }
        const txs = [];
        const { isApproved, approve, decimalsOf } = this.erc20Service;
        const lendingPoolContract = this.getContractInstance(this.lendingPoolAddress);
        const { populateTransaction } = lendingPoolContract;
        const numericRateMode = interestRateMode === types_1.InterestRate.Variable ? 2 : 1;
        const decimals = await decimalsOf(reserve);
        const convertedAmount = amount === '-1'
            ? ethers_1.constants.MaxUint256.toString()
            : utils_1.valueToWei(amount, decimals);
        if (amount !== '-1') {
            const fundsAvailable = await this.synthetixService.synthetixValidation({
                user,
                reserve,
                amount: convertedAmount,
            });
            if (!fundsAvailable) {
                throw new Error('Not enough funds to execute operation');
            }
        }
        const approved = await isApproved({
            token: reserve,
            user,
            spender: this.lendingPoolAddress,
            amount,
        });
        if (!approved) {
            const approveTx = approve({
                user,
                token: reserve,
                spender: this.lendingPoolAddress,
                amount: utils_1.DEFAULT_APPROVE_AMOUNT,
            });
            txs.push(approveTx);
        }
        const txCallback = this.generateTxCallback({
            rawTxMethod: async () => populateTransaction.repay(reserve, convertedAmount, numericRateMode, onBehalfOf !== null && onBehalfOf !== void 0 ? onBehalfOf : user),
            from: user,
            value: utils_1.getTxValue(reserve, convertedAmount),
        });
        txs.push({
            tx: txCallback,
            txType: types_1.eEthereumTxType.DLP_ACTION,
            gas: this.generateTxPriceEstimation(txs, txCallback, types_1.ProtocolAction.repay),
        });
        return txs;
    }
    swapBorrowRateMode({ user, reserve, interestRateMode }) {
        const numericRateMode = interestRateMode === types_1.InterestRate.Variable ? 2 : 1;
        const lendingPoolContract = this.getContractInstance(this.lendingPoolAddress);
        const txCallback = this.generateTxCallback({
            rawTxMethod: async () => lendingPoolContract.populateTransaction.swapBorrowRateMode(reserve, numericRateMode),
            from: user,
        });
        return [
            {
                txType: types_1.eEthereumTxType.DLP_ACTION,
                tx: txCallback,
                gas: this.generateTxPriceEstimation([], txCallback),
            },
        ];
    }
    setUsageAsCollateral({ user, reserve, usageAsCollateral }) {
        const lendingPoolContract = this.getContractInstance(this.lendingPoolAddress);
        const txCallback = this.generateTxCallback({
            rawTxMethod: async () => lendingPoolContract.populateTransaction.setUserUseReserveAsCollateral(reserve, usageAsCollateral),
            from: user,
        });
        return [
            {
                tx: txCallback,
                txType: types_1.eEthereumTxType.DLP_ACTION,
                gas: this.generateTxPriceEstimation([], txCallback),
            },
        ];
    }
    async liquidationCall({ liquidator, liquidatedUser, debtReserve, collateralReserve, purchaseAmount, getAToken, liquidateAll, }) {
        const txs = [];
        const { isApproved, approve, decimalsOf } = this.erc20Service;
        const approved = await isApproved({
            token: debtReserve,
            user: liquidator,
            spender: this.lendingPoolAddress,
            amount: purchaseAmount,
        });
        if (!approved) {
            const approveTx = approve({
                user: liquidator,
                token: debtReserve,
                spender: this.lendingPoolAddress,
                amount: utils_1.DEFAULT_APPROVE_AMOUNT,
            });
            txs.push(approveTx);
        }
        let convertedAmount = ethers_1.constants.MaxUint256.toString();
        if (!liquidateAll) {
            const reserveDecimals = await decimalsOf(debtReserve);
            convertedAmount = utils_1.valueToWei(purchaseAmount, reserveDecimals);
        }
        const lendingPoolContract = this.getContractInstance(this.lendingPoolAddress);
        const txCallback = this.generateTxCallback({
            rawTxMethod: async () => lendingPoolContract.populateTransaction.liquidationCall(collateralReserve, debtReserve, liquidatedUser, convertedAmount, getAToken !== null && getAToken !== void 0 ? getAToken : false),
            from: liquidator,
            value: utils_1.getTxValue(debtReserve, convertedAmount),
        });
        txs.push({
            tx: txCallback,
            txType: types_1.eEthereumTxType.DLP_ACTION,
            gas: this.generateTxPriceEstimation(txs, txCallback, types_1.ProtocolAction.liquidationCall),
        });
        return txs;
    }
    async swapCollateral({ user, flash, fromAsset, fromAToken, toAsset, fromAmount, minToAmount, permitSignature, swapAll, onBehalfOf, referralCode, augustus, swapCallData, }) {
        const txs = [];
        const permitParams = permitSignature !== null && permitSignature !== void 0 ? permitSignature : {
            amount: '0',
            deadline: '0',
            v: 0,
            r: '0x0000000000000000000000000000000000000000000000000000000000000000',
            s: '0x0000000000000000000000000000000000000000000000000000000000000000',
        };
        const approved = await this.erc20Service.isApproved({
            token: fromAToken,
            user,
            spender: this.swapCollateralAddress,
            amount: fromAmount,
        });
        if (!approved) {
            const approveTx = this.erc20Service.approve({
                user,
                token: fromAToken,
                spender: this.swapCollateralAddress,
                amount: ethers_1.constants.MaxUint256.toString(),
            });
            txs.push(approveTx);
        }
        const tokenDecimals = await this.erc20Service.decimalsOf(fromAsset);
        const convertedAmount = utils_1.valueToWei(fromAmount, tokenDecimals);
        const tokenToDecimals = await this.erc20Service.decimalsOf(toAsset);
        const amountSlippageConverted = utils_1.valueToWei(minToAmount, tokenToDecimals);
        const lendingPoolContract = this.getContractInstance(this.lendingPoolAddress);
        if (flash) {
            const params = buildParaSwapLiquiditySwapParams(toAsset, amountSlippageConverted, swapAll
                ? paraswap_liquiditySwapAdapter_contract_1.augustusFromAmountOffsetFromCalldata(swapCallData)
                : 0, swapCallData, augustus, permitParams.amount, permitParams.deadline, permitParams.v, permitParams.r, permitParams.s);
            const amountWithSurplus = (Number(fromAmount) +
                (Number(fromAmount) * Number(utils_1.SURPLUS)) / 100).toString();
            const convertedAmountWithSurplus = utils_1.valueToWei(amountWithSurplus, tokenDecimals);
            const txCallback = this.generateTxCallback({
                rawTxMethod: async () => lendingPoolContract.populateTransaction.flashLoan(this.swapCollateralAddress, [fromAsset], swapAll ? [convertedAmountWithSurplus] : [convertedAmount], [0], onBehalfOf !== null && onBehalfOf !== void 0 ? onBehalfOf : user, params, referralCode !== null && referralCode !== void 0 ? referralCode : '0'),
                from: user,
            });
            txs.push({
                tx: txCallback,
                txType: types_1.eEthereumTxType.DLP_ACTION,
                gas: this.generateTxPriceEstimation(txs, txCallback, types_1.ProtocolAction.swapCollateral),
            });
            return txs;
        }
        // Direct call to swap and deposit
        const swapAndDepositTx = this.liquiditySwapAdapterService.swapAndDeposit({
            user,
            assetToSwapFrom: fromAsset,
            assetToSwapTo: toAsset,
            amountToSwap: convertedAmount,
            minAmountToReceive: amountSlippageConverted,
            swapAll,
            swapCallData,
            augustus,
            permitParams,
        }, txs);
        txs.push(swapAndDepositTx);
        return txs;
    }
    async repayWithCollateral({ user, fromAsset, fromAToken, assetToRepay, repayWithAmount, repayAmount, permitSignature, repayAllDebt, rateMode, onBehalfOf, referralCode, flash, useEthPath, }) {
        const txs = [];
        const permitParams = permitSignature !== null && permitSignature !== void 0 ? permitSignature : {
            amount: '0',
            deadline: '0',
            v: 0,
            r: '0x0000000000000000000000000000000000000000000000000000000000000000',
            s: '0x0000000000000000000000000000000000000000000000000000000000000000',
        };
        const approved = await this.erc20Service.isApproved({
            token: fromAToken,
            user,
            spender: this.repayWithCollateralAddress,
            amount: repayWithAmount,
        });
        if (!approved) {
            const approveTx = this.erc20Service.approve({
                user,
                token: fromAToken,
                spender: this.repayWithCollateralAddress,
                amount: ethers_1.constants.MaxUint256.toString(),
            });
            txs.push(approveTx);
        }
        const fromDecimals = await this.erc20Service.decimalsOf(fromAsset);
        const convertedRepayWithAmount = utils_1.valueToWei(repayWithAmount, fromDecimals);
        const repayAmountWithSurplus = (Number(repayAmount) +
            (Number(repayAmount) * Number(utils_1.SURPLUS)) / 100).toString();
        const decimals = await this.erc20Service.decimalsOf(assetToRepay);
        const convertedRepayAmount = repayAllDebt
            ? utils_1.valueToWei(repayAmountWithSurplus, decimals)
            : utils_1.valueToWei(repayAmount, decimals);
        const numericInterestRate = rateMode === types_1.InterestRate.Stable ? 1 : 2;
        if (flash) {
            const params = ethers_1.utils.defaultAbiCoder.encode([
                'address',
                'uint256',
                'uint256',
                'uint256',
                'uint256',
                'uint8',
                'bytes32',
                'bytes32',
                'bool',
            ], [
                fromAsset,
                convertedRepayWithAmount,
                numericInterestRate,
                permitParams.amount,
                permitParams.deadline,
                permitParams.v,
                permitParams.r,
                permitParams.s,
                useEthPath !== null && useEthPath !== void 0 ? useEthPath : false,
            ]);
            const lendingPoolContract = this.getContractInstance(this.lendingPoolAddress);
            const txCallback = this.generateTxCallback({
                rawTxMethod: async () => lendingPoolContract.populateTransaction.flashLoan(this.repayWithCollateralAddress, [assetToRepay], [convertedRepayAmount], [0], onBehalfOf !== null && onBehalfOf !== void 0 ? onBehalfOf : user, params, referralCode !== null && referralCode !== void 0 ? referralCode : '0'),
                from: user,
            });
            txs.push({
                tx: txCallback,
                txType: types_1.eEthereumTxType.DLP_ACTION,
                gas: this.generateTxPriceEstimation(txs, txCallback, types_1.ProtocolAction.repayCollateral),
            });
            return txs;
        }
        const swapAndRepayTx = this.repayWithCollateralAdapterService.swapAndRepay({
            user,
            collateralAsset: fromAsset,
            debtAsset: assetToRepay,
            collateralAmount: convertedRepayWithAmount,
            debtRepayAmount: convertedRepayAmount,
            debtRateMode: rateMode,
            permit: permitParams,
            useEthPath,
        }, txs);
        txs.push(swapAndRepayTx);
        return txs;
    }
    async flashLiquidation({ user, collateralAsset, borrowedAsset, debtTokenCover, liquidateAll, initiator, useEthPath, }) {
        const addSurplus = (amount) => {
            return (Number(amount) +
                (Number(amount) * Number(amount)) / 100).toString();
        };
        const txs = [];
        const lendingPoolContract = this.getContractInstance(this.lendingPoolAddress);
        const tokenDecimals = await this.erc20Service.decimalsOf(borrowedAsset);
        const convertedDebt = utils_1.valueToWei(debtTokenCover, tokenDecimals);
        const convertedDebtTokenCover = liquidateAll
            ? ethers_1.constants.MaxUint256.toString()
            : convertedDebt;
        const flashBorrowAmount = liquidateAll
            ? utils_1.valueToWei(addSurplus(debtTokenCover), tokenDecimals)
            : convertedDebt;
        const params = ethers_1.utils.defaultAbiCoder.encode(['address', 'address', 'address', 'uint256', 'bool'], [
            collateralAsset,
            borrowedAsset,
            user,
            convertedDebtTokenCover,
            useEthPath !== null && useEthPath !== void 0 ? useEthPath : false,
        ]);
        const txCallback = this.generateTxCallback({
            rawTxMethod: async () => lendingPoolContract.populateTransaction.flashLoan(this.flashLiquidationAddress, [borrowedAsset], [flashBorrowAmount], [0], initiator, params, '0'),
            from: initiator,
        });
        txs.push({
            tx: txCallback,
            txType: types_1.eEthereumTxType.DLP_ACTION,
            gas: this.generateTxPriceEstimation(txs, txCallback, types_1.ProtocolAction.liquidationFlash),
        });
        return txs;
    }
}
__decorate([
    methodValidators_1.LPValidator,
    __param(0, paramValidators_1.isEthAddress('user')),
    __param(0, paramValidators_1.isEthAddress('reserve')),
    __param(0, paramValidators_1.isPositiveAmount('amount')),
    __param(0, paramValidators_1.isEthAddress('onBehalfOf')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LendingPool.prototype, "deposit", null);
__decorate([
    methodValidators_1.LPValidator,
    __param(0, paramValidators_1.isEthAddress('user')),
    __param(0, paramValidators_1.isEthAddress('reserve')),
    __param(0, paramValidators_1.isPositiveOrMinusOneAmount('amount')),
    __param(0, paramValidators_1.isEthAddress('onBehalfOf')),
    __param(0, paramValidators_1.isEthAddress('aTokenAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LendingPool.prototype, "withdraw", null);
__decorate([
    methodValidators_1.LPValidator,
    __param(0, paramValidators_1.isEthAddress('user')),
    __param(0, paramValidators_1.isEthAddress('reserve')),
    __param(0, paramValidators_1.isPositiveAmount('amount')),
    __param(0, paramValidators_1.isEthAddress('debtTokenAddress')),
    __param(0, paramValidators_1.isEthAddress('onBehalfOf')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LendingPool.prototype, "borrow", null);
__decorate([
    methodValidators_1.LPValidator,
    __param(0, paramValidators_1.isEthAddress('user')),
    __param(0, paramValidators_1.isEthAddress('reserve')),
    __param(0, paramValidators_1.isPositiveOrMinusOneAmount('amount')),
    __param(0, paramValidators_1.isEthAddress('onBehalfOf')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LendingPool.prototype, "repay", null);
__decorate([
    methodValidators_1.LPValidator,
    __param(0, paramValidators_1.isEthAddress('user')),
    __param(0, paramValidators_1.isEthAddress('reserve')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Array)
], LendingPool.prototype, "swapBorrowRateMode", null);
__decorate([
    methodValidators_1.LPValidator,
    __param(0, paramValidators_1.isEthAddress('user')),
    __param(0, paramValidators_1.isEthAddress('reserve')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Array)
], LendingPool.prototype, "setUsageAsCollateral", null);
__decorate([
    methodValidators_1.LPValidator,
    __param(0, paramValidators_1.isEthAddress('liquidator')),
    __param(0, paramValidators_1.isEthAddress('liquidatedUser')),
    __param(0, paramValidators_1.isEthAddress('debtReserve')),
    __param(0, paramValidators_1.isEthAddress('collateralReserve')),
    __param(0, paramValidators_1.isPositiveAmount('purchaseAmount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LendingPool.prototype, "liquidationCall", null);
__decorate([
    methodValidators_1.LPSwapCollateralValidator,
    __param(0, paramValidators_1.isEthAddress('user')),
    __param(0, paramValidators_1.isEthAddress('fromAsset')),
    __param(0, paramValidators_1.isEthAddress('fromAToken')),
    __param(0, paramValidators_1.isEthAddress('toAsset')),
    __param(0, paramValidators_1.isEthAddress('onBehalfOf')),
    __param(0, paramValidators_1.isEthAddress('augustus')),
    __param(0, paramValidators_1.isPositiveAmount('fromAmount')),
    __param(0, paramValidators_1.isPositiveAmount('minToAmount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LendingPool.prototype, "swapCollateral", null);
__decorate([
    methodValidators_1.LPRepayWithCollateralValidator,
    __param(0, paramValidators_1.isEthAddress('user')),
    __param(0, paramValidators_1.isEthAddress('fromAsset')),
    __param(0, paramValidators_1.isEthAddress('fromAToken')),
    __param(0, paramValidators_1.isEthAddress('assetToRepay')),
    __param(0, paramValidators_1.isEthAddress('onBehalfOf')),
    __param(0, paramValidators_1.isPositiveAmount('repayWithAmount')),
    __param(0, paramValidators_1.isPositiveAmount('repayAmount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LendingPool.prototype, "repayWithCollateral", null);
__decorate([
    methodValidators_1.LPFlashLiquidationValidator,
    __param(0, paramValidators_1.isEthAddress('user')),
    __param(0, paramValidators_1.isEthAddress('collateralAsset')),
    __param(0, paramValidators_1.isEthAddress('borrowedAsset')),
    __param(0, paramValidators_1.isPositiveAmount('debtTokenCover')),
    __param(0, paramValidators_1.isEthAddress('initiator')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LendingPool.prototype, "flashLiquidation", null);
exports.LendingPool = LendingPool;
//# sourceMappingURL=index.js.map