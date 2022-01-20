'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var BigNumber = require('bignumber.js');
var BigNumber__default = _interopDefault(BigNumber);
var tslib = require('tslib');
var ethers = require('ethers');
require('reflect-metadata');
var utils = require('ethers/lib/utils');
var axios = _interopDefault(require('axios'));

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

var BigNumberZD =
/*#__PURE__*/
BigNumber__default.clone({
  DECIMAL_PLACES: 0,
  ROUNDING_MODE: BigNumber__default.ROUND_DOWN
});
function valueToBigNumber(amount) {
  return new BigNumber__default(amount);
}
function valueToZDBigNumber(amount) {
  return new BigNumberZD(amount);
}
var bn10 =
/*#__PURE__*/
new BigNumber__default(10);
var bn10PowLookup = {};
/**
 * It's a performance optimized version of 10 ** x, which essentially memoizes previously used pows and resolves them as lookup.
 * @param decimals
 * @returns 10 ** decimals
 */

function pow10(decimals) {
  if (!bn10PowLookup[decimals]) bn10PowLookup[decimals] = bn10.pow(decimals);
  return bn10PowLookup[decimals];
}
function normalize(n, decimals) {
  return normalizeBN(n, decimals).toString(10);
}
function normalizeBN(n, decimals) {
  return valueToBigNumber(n).dividedBy(pow10(decimals));
}

var WAD =
/*#__PURE__*/
valueToZDBigNumber(10).pow(18);
var HALF_WAD =
/*#__PURE__*/
WAD.dividedBy(2);
var RAY =
/*#__PURE__*/
valueToZDBigNumber(10).pow(27);
var HALF_RAY =
/*#__PURE__*/
RAY.dividedBy(2);
var WAD_RAY_RATIO =
/*#__PURE__*/
valueToZDBigNumber(10).pow(9);
function wadMul(a, b) {
  return HALF_WAD.plus(valueToZDBigNumber(a).multipliedBy(b)).div(WAD);
}
function wadDiv(a, b) {
  var halfB = valueToZDBigNumber(b).div(2);
  return halfB.plus(valueToZDBigNumber(a).multipliedBy(WAD)).div(b);
}
function rayMul(a, b) {
  return HALF_RAY.plus(valueToZDBigNumber(a).multipliedBy(b)).div(RAY);
}
function rayDiv(a, b) {
  var halfB = valueToZDBigNumber(b).div(2);
  return halfB.plus(valueToZDBigNumber(a).multipliedBy(RAY)).div(b);
}
function rayToWad(a) {
  var halfRatio = valueToZDBigNumber(WAD_RAY_RATIO).div(2);
  return halfRatio.plus(a).div(WAD_RAY_RATIO);
}
function wadToRay(a) {
  return valueToZDBigNumber(a).multipliedBy(WAD_RAY_RATIO).decimalPlaces(0);
}
function rayPow(a, p) {
  var x = valueToZDBigNumber(a);
  var n = valueToZDBigNumber(p);
  var z = !n.modulo(2).eq(0) ? x : valueToZDBigNumber(RAY);

  for (n = n.div(2); !n.eq(0); n = n.div(2)) {
    x = rayMul(x, x);

    if (!n.modulo(2).eq(0)) {
      z = rayMul(z, x);
    }
  }

  return z;
}
/**
 * RayPow is slow and gas intensive therefore in v2 we switched to binomial approximation on the contract level.
 * While the results ar not exact to the last decimal, they are close enough.
 */

function binomialApproximatedRayPow(a, p) {
  var base = valueToZDBigNumber(a);
  var exp = valueToZDBigNumber(p);
  if (exp.eq(0)) return RAY;
  var expMinusOne = exp.minus(1);
  var expMinusTwo = exp.gt(2) ? exp.minus(2) : 0;
  var basePowerTwo = rayMul(base, base);
  var basePowerThree = rayMul(basePowerTwo, base);
  var firstTerm = exp.multipliedBy(base);
  var secondTerm = exp.multipliedBy(expMinusOne).multipliedBy(basePowerTwo).div(2);
  var thirdTerm = exp.multipliedBy(expMinusOne).multipliedBy(expMinusTwo).multipliedBy(basePowerThree).div(6);
  return RAY.plus(firstTerm).plus(secondTerm).plus(thirdTerm);
}
function rayToDecimal(a) {
  return valueToZDBigNumber(a).dividedBy(RAY);
}

var BorrowRateMode;

(function (BorrowRateMode) {
  BorrowRateMode["None"] = "None";
  BorrowRateMode["Stable"] = "Stable";
  BorrowRateMode["Variable"] = "Variable";
})(BorrowRateMode || (BorrowRateMode = {}));

var SECONDS_PER_YEAR =
/*#__PURE__*/
valueToBigNumber('31536000');
var ETH_DECIMALS = 18;
var USD_DECIMALS = 10;
var RAY_DECIMALS = 27;

var LTV_PRECISION = 4;
function calculateCompoundedInterest(rate, currentTimestamp, lastUpdateTimestamp) {
  var timeDelta = valueToZDBigNumber(currentTimestamp - lastUpdateTimestamp);
  var ratePerSecond = valueToZDBigNumber(rate).dividedBy(SECONDS_PER_YEAR);
  return binomialApproximatedRayPow(ratePerSecond, timeDelta);
}
function getCompoundedBalance(_principalBalance, _reserveIndex, _reserveRate, _lastUpdateTimestamp, currentTimestamp) {
  var principalBalance = valueToZDBigNumber(_principalBalance);

  if (principalBalance.eq('0')) {
    return principalBalance;
  }

  var compoundedInterest = calculateCompoundedInterest(_reserveRate, currentTimestamp, _lastUpdateTimestamp);
  var cumulatedInterest = rayMul(compoundedInterest, _reserveIndex);
  var principalBalanceRay = wadToRay(principalBalance);
  return rayToWad(rayMul(principalBalanceRay, cumulatedInterest));
}
var calculateLinearInterest = function calculateLinearInterest(rate, currentTimestamp, lastUpdateTimestamp) {
  var timeDelta = wadToRay(valueToZDBigNumber(currentTimestamp - lastUpdateTimestamp));
  var timeDeltaInSeconds = rayDiv(timeDelta, wadToRay(SECONDS_PER_YEAR));
  return rayMul(rate, timeDeltaInSeconds).plus(RAY);
};
function getReserveNormalizedIncome(rate, index, lastUpdateTimestamp, currentTimestamp) {
  if (valueToZDBigNumber(rate).eq('0')) {
    return valueToZDBigNumber(index);
  }

  var cumulatedInterest = calculateLinearInterest(rate, currentTimestamp, lastUpdateTimestamp);
  return rayMul(cumulatedInterest, index);
}
function getLinearBalance(balance, index, rate, lastUpdateTimestamp, currentTimestamp) {
  return rayToWad(rayMul(wadToRay(balance), getReserveNormalizedIncome(rate, index, lastUpdateTimestamp, currentTimestamp)));
}
function getCompoundedStableBalance(_principalBalance, _userStableRate, _lastUpdateTimestamp, currentTimestamp) {
  var principalBalance = valueToZDBigNumber(_principalBalance);

  if (principalBalance.eq('0')) {
    return principalBalance;
  }

  var cumulatedInterest = calculateCompoundedInterest(_userStableRate, currentTimestamp, _lastUpdateTimestamp);
  var principalBalanceRay = wadToRay(principalBalance);
  return rayToWad(rayMul(principalBalanceRay, cumulatedInterest));
}
function calculateHealthFactorFromBalances(collateralBalanceETH, borrowBalanceETH, currentLiquidationThreshold) {
  if (valueToBigNumber(borrowBalanceETH).eq(0)) {
    return valueToBigNumber('-1'); // invalid number
  }

  return valueToBigNumber(collateralBalanceETH).multipliedBy(currentLiquidationThreshold).dividedBy(pow10(LTV_PRECISION)).div(borrowBalanceETH);
}
function calculateHealthFactorFromBalancesBigUnits(collateralBalanceETH, borrowBalanceETH, currentLiquidationThreshold) {
  return calculateHealthFactorFromBalances(collateralBalanceETH, borrowBalanceETH, new BigNumber__default(currentLiquidationThreshold).multipliedBy(pow10(LTV_PRECISION)).decimalPlaces(0, BigNumber__default.ROUND_DOWN));
}
function calculateAvailableBorrowsETH(collateralBalanceETH, borrowBalanceETH, currentLtv) {
  if (valueToZDBigNumber(currentLtv).eq(0)) {
    return valueToZDBigNumber('0');
  }

  var availableBorrowsETH = valueToZDBigNumber(collateralBalanceETH).multipliedBy(currentLtv).dividedBy(pow10(LTV_PRECISION)).minus(borrowBalanceETH);
  return availableBorrowsETH.gt('0') ? availableBorrowsETH : valueToZDBigNumber('0');
}
function calculateAverageRate(index0, index1, timestamp0, timestamp1) {
  return valueToBigNumber(index1).dividedBy(index0).minus('1').dividedBy(timestamp1 - timestamp0).multipliedBy(SECONDS_PER_YEAR).toString();
}

function getCompoundedBorrowBalance(reserve, userReserve, currentTimestamp) {
  var principalBorrows = valueToZDBigNumber(userReserve.principalBorrows);

  if (principalBorrows.eq('0')) {
    return valueToZDBigNumber('0');
  }

  var cumulatedInterest;

  if (userReserve.borrowRateMode === BorrowRateMode.Variable) {
    var compoundedInterest = calculateCompoundedInterest$1(reserve.variableBorrowRate, currentTimestamp, reserve.lastUpdateTimestamp);
    cumulatedInterest = rayDiv(rayMul(compoundedInterest, reserve.variableBorrowIndex), userReserve.variableBorrowIndex);
  } else {
    // if stable
    cumulatedInterest = calculateCompoundedInterest$1(userReserve.borrowRate, currentTimestamp, userReserve.lastUpdateTimestamp);
  }

  var borrowBalanceRay = wadToRay(principalBorrows);
  return rayToWad(rayMul(borrowBalanceRay, cumulatedInterest));
}
var calculateCompoundedInterest$1 = function calculateCompoundedInterest(rate, currentTimestamp, lastUpdateTimestamp) {
  var timeDelta = valueToZDBigNumber(currentTimestamp - lastUpdateTimestamp);
  var ratePerSecond = valueToZDBigNumber(rate).dividedBy(SECONDS_PER_YEAR);
  return binomialApproximatedRayPow(ratePerSecond, timeDelta);
};
function calculateHealthFactorFromBalances$1(collateralBalanceETH, borrowBalanceETH, totalFeesETH, currentLiquidationThreshold) {
  if (valueToBigNumber(borrowBalanceETH).eq(0)) {
    return valueToBigNumber('-1'); // invalid number
  }

  return valueToBigNumber(collateralBalanceETH).multipliedBy(currentLiquidationThreshold).dividedBy(100).div(valueToBigNumber(borrowBalanceETH).plus(totalFeesETH));
}
function calculateHealthFactorFromBalancesBigUnits$1(collateralBalanceETH, borrowBalanceETH, totalFeesETH, currentLiquidationThreshold) {
  return calculateHealthFactorFromBalances$1(collateralBalanceETH, borrowBalanceETH, totalFeesETH, new BigNumber__default(currentLiquidationThreshold).multipliedBy(100).decimalPlaces(0, BigNumber__default.ROUND_DOWN));
}
function calculateAvailableBorrowsETH$1(collateralBalanceETH, borrowBalanceETH, totalFeesETH, currentLtv) {
  if (valueToZDBigNumber(currentLtv).eq(0)) {
    return valueToZDBigNumber('0');
  }

  var availableBorrowsETH = valueToZDBigNumber(collateralBalanceETH).multipliedBy(currentLtv).dividedBy(100);

  if (availableBorrowsETH.lt(borrowBalanceETH)) {
    return valueToZDBigNumber('0');
  }

  availableBorrowsETH = availableBorrowsETH.minus(borrowBalanceETH).minus(totalFeesETH);
  var borrowFee = availableBorrowsETH.multipliedBy('0.0025');
  return availableBorrowsETH.minus(borrowFee);
}
function calculateCumulatedBalance(balance, userReserve, poolReserve, currentTimestamp) {
  return rayToWad(rayDiv(rayMul(wadToRay(balance), getReserveNormalizedIncome(poolReserve.liquidityRate, poolReserve.liquidityIndex, poolReserve.lastUpdateTimestamp, currentTimestamp)), userReserve.userBalanceIndex));
}
function calculateCurrentUnderlyingBalance(userReserve, poolReserve, currentTimestamp) {
  if (userReserve.principalATokenBalance === '0' && userReserve.redirectedBalance === '0') {
    return valueToZDBigNumber('0');
  }

  if (userReserve.interestRedirectionAddress !== '0x0000000000000000000000000000000000000000') {
    return valueToZDBigNumber(userReserve.principalATokenBalance).plus(calculateCumulatedBalance(userReserve.redirectedBalance, userReserve, poolReserve, currentTimestamp).minus(userReserve.redirectedBalance));
  }

  return calculateCumulatedBalance(valueToBigNumber(userReserve.redirectedBalance).plus(userReserve.principalATokenBalance).toString(), userReserve, poolReserve, currentTimestamp).minus(userReserve.redirectedBalance);
}

function computeUserReserveData(poolReserve, userReserve, usdPriceEth, currentTimestamp) {
  var priceInEth = poolReserve.price.priceInEth,
      decimals = poolReserve.decimals;
  var currentUnderlyingBalance = calculateCurrentUnderlyingBalance(userReserve, poolReserve, currentTimestamp);
  var currentUnderlyingBalanceETH = currentUnderlyingBalance.multipliedBy(priceInEth).dividedBy(pow10(decimals));
  var currentUnderlyingBalanceUSD = currentUnderlyingBalanceETH.multipliedBy(pow10(USD_DECIMALS)).dividedBy(usdPriceEth).toFixed(0);
  var principalBorrowsETH = valueToZDBigNumber(userReserve.principalBorrows).multipliedBy(priceInEth).dividedBy(pow10(decimals));
  var principalBorrowsUSD = principalBorrowsETH.multipliedBy(pow10(USD_DECIMALS)).dividedBy(usdPriceEth).toFixed(0);
  var currentBorrows = getCompoundedBorrowBalance(poolReserve, userReserve, currentTimestamp);
  var currentBorrowsETH = currentBorrows.multipliedBy(priceInEth).dividedBy(pow10(decimals));
  var currentBorrowsUSD = currentBorrowsETH.multipliedBy(pow10(USD_DECIMALS)).dividedBy(usdPriceEth).toFixed(0);
  var originationFeeETH = valueToZDBigNumber(userReserve.originationFee).multipliedBy(priceInEth).dividedBy(pow10(decimals));
  var originationFeeUSD = originationFeeETH.multipliedBy(pow10(USD_DECIMALS)).dividedBy(usdPriceEth).toFixed(0);
  return _extends({}, userReserve, {
    principalBorrowsUSD: principalBorrowsUSD,
    currentBorrowsUSD: currentBorrowsUSD,
    originationFeeUSD: originationFeeUSD,
    currentUnderlyingBalanceUSD: currentUnderlyingBalanceUSD,
    originationFeeETH: originationFeeETH.toString(),
    currentBorrows: currentBorrows.toString(),
    currentBorrowsETH: currentBorrowsETH.toString(),
    principalBorrowsETH: principalBorrowsETH.toString(),
    currentUnderlyingBalance: currentUnderlyingBalance.toFixed(),
    currentUnderlyingBalanceETH: currentUnderlyingBalanceETH.toFixed()
  });
}

function computeRawUserSummaryData(poolReservesData, rawUserReserves, userId, usdPriceEth, currentTimestamp) {
  var totalLiquidityETH = valueToZDBigNumber('0');
  var totalCollateralETH = valueToZDBigNumber('0');
  var totalBorrowsETH = valueToZDBigNumber('0');
  var totalFeesETH = valueToZDBigNumber('0');
  var currentLtv = valueToBigNumber('0');
  var currentLiquidationThreshold = valueToBigNumber('0');
  var userReservesData = rawUserReserves.map(function (userReserve) {
    var poolReserve = poolReservesData.find(function (reserve) {
      return reserve.id === userReserve.reserve.id;
    });

    if (!poolReserve) {
      throw new Error('Reserve is not registered on platform, please contact support');
    }

    var computedUserReserve = computeUserReserveData(poolReserve, userReserve, usdPriceEth, currentTimestamp);
    totalLiquidityETH = totalLiquidityETH.plus(computedUserReserve.currentUnderlyingBalanceETH);
    totalBorrowsETH = totalBorrowsETH.plus(computedUserReserve.currentBorrowsETH);
    totalFeesETH = totalFeesETH.plus(computedUserReserve.originationFeeETH); // asset enabled as collateral

    if (poolReserve.usageAsCollateralEnabled && userReserve.usageAsCollateralEnabledOnUser) {
      totalCollateralETH = totalCollateralETH.plus(computedUserReserve.currentUnderlyingBalanceETH);
      currentLtv = currentLtv.plus(valueToBigNumber(computedUserReserve.currentUnderlyingBalanceETH).multipliedBy(poolReserve.baseLTVasCollateral));
      currentLiquidationThreshold = currentLiquidationThreshold.plus(valueToBigNumber(computedUserReserve.currentUnderlyingBalanceETH).multipliedBy(poolReserve.reserveLiquidationThreshold));
    }

    return computedUserReserve;
  }).sort(function (a, b) {
    return a.reserve.symbol > b.reserve.symbol ? 1 : a.reserve.symbol < b.reserve.symbol ? -1 : 0;
  });

  if (currentLtv.gt(0)) {
    currentLtv = currentLtv.div(totalCollateralETH).decimalPlaces(0, BigNumber__default.ROUND_DOWN);
  }

  if (currentLiquidationThreshold.gt(0)) {
    currentLiquidationThreshold = currentLiquidationThreshold.div(totalCollateralETH).decimalPlaces(0, BigNumber__default.ROUND_DOWN);
  }

  var healthFactor = calculateHealthFactorFromBalances$1(totalCollateralETH, totalBorrowsETH, totalFeesETH, currentLiquidationThreshold);
  var totalCollateralUSD = totalCollateralETH.multipliedBy(pow10(USD_DECIMALS)).dividedBy(usdPriceEth).toString();
  var totalLiquidityUSD = totalLiquidityETH.multipliedBy(pow10(USD_DECIMALS)).dividedBy(usdPriceEth).toString();
  var totalBorrowsUSD = totalBorrowsETH.multipliedBy(pow10(USD_DECIMALS)).dividedBy(usdPriceEth).toString();
  var totalFeesUSD = totalFeesETH.multipliedBy(pow10(USD_DECIMALS)).dividedBy(usdPriceEth);
  var totalBorrowsWithFeesETH = totalFeesETH.plus(totalBorrowsETH);
  var totalBorrowsWithFeesUSD = totalFeesUSD.plus(totalBorrowsUSD);
  var availableBorrowsETH = calculateAvailableBorrowsETH$1(totalCollateralETH, totalBorrowsETH, totalFeesETH, currentLtv);
  var totalBorrowsAndFeesETH = totalBorrowsETH.plus(totalFeesETH);
  var maxAmountToWithdrawInEth = totalLiquidityETH.minus(totalBorrowsAndFeesETH.eq(0) ? '0' : totalBorrowsAndFeesETH.multipliedBy(100).dividedBy(currentLiquidationThreshold));
  return {
    totalLiquidityUSD: totalLiquidityUSD,
    totalCollateralUSD: totalCollateralUSD,
    totalBorrowsUSD: totalBorrowsUSD,
    id: userId,
    totalLiquidityETH: totalLiquidityETH.toString(),
    totalCollateralETH: totalCollateralETH.toString(),
    totalFeesETH: totalFeesETH.toString(),
    totalBorrowsETH: totalBorrowsETH.toString(),
    availableBorrowsETH: availableBorrowsETH.toString(),
    currentLoanToValue: currentLtv.toString(),
    currentLiquidationThreshold: currentLiquidationThreshold.toString(),
    maxAmountToWithdrawInEth: maxAmountToWithdrawInEth.toString(),
    healthFactor: healthFactor.toString(),
    reservesData: userReservesData,
    totalFeesUSD: totalFeesUSD.toString(),
    totalBorrowsWithFeesETH: totalBorrowsWithFeesETH.toString(),
    totalBorrowsWithFeesUSD: totalBorrowsWithFeesUSD.toString()
  };
}
function formatUserSummaryData(poolReservesData, rawUserReserves, userId, usdPriceEth, currentTimestamp) {
  var userData = computeRawUserSummaryData(poolReservesData, rawUserReserves, userId, usdPriceEth, currentTimestamp);
  var userReservesData = userData.reservesData.map(function (_ref) {
    var reserve = _ref.reserve,
        userReserve = _objectWithoutPropertiesLoose(_ref, ["reserve"]);

    var reserveDecimals = reserve.decimals;
    return _extends({}, userReserve, {
      reserve: _extends({}, reserve, {
        reserveLiquidationBonus: normalize(valueToBigNumber(reserve.reserveLiquidationBonus).minus(100), 2),
        liquidityRate: normalize(reserve.liquidityRate, RAY_DECIMALS)
      }),
      redirectedBalance: normalize(userReserve.redirectedBalance, reserveDecimals),
      principalATokenBalance: normalize(userReserve.principalATokenBalance, reserveDecimals),
      borrowRate: normalize(userReserve.borrowRate, RAY_DECIMALS),
      lastUpdateTimestamp: userReserve.lastUpdateTimestamp,
      variableBorrowIndex: normalize(userReserve.variableBorrowIndex, RAY_DECIMALS),
      userBalanceIndex: normalize(userReserve.userBalanceIndex, RAY_DECIMALS),
      currentUnderlyingBalance: normalize(userReserve.currentUnderlyingBalance, reserveDecimals),
      currentUnderlyingBalanceETH: normalize(userReserve.currentUnderlyingBalanceETH, ETH_DECIMALS),
      currentUnderlyingBalanceUSD: normalize(userReserve.currentUnderlyingBalanceUSD, USD_DECIMALS),
      principalBorrows: normalize(userReserve.principalBorrows, reserveDecimals),
      principalBorrowsETH: normalize(userReserve.principalBorrowsETH, ETH_DECIMALS),
      principalBorrowsUSD: normalize(userReserve.principalBorrowsUSD, USD_DECIMALS),
      currentBorrows: normalize(userReserve.currentBorrows, reserveDecimals),
      currentBorrowsETH: normalize(userReserve.currentBorrowsETH, ETH_DECIMALS),
      currentBorrowsUSD: normalize(userReserve.currentBorrowsUSD, USD_DECIMALS),
      originationFee: normalize(userReserve.originationFee, reserveDecimals),
      originationFeeETH: normalize(userReserve.originationFeeETH, ETH_DECIMALS),
      originationFeeUSD: normalize(userReserve.originationFeeUSD, USD_DECIMALS)
    });
  });
  return {
    id: userData.id,
    reservesData: userReservesData,
    totalLiquidityETH: normalize(userData.totalLiquidityETH, ETH_DECIMALS),
    totalLiquidityUSD: normalize(userData.totalLiquidityUSD, USD_DECIMALS),
    totalCollateralETH: normalize(userData.totalCollateralETH, ETH_DECIMALS),
    totalCollateralUSD: normalize(userData.totalCollateralUSD, USD_DECIMALS),
    totalFeesETH: normalize(userData.totalFeesETH, ETH_DECIMALS),
    totalFeesUSD: normalize(userData.totalFeesUSD, USD_DECIMALS),
    totalBorrowsETH: normalize(userData.totalBorrowsETH, ETH_DECIMALS),
    totalBorrowsUSD: normalize(userData.totalBorrowsUSD, USD_DECIMALS),
    totalBorrowsWithFeesETH: normalize(userData.totalBorrowsWithFeesETH, ETH_DECIMALS),
    totalBorrowsWithFeesUSD: normalize(userData.totalBorrowsWithFeesUSD, USD_DECIMALS),
    availableBorrowsETH: normalize(userData.availableBorrowsETH, ETH_DECIMALS),
    currentLoanToValue: normalize(userData.currentLoanToValue, 2),
    currentLiquidationThreshold: normalize(userData.currentLiquidationThreshold, 2),
    maxAmountToWithdrawInEth: normalize(userData.maxAmountToWithdrawInEth, ETH_DECIMALS),
    healthFactor: userData.healthFactor
  };
}
function formatReserves(reserves, reserveIndexes30DaysAgo) {
  return reserves.map(function (reserve) {
    var _reserveIndexes30Days, _reserveIndexes30Days2;

    var reserve30DaysAgo = reserveIndexes30DaysAgo == null ? void 0 : (_reserveIndexes30Days = reserveIndexes30DaysAgo.find(function (res) {
      return res.id === reserve.id;
    })) == null ? void 0 : (_reserveIndexes30Days2 = _reserveIndexes30Days.paramsHistory) == null ? void 0 : _reserveIndexes30Days2[0];
    return _extends({}, reserve, {
      price: _extends({}, reserve.price, {
        priceInEth: normalize(reserve.price.priceInEth, ETH_DECIMALS)
      }),
      baseLTVasCollateral: normalize(reserve.baseLTVasCollateral, 2),
      variableBorrowRate: normalize(reserve.variableBorrowRate, RAY_DECIMALS),
      avg30DaysVariableBorrowRate: reserve30DaysAgo ? calculateAverageRate(reserve30DaysAgo.variableBorrowIndex, reserve.variableBorrowIndex, reserve30DaysAgo.timestamp, reserve.lastUpdateTimestamp) : undefined,
      avg30DaysLiquidityRate: reserve30DaysAgo ? calculateAverageRate(reserve30DaysAgo.liquidityIndex, reserve.liquidityIndex, reserve30DaysAgo.timestamp, reserve.lastUpdateTimestamp) : undefined,
      stableBorrowRate: normalize(reserve.stableBorrowRate, RAY_DECIMALS),
      liquidityRate: normalize(reserve.liquidityRate, RAY_DECIMALS),
      totalLiquidity: normalize(reserve.totalLiquidity, reserve.decimals),
      availableLiquidity: normalize(reserve.availableLiquidity, reserve.decimals),
      liquidityIndex: normalize(reserve.liquidityIndex, RAY_DECIMALS),
      reserveLiquidationThreshold: normalize(reserve.reserveLiquidationThreshold, 2),
      reserveLiquidationBonus: normalize(valueToBigNumber(reserve.reserveLiquidationBonus).minus(100), 2),
      totalBorrows: normalize(reserve.totalBorrows, reserve.decimals),
      totalBorrowsVariable: normalize(reserve.totalBorrowsVariable, reserve.decimals),
      totalBorrowsStable: normalize(reserve.totalBorrowsStable, reserve.decimals),
      variableBorrowIndex: normalize(reserve.variableBorrowIndex, RAY_DECIMALS)
    });
  });
}
function calculateInterestRates(reserve, amountToDeposit, amountToBorrow, borrowMode) {
  if (borrowMode === void 0) {
    borrowMode = 'variable';
  }

  var optimalUtilisationRate = reserve.optimalUtilisationRate;
  var baseVariableBorrowRate = valueToBigNumber(reserve.baseVariableBorrowRate);
  var totalBorrowsStable = valueToBigNumber(reserve.totalBorrowsStable).plus(borrowMode === 'stable' ? amountToBorrow : '0');
  var totalBorrowsVariable = valueToBigNumber(reserve.totalBorrowsVariable).plus(borrowMode === 'variable' ? amountToBorrow : '0');
  var totalBorrows = totalBorrowsStable.plus(totalBorrowsVariable);
  var totalDeposits = valueToBigNumber(reserve.totalLiquidity).plus(amountToDeposit);
  var utilizationRate = totalDeposits.eq(0) && totalBorrows.eq(0) ? valueToBigNumber(0) : totalBorrows.dividedBy(totalDeposits);
  var currentStableBorrowRate = valueToBigNumber(reserve.stableBorrowRate);
  var currentVariableBorrowRate = valueToBigNumber(0);
  var currentLiquidityRate = valueToBigNumber(0);

  if (utilizationRate.gt(optimalUtilisationRate)) {
    var excessUtilizationRateRatio = utilizationRate.minus(optimalUtilisationRate).dividedBy(valueToBigNumber(1).minus(optimalUtilisationRate));
    currentStableBorrowRate = currentStableBorrowRate.plus(reserve.stableRateSlope1).plus(excessUtilizationRateRatio.multipliedBy(reserve.stableRateSlope2));
    currentVariableBorrowRate = baseVariableBorrowRate.plus(reserve.variableRateSlope1).plus(excessUtilizationRateRatio.multipliedBy(reserve.variableRateSlope2));
  } else {
    currentStableBorrowRate = currentVariableBorrowRate.plus(utilizationRate.dividedBy(optimalUtilisationRate).multipliedBy(reserve.stableRateSlope1));
    currentVariableBorrowRate = baseVariableBorrowRate.plus(utilizationRate.dividedBy(optimalUtilisationRate).multipliedBy(reserve.variableRateSlope1));
  }

  if (!totalBorrows.eq(0)) {
    var weightedVariableRate = currentVariableBorrowRate.multipliedBy(totalBorrowsVariable);
    var weightedStableRate = valueToBigNumber(reserve.averageStableBorrowRate).multipliedBy(totalBorrowsStable);
    currentLiquidityRate = weightedVariableRate.plus(weightedStableRate).dividedBy(totalBorrows);
  }

  return {
    variableBorrowRate: currentVariableBorrowRate.toString(),
    stableBorrowRate: currentStableBorrowRate.toString(),
    liquidityRate: currentLiquidityRate.toString()
  };
}



var index = {
  __proto__: null,
  getCompoundedBorrowBalance: getCompoundedBorrowBalance,
  calculateCompoundedInterest: calculateCompoundedInterest$1,
  calculateHealthFactorFromBalances: calculateHealthFactorFromBalances$1,
  calculateHealthFactorFromBalancesBigUnits: calculateHealthFactorFromBalancesBigUnits$1,
  calculateAvailableBorrowsETH: calculateAvailableBorrowsETH$1,
  calculateCumulatedBalance: calculateCumulatedBalance,
  calculateCurrentUnderlyingBalance: calculateCurrentUnderlyingBalance,
  computeRawUserSummaryData: computeRawUserSummaryData,
  formatUserSummaryData: formatUserSummaryData,
  formatReserves: formatReserves,
  calculateInterestRates: calculateInterestRates,
  get BorrowRateMode () { return BorrowRateMode; }
};

function getEthAndUsdBalance(balance, priceInEth, decimals, usdPriceEth) {
  var balanceInEth = valueToZDBigNumber(balance).multipliedBy(priceInEth).dividedBy(pow10(decimals));
  var balanceInUsd = balanceInEth.multipliedBy(pow10(USD_DECIMALS)).dividedBy(usdPriceEth).toFixed(0);
  return [balanceInEth.toString(), balanceInUsd];
}
/*
type ComputeUserReserveDataPoolReserve = Pick<
  ReserveData,
  | 'price'
  | 'decimals'
  | 'liquidityIndex'
  | 'liquidityRate'
  | 'lastUpdateTimestamp'
  | 'variableBorrowIndex'
  | 'variableBorrowRate'
>;

type ComputeUserReserveDataUserReserve = Pick<
  UserReserveData,
  | 'scaledATokenBalance'
  | 'scaledVariableDebt'
  | 'principalStableDebt'
  | 'stableBorrowRate'
  | 'stableBorrowLastUpdateTimestamp'
>;
*/

function computeUserReserveData$1(poolReserve, userReserve, usdPriceEth, currentTimestamp, rewardsInfo) {
  var priceInEth = poolReserve.price.priceInEth,
      decimals = poolReserve.decimals;
  var underlyingBalance = getLinearBalance(userReserve.scaledATokenBalance, poolReserve.liquidityIndex, poolReserve.liquidityRate, poolReserve.lastUpdateTimestamp, currentTimestamp).toString();

  var _getEthAndUsdBalance = getEthAndUsdBalance(underlyingBalance, priceInEth, decimals, usdPriceEth),
      underlyingBalanceETH = _getEthAndUsdBalance[0],
      underlyingBalanceUSD = _getEthAndUsdBalance[1];

  var variableBorrows = getCompoundedBalance(userReserve.scaledVariableDebt, poolReserve.variableBorrowIndex, poolReserve.variableBorrowRate, poolReserve.lastUpdateTimestamp, currentTimestamp).toString();

  var _getEthAndUsdBalance2 = getEthAndUsdBalance(variableBorrows, priceInEth, decimals, usdPriceEth),
      variableBorrowsETH = _getEthAndUsdBalance2[0],
      variableBorrowsUSD = _getEthAndUsdBalance2[1];

  var stableBorrows = getCompoundedStableBalance(userReserve.principalStableDebt, userReserve.stableBorrowRate, userReserve.stableBorrowLastUpdateTimestamp, currentTimestamp).toString();

  var _getEthAndUsdBalance3 = getEthAndUsdBalance(stableBorrows, priceInEth, decimals, usdPriceEth),
      stableBorrowsETH = _getEthAndUsdBalance3[0],
      stableBorrowsUSD = _getEthAndUsdBalance3[1];

  var _calculateSupplies = calculateSupplies({
    totalScaledVariableDebt: poolReserve.totalScaledVariableDebt,
    variableBorrowIndex: poolReserve.variableBorrowIndex,
    variableBorrowRate: poolReserve.variableBorrowRate,
    totalPrincipalStableDebt: poolReserve.totalPrincipalStableDebt,
    averageStableRate: poolReserve.averageStableRate,
    availableLiquidity: poolReserve.availableLiquidity,
    stableDebtLastUpdateTimestamp: poolReserve.stableDebtLastUpdateTimestamp,
    lastUpdateTimestamp: poolReserve.lastUpdateTimestamp
  }, currentTimestamp),
      totalLiquidity = _calculateSupplies.totalLiquidity,
      totalStableDebt = _calculateSupplies.totalStableDebt,
      totalVariableDebt = _calculateSupplies.totalVariableDebt;

  var aTokenRewards = totalLiquidity.gt(0) ? calculateRewards(underlyingBalance, poolReserve.aTokenIncentivesIndex, userReserve.aTokenincentivesUserIndex, rewardsInfo.incentivePrecision, rewardsInfo.rewardTokenDecimals, poolReserve.aIncentivesLastUpdateTimestamp, poolReserve.aEmissionPerSecond, totalLiquidity, currentTimestamp, rewardsInfo.emissionEndTimestamp) : '0';

  var _getEthAndUsdBalance4 = getEthAndUsdBalance(aTokenRewards, rewardsInfo.rewardTokenPriceEth, rewardsInfo.rewardTokenDecimals, usdPriceEth),
      aTokenRewardsETH = _getEthAndUsdBalance4[0],
      aTokenRewardsUSD = _getEthAndUsdBalance4[1];

  var vTokenRewards = totalVariableDebt.gt(0) ? calculateRewards(variableBorrows, poolReserve.vTokenIncentivesIndex, userReserve.vTokenincentivesUserIndex, rewardsInfo.incentivePrecision, rewardsInfo.rewardTokenDecimals, poolReserve.vIncentivesLastUpdateTimestamp, poolReserve.vEmissionPerSecond, totalVariableDebt, currentTimestamp, rewardsInfo.emissionEndTimestamp) : '0';

  var _getEthAndUsdBalance5 = getEthAndUsdBalance(vTokenRewards, rewardsInfo.rewardTokenPriceEth, rewardsInfo.rewardTokenDecimals, usdPriceEth),
      vTokenRewardsETH = _getEthAndUsdBalance5[0],
      vTokenRewardsUSD = _getEthAndUsdBalance5[1];

  var sTokenRewards = totalStableDebt.gt(0) ? calculateRewards(stableBorrows, poolReserve.sTokenIncentivesIndex, userReserve.sTokenincentivesUserIndex, rewardsInfo.incentivePrecision, rewardsInfo.rewardTokenDecimals, poolReserve.sIncentivesLastUpdateTimestamp, poolReserve.sEmissionPerSecond, totalStableDebt, currentTimestamp, rewardsInfo.emissionEndTimestamp) : '0';

  var _getEthAndUsdBalance6 = getEthAndUsdBalance(sTokenRewards, rewardsInfo.rewardTokenPriceEth, rewardsInfo.rewardTokenDecimals, usdPriceEth),
      sTokenRewardsETH = _getEthAndUsdBalance6[0],
      sTokenRewardsUSD = _getEthAndUsdBalance6[1];

  return _extends({}, userReserve, {
    underlyingBalance: underlyingBalance,
    underlyingBalanceETH: underlyingBalanceETH,
    underlyingBalanceUSD: underlyingBalanceUSD,
    variableBorrows: variableBorrows,
    variableBorrowsETH: variableBorrowsETH,
    variableBorrowsUSD: variableBorrowsUSD,
    stableBorrows: stableBorrows,
    stableBorrowsETH: stableBorrowsETH,
    stableBorrowsUSD: stableBorrowsUSD,
    totalBorrows: valueToZDBigNumber(variableBorrows).plus(stableBorrows).toString(),
    totalBorrowsETH: valueToZDBigNumber(variableBorrowsETH).plus(stableBorrowsETH).toString(),
    totalBorrowsUSD: valueToZDBigNumber(variableBorrowsUSD).plus(stableBorrowsUSD).toString(),
    aTokenRewards: aTokenRewards,
    aTokenRewardsETH: aTokenRewardsETH,
    aTokenRewardsUSD: aTokenRewardsUSD,
    vTokenRewards: vTokenRewards,
    vTokenRewardsETH: vTokenRewardsETH,
    vTokenRewardsUSD: vTokenRewardsUSD,
    sTokenRewards: sTokenRewards,
    sTokenRewardsETH: sTokenRewardsETH,
    sTokenRewardsUSD: sTokenRewardsUSD,
    totalRewards: valueToZDBigNumber(aTokenRewards).plus(vTokenRewards).plus(sTokenRewards).toString(),
    totalRewardsETH: valueToZDBigNumber(aTokenRewardsETH).plus(vTokenRewardsETH).plus(sTokenRewardsETH).toString(),
    totalRewardsUSD: valueToZDBigNumber(aTokenRewardsUSD).plus(vTokenRewardsUSD).plus(sTokenRewardsUSD).toString()
  });
}
function computeRawUserSummaryData$1(poolReservesData, rawUserReserves, userId, usdPriceEth, currentTimestamp, rewardsInfo) {
  var totalLiquidityETH = valueToZDBigNumber('0');
  var totalCollateralETH = valueToZDBigNumber('0');
  var totalBorrowsETH = valueToZDBigNumber('0');
  var currentLtv = valueToBigNumber('0');
  var currentLiquidationThreshold = valueToBigNumber('0');
  var totalRewards = valueToBigNumber('0');
  var totalRewardsETH = valueToBigNumber('0');
  var totalRewardsUSD = valueToBigNumber('0');
  var userReservesData = rawUserReserves.map(function (userReserve) {
    var poolReserve = poolReservesData.find(function (reserve) {
      return reserve.id === userReserve.reserve.id;
    });

    if (!poolReserve) {
      throw new Error('Reserve is not registered on platform, please contact support');
    }

    var computedUserReserve = computeUserReserveData$1(poolReserve, userReserve, usdPriceEth, currentTimestamp, rewardsInfo);
    totalRewards = totalRewards.plus(computedUserReserve.totalRewards);
    totalRewardsETH = totalRewardsETH.plus(computedUserReserve.totalRewardsETH);
    totalRewardsUSD = totalRewardsUSD.plus(computedUserReserve.totalRewardsUSD);
    totalLiquidityETH = totalLiquidityETH.plus(computedUserReserve.underlyingBalanceETH);
    totalBorrowsETH = totalBorrowsETH.plus(computedUserReserve.variableBorrowsETH).plus(computedUserReserve.stableBorrowsETH); // asset enabled as collateral

    if (poolReserve.usageAsCollateralEnabled && userReserve.usageAsCollateralEnabledOnUser) {
      totalCollateralETH = totalCollateralETH.plus(computedUserReserve.underlyingBalanceETH);
      currentLtv = currentLtv.plus(valueToBigNumber(computedUserReserve.underlyingBalanceETH).multipliedBy(poolReserve.baseLTVasCollateral));
      currentLiquidationThreshold = currentLiquidationThreshold.plus(valueToBigNumber(computedUserReserve.underlyingBalanceETH).multipliedBy(poolReserve.reserveLiquidationThreshold));
    }

    return computedUserReserve;
  }).sort(function (a, b) {
    return a.reserve.symbol > b.reserve.symbol ? 1 : a.reserve.symbol < b.reserve.symbol ? -1 : 0;
  });

  if (currentLtv.gt(0)) {
    currentLtv = currentLtv.div(totalCollateralETH).decimalPlaces(0, BigNumber__default.ROUND_DOWN);
  }

  if (currentLiquidationThreshold.gt(0)) {
    currentLiquidationThreshold = currentLiquidationThreshold.div(totalCollateralETH).decimalPlaces(0, BigNumber__default.ROUND_DOWN);
  }

  var healthFactor = calculateHealthFactorFromBalances(totalCollateralETH, totalBorrowsETH, currentLiquidationThreshold);
  var totalCollateralUSD = totalCollateralETH.multipliedBy(pow10(USD_DECIMALS)).dividedBy(usdPriceEth).toString();
  var totalLiquidityUSD = totalLiquidityETH.multipliedBy(pow10(USD_DECIMALS)).dividedBy(usdPriceEth).toString();
  var totalBorrowsUSD = totalBorrowsETH.multipliedBy(pow10(USD_DECIMALS)).dividedBy(usdPriceEth).toString();
  var availableBorrowsETH = calculateAvailableBorrowsETH(totalCollateralETH, totalBorrowsETH, currentLtv);
  return {
    totalLiquidityUSD: totalLiquidityUSD,
    totalCollateralUSD: totalCollateralUSD,
    totalBorrowsUSD: totalBorrowsUSD,
    totalRewards: totalRewards.toString(),
    totalRewardsETH: totalRewardsETH.toString(),
    totalRewardsUSD: totalRewardsUSD.toString(),
    id: userId,
    totalLiquidityETH: totalLiquidityETH.toString(),
    totalCollateralETH: totalCollateralETH.toString(),
    totalBorrowsETH: totalBorrowsETH.toString(),
    availableBorrowsETH: availableBorrowsETH.toString(),
    currentLoanToValue: currentLtv.toString(),
    currentLiquidationThreshold: currentLiquidationThreshold.toString(),
    healthFactor: healthFactor.toString(),
    reservesData: userReservesData
  };
}
function formatUserSummaryData$1(poolReservesData, rawUserReserves, userId, usdPriceEth, currentTimestamp, rewardsInfo) {
  var userData = computeRawUserSummaryData$1(poolReservesData, rawUserReserves, userId, usdPriceEth, currentTimestamp, rewardsInfo);
  var userReservesData = userData.reservesData.map(function (_ref) {
    var reserve = _ref.reserve,
        userReserve = _objectWithoutPropertiesLoose(_ref, ["reserve"]);

    var reserveDecimals = reserve.decimals;
    return _extends({}, userReserve, {
      reserve: _extends({}, reserve, {
        reserveLiquidationBonus: normalize(valueToBigNumber(reserve.reserveLiquidationBonus).minus(pow10(LTV_PRECISION)), 4),
        liquidityRate: normalize(reserve.liquidityRate, RAY_DECIMALS)
      }),
      scaledATokenBalance: normalize(userReserve.scaledATokenBalance, reserveDecimals),
      stableBorrowRate: normalize(userReserve.stableBorrowRate, RAY_DECIMALS),
      variableBorrowIndex: normalize(userReserve.variableBorrowIndex, RAY_DECIMALS),
      underlyingBalance: normalize(userReserve.underlyingBalance, reserveDecimals),
      underlyingBalanceETH: normalize(userReserve.underlyingBalanceETH, ETH_DECIMALS),
      underlyingBalanceUSD: normalize(userReserve.underlyingBalanceUSD, USD_DECIMALS),
      stableBorrows: normalize(userReserve.stableBorrows, reserveDecimals),
      stableBorrowsETH: normalize(userReserve.stableBorrowsETH, ETH_DECIMALS),
      stableBorrowsUSD: normalize(userReserve.stableBorrowsUSD, USD_DECIMALS),
      variableBorrows: normalize(userReserve.variableBorrows, reserveDecimals),
      variableBorrowsETH: normalize(userReserve.variableBorrowsETH, ETH_DECIMALS),
      variableBorrowsUSD: normalize(userReserve.variableBorrowsUSD, USD_DECIMALS),
      totalBorrows: normalize(userReserve.totalBorrows, reserveDecimals),
      totalBorrowsETH: normalize(userReserve.totalBorrowsETH, ETH_DECIMALS),
      totalBorrowsUSD: normalize(userReserve.totalBorrowsUSD, USD_DECIMALS)
    });
  });
  return {
    id: userData.id,
    reservesData: userReservesData,
    totalLiquidityETH: normalize(userData.totalLiquidityETH, ETH_DECIMALS),
    totalLiquidityUSD: normalize(userData.totalLiquidityUSD, USD_DECIMALS),
    totalCollateralETH: normalize(userData.totalCollateralETH, ETH_DECIMALS),
    totalCollateralUSD: normalize(userData.totalCollateralUSD, USD_DECIMALS),
    totalBorrowsETH: normalize(userData.totalBorrowsETH, ETH_DECIMALS),
    totalBorrowsUSD: normalize(userData.totalBorrowsUSD, USD_DECIMALS),
    availableBorrowsETH: normalize(userData.availableBorrowsETH, ETH_DECIMALS),
    currentLoanToValue: normalize(userData.currentLoanToValue, 4),
    currentLiquidationThreshold: normalize(userData.currentLiquidationThreshold, 4),
    healthFactor: userData.healthFactor,
    totalRewards: userData.totalRewards,
    totalRewardsETH: userData.totalRewardsETH,
    totalRewardsUSD: userData.totalRewardsUSD
  };
}
/**
 * Calculates the formatted debt accrued to a given point in time.
 * @param reserve
 * @param currentTimestamp unix timestamp which must be higher than reserve.lastUpdateTimestamp
 */

function calculateReserveDebt(reserve, currentTimestamp) {
  var totalVariableDebt = normalize(rayMul(rayMul(reserve.totalScaledVariableDebt, reserve.variableBorrowIndex), calculateCompoundedInterest(reserve.variableBorrowRate, currentTimestamp, reserve.lastUpdateTimestamp)), reserve.decimals);
  var totalStableDebt = normalize(rayMul(reserve.totalPrincipalStableDebt, calculateCompoundedInterest(reserve.averageStableRate, currentTimestamp, reserve.stableDebtLastUpdateTimestamp)), reserve.decimals);
  return {
    totalVariableDebt: totalVariableDebt,
    totalStableDebt: totalStableDebt
  };
}
function formatReserves$1(reserves, currentTimestamp, reserveIndexes30DaysAgo, rewardTokenPriceEth, emissionEndTimestamp) {
  if (rewardTokenPriceEth === void 0) {
    rewardTokenPriceEth = '0';
  }

  return reserves.map(function (reserve) {
    var _reserveIndexes30Days, _reserveIndexes30Days2;

    var reserve30DaysAgo = reserveIndexes30DaysAgo == null ? void 0 : (_reserveIndexes30Days = reserveIndexes30DaysAgo.find(function (res) {
      return res.id === reserve.id;
    })) == null ? void 0 : (_reserveIndexes30Days2 = _reserveIndexes30Days.paramsHistory) == null ? void 0 : _reserveIndexes30Days2[0];
    var availableLiquidity = normalize(reserve.availableLiquidity, reserve.decimals);

    var _calculateReserveDebt = calculateReserveDebt(reserve, currentTimestamp || reserve.lastUpdateTimestamp),
        totalVariableDebt = _calculateReserveDebt.totalVariableDebt,
        totalStableDebt = _calculateReserveDebt.totalStableDebt;

    var totalDebt = valueToBigNumber(totalStableDebt).plus(totalVariableDebt);
    var totalLiquidity = totalDebt.plus(availableLiquidity).toString();
    var utilizationRate = totalLiquidity !== '0' ? totalDebt.dividedBy(totalLiquidity).toString() : '0';
    var hasEmission = emissionEndTimestamp && emissionEndTimestamp > (currentTimestamp || Math.floor(Date.now() / 1000));
    var aIncentivesAPY = hasEmission && totalLiquidity !== '0' ? calculateIncentivesAPY(reserve.aEmissionPerSecond, rewardTokenPriceEth, totalLiquidity, reserve.price.priceInEth) : '0';
    var vIncentivesAPY = hasEmission && totalVariableDebt !== '0' ? calculateIncentivesAPY(reserve.vEmissionPerSecond, rewardTokenPriceEth, totalVariableDebt, reserve.price.priceInEth) : '0';
    var sIncentivesAPY = hasEmission && totalStableDebt !== '0' ? calculateIncentivesAPY(reserve.sEmissionPerSecond, rewardTokenPriceEth, totalStableDebt, reserve.price.priceInEth) : '0';
    return _extends({}, reserve, {
      totalVariableDebt: totalVariableDebt,
      totalStableDebt: totalStableDebt,
      totalLiquidity: totalLiquidity,
      availableLiquidity: availableLiquidity,
      utilizationRate: utilizationRate,
      aIncentivesAPY: aIncentivesAPY,
      vIncentivesAPY: vIncentivesAPY,
      sIncentivesAPY: sIncentivesAPY,
      totalDebt: totalDebt.toString(),
      price: _extends({}, reserve.price, {
        priceInEth: normalize(reserve.price.priceInEth, ETH_DECIMALS)
      }),
      baseLTVasCollateral: normalize(reserve.baseLTVasCollateral, LTV_PRECISION),
      reserveFactor: normalize(reserve.reserveFactor, LTV_PRECISION),
      variableBorrowRate: normalize(reserve.variableBorrowRate, RAY_DECIMALS),
      avg30DaysVariableBorrowRate: reserve30DaysAgo ? calculateAverageRate(reserve30DaysAgo.variableBorrowIndex, reserve.variableBorrowIndex, reserve30DaysAgo.timestamp, reserve.lastUpdateTimestamp) : undefined,
      avg30DaysLiquidityRate: reserve30DaysAgo ? calculateAverageRate(reserve30DaysAgo.liquidityIndex, reserve.liquidityIndex, reserve30DaysAgo.timestamp, reserve.lastUpdateTimestamp) : undefined,
      stableBorrowRate: normalize(reserve.stableBorrowRate, RAY_DECIMALS),
      liquidityRate: normalize(reserve.liquidityRate, RAY_DECIMALS),
      liquidityIndex: normalize(reserve.liquidityIndex, RAY_DECIMALS),
      reserveLiquidationThreshold: normalize(reserve.reserveLiquidationThreshold, 4),
      reserveLiquidationBonus: normalize(valueToBigNumber(reserve.reserveLiquidationBonus).minus(Math.pow(10, LTV_PRECISION)), 4),
      totalScaledVariableDebt: normalize(reserve.totalScaledVariableDebt, reserve.decimals),
      totalPrincipalStableDebt: normalize(reserve.totalPrincipalStableDebt, reserve.decimals),
      variableBorrowIndex: normalize(reserve.variableBorrowIndex, RAY_DECIMALS)
    });
  });
}
/**
 * Calculates the debt accrued to a given point in time.
 * @param reserve
 * @param currentTimestamp unix timestamp which must be higher than reserve.lastUpdateTimestamp
 */

function calculateReserveDebtSuppliesRaw(reserve, currentTimestamp) {
  var totalVariableDebt = rayMul(rayMul(reserve.totalScaledVariableDebt, reserve.variableBorrowIndex), calculateCompoundedInterest(reserve.variableBorrowRate, currentTimestamp, reserve.lastUpdateTimestamp));
  var totalStableDebt = rayMul(reserve.totalPrincipalStableDebt, calculateCompoundedInterest(reserve.averageStableRate, currentTimestamp, reserve.stableDebtLastUpdateTimestamp));
  return {
    totalVariableDebt: totalVariableDebt,
    totalStableDebt: totalStableDebt
  };
}
function calculateSupplies(reserve, currentTimestamp) {
  var _calculateReserveDebt2 = calculateReserveDebtSuppliesRaw(reserve, currentTimestamp),
      totalVariableDebt = _calculateReserveDebt2.totalVariableDebt,
      totalStableDebt = _calculateReserveDebt2.totalStableDebt;

  var totalDebt = totalVariableDebt.plus(totalStableDebt);
  var totalLiquidity = totalDebt.plus(reserve.availableLiquidity);
  return {
    totalVariableDebt: totalVariableDebt,
    totalStableDebt: totalStableDebt,
    totalLiquidity: totalLiquidity
  };
}
function calculateIncentivesAPY(emissionPerSecond, rewardTokenPriceInEth, tokenTotalSupplyNormalized, tokenPriceInEth) {
  var emissionPerSecondNormalized = normalizeBN(emissionPerSecond, ETH_DECIMALS).multipliedBy(rewardTokenPriceInEth);
  var emissionPerYear = emissionPerSecondNormalized.multipliedBy(SECONDS_PER_YEAR);
  var totalSupplyNormalized = valueToBigNumber(tokenTotalSupplyNormalized).multipliedBy(tokenPriceInEth);
  return emissionPerYear.dividedBy(totalSupplyNormalized).toString(10);
}
function calculateRewards(principalUserBalance, reserveIndex, userIndex, precision, rewardTokenDecimals, reserveIndexTimestamp, emissionPerSecond, totalSupply, currentTimestamp, emissionEndTimestamp) {
  var actualCurrentTimestamp = currentTimestamp > emissionEndTimestamp ? emissionEndTimestamp : currentTimestamp;
  var timeDelta = actualCurrentTimestamp - reserveIndexTimestamp;
  var currentReserveIndex;

  if (reserveIndexTimestamp == +currentTimestamp || reserveIndexTimestamp >= emissionEndTimestamp) {
    currentReserveIndex = valueToZDBigNumber(reserveIndex);
  } else {
    currentReserveIndex = valueToZDBigNumber(emissionPerSecond).multipliedBy(timeDelta).multipliedBy(pow10(precision)).dividedBy(totalSupply).plus(reserveIndex);
  }

  var reward = valueToZDBigNumber(principalUserBalance).multipliedBy(currentReserveIndex.minus(userIndex)).dividedBy(pow10(precision));
  return normalize(reward, rewardTokenDecimals);
}



var index$1 = {
  __proto__: null,
  getEthAndUsdBalance: getEthAndUsdBalance,
  computeUserReserveData: computeUserReserveData$1,
  computeRawUserSummaryData: computeRawUserSummaryData$1,
  formatUserSummaryData: formatUserSummaryData$1,
  calculateReserveDebt: calculateReserveDebt,
  formatReserves: formatReserves$1,
  calculateReserveDebtSuppliesRaw: calculateReserveDebtSuppliesRaw,
  calculateSupplies: calculateSupplies,
  calculateIncentivesAPY: calculateIncentivesAPY,
  calculateRewards: calculateRewards
};

/** InterestRate options */

(function (InterestRate) {
  InterestRate["None"] = "None";
  InterestRate["Stable"] = "Stable";
  InterestRate["Variable"] = "Variable";
})(exports.InterestRate || (exports.InterestRate = {}));

(function (Market) {
  Market["Proto"] = "proto";
  Market["AMM"] = "amm";
})(exports.Market || (exports.Market = {}));

(function (Network) {
  Network["mainnet"] = "mainnet";
  Network["ropsten"] = "ropsten";
  Network["kovan"] = "kovan";
  Network["polygon"] = "polygon";
  Network["fork"] = "fork";
  Network["mumbai"] = "mumbai";
  Network["polygon_fork"] = "polygon_fork";
})(exports.Network || (exports.Network = {}));

(function (ChainId) {
  ChainId[ChainId["mainnet"] = 1] = "mainnet";
  ChainId[ChainId["ropsten"] = 3] = "ropsten";
  ChainId[ChainId["kovan"] = 42] = "kovan";
  ChainId[ChainId["polygon"] = 137] = "polygon";
  ChainId[ChainId["fork"] = 1337] = "fork";
  ChainId[ChainId["mumbai"] = 80001] = "mumbai";
  ChainId[ChainId["polygon_fork"] = 1338] = "polygon_fork";
})(exports.ChainId || (exports.ChainId = {}));

(function (eEthereumTxType) {
  eEthereumTxType["ERC20_APPROVAL"] = "ERC20_APPROVAL";
  eEthereumTxType["DLP_ACTION"] = "DLP_ACTION";
  eEthereumTxType["GOVERNANCE_ACTION"] = "GOVERNANCE_ACTION";
  eEthereumTxType["GOV_DELEGATION_ACTION"] = "GOV_DELEGATION_ACTION";
  eEthereumTxType["STAKE_ACTION"] = "STAKE_ACTION";
  eEthereumTxType["MIGRATION_LEND_AAVE"] = "MIGRATION_LEND_AAVE";
  eEthereumTxType["FAUCET_MINT"] = "FAUCET_MINT";
  eEthereumTxType["REWARD_ACTION"] = "REWARD_ACTION";
})(exports.eEthereumTxType || (exports.eEthereumTxType = {}));

(function (ProtocolAction) {
  ProtocolAction["default"] = "default";
  ProtocolAction["withdraw"] = "withdraw";
  ProtocolAction["deposit"] = "deposit";
  ProtocolAction["liquidationCall"] = "liquidationCall";
  ProtocolAction["liquidationFlash"] = "liquidationFlash";
  ProtocolAction["repay"] = "repay";
  ProtocolAction["swapCollateral"] = "swapCollateral";
  ProtocolAction["repayCollateral"] = "repayCollateral";
  ProtocolAction["withdrawETH"] = "withdrawETH";
  ProtocolAction["borrowETH"] = "borrwoETH";
})(exports.ProtocolAction || (exports.ProtocolAction = {}));

(function (GovernanceVote) {
  GovernanceVote[GovernanceVote["Abstain"] = 0] = "Abstain";
  GovernanceVote[GovernanceVote["Yes"] = 1] = "Yes";
  GovernanceVote[GovernanceVote["No"] = 2] = "No";
})(exports.GovernanceVote || (exports.GovernanceVote = {}));

(function (Stake) {
  Stake["Aave"] = "Aave";
  Stake["Balancer"] = "Balancer";
})(exports.Stake || (exports.Stake = {}));

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var runtime_1 = createCommonjsModule(function (module) {
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined$1; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined$1) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined$1;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined$1;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined$1;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined$1, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined$1;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined$1;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined$1;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined$1;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined$1;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
   module.exports 
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}
});

var _commonContractAddres, _Market$Proto, _Market$AMM, _distinctContractAddr, _aaveGovernanceV2Addr;
var commonContractAddressBetweenMarketsV2 = (_commonContractAddres = {}, _commonContractAddres[exports.Network.kovan] = {
  SYNTHETIX_PROXY_ADDRESS: '',
  GOVERNANCE_PROTO_CONTRACT: '0x8134929c3dcb1b8b82f27f53424b959fb82182f2',
  LEND_TO_AAVE_MIGRATOR: '0x8cC8965FEf45a448bdbe3C749683b280eF2E17Ea',
  WETH_GATEWAY: '0xA61ca04DF33B72b235a8A28CfB535bb7A5271B70',
  FAUCET: '0x600103d518cC5E8f3319D532eB4e5C268D32e604',
  SWAP_COLLATERAL_ADAPTER: '0xC18451d36aA370fDACe8d45839bF975F48f7AEa1',
  REPAY_WITH_COLLATERAL_ADAPTER: '0xf86Be05f535EC2d217E4c6116B3fa147ee5C05A1',
  FLASHLIQUIDATION: '0x9D50F0b23b1805773f607F0B4678d724322B7AC2',
  INCENTIVES_CONTROLLER: '',
  INCENTIVES_CONTROLLER_REWARD_TOKEN: ''
}, _commonContractAddres[exports.Network.ropsten] = {
  SYNTHETIX_PROXY_ADDRESS: '',
  GOVERNANCE_PROTO_CONTRACT: '',
  LEND_TO_AAVE_MIGRATOR: '',
  WETH_GATEWAY: '',
  FAUCET: '0xcCB8f5183065AF6C40d3A13ae669FB8F92A11C05',
  SWAP_COLLATERAL_ADAPTER: '',
  REPAY_WITH_COLLATERAL_ADAPTER: '',
  FLASHLIQUIDATION: '',
  INCENTIVES_CONTROLLER: '',
  INCENTIVES_CONTROLLER_REWARD_TOKEN: ''
}, _commonContractAddres[exports.Network.mainnet] = {
  SYNTHETIX_PROXY_ADDRESS: '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f',
  GOVERNANCE_PROTO_CONTRACT: '0x8a2efd9a790199f4c94c6effe210fce0b4724f52',
  LEND_TO_AAVE_MIGRATOR: '0x317625234562b1526ea2fac4030ea499c5291de4',
  WETH_GATEWAY: '0xcc9a0B7c43DC2a5F023Bb9b738E45B0Ef6B06E04',
  FAUCET: '',
  SWAP_COLLATERAL_ADAPTER: '0x135896DE8421be2ec868E0b811006171D9df802A',
  REPAY_WITH_COLLATERAL_ADAPTER: '0x498c5431eb517101582988fbb36431ddaac8f4b1',
  FLASHLIQUIDATION: '0xE377fB98512D7b04827e56BC84e1838804a8019D',
  INCENTIVES_CONTROLLER: '0xd784927Ff2f95ba542BfC824c8a8a98F3495f6b5',
  INCENTIVES_CONTROLLER_REWARD_TOKEN: '0x4da27a545c0c5b758a6ba100e3a049001de870f5'
}, _commonContractAddres[exports.Network.polygon] = {
  SYNTHETIX_PROXY_ADDRESS: '',
  GOVERNANCE_PROTO_CONTRACT: '',
  LEND_TO_AAVE_MIGRATOR: '',
  WETH_GATEWAY: '0xbEadf48d62aCC944a06EEaE0A9054A90E5A7dc97',
  FAUCET: '',
  SWAP_COLLATERAL_ADAPTER: '0x35784a624D4FfBC3594f4d16fA3801FeF063241c',
  REPAY_WITH_COLLATERAL_ADAPTER: '',
  FLASHLIQUIDATION: '',
  INCENTIVES_CONTROLLER: '0x357d51124f59836ded84c8a1730d72b749d8bc23',
  INCENTIVES_CONTROLLER_REWARD_TOKEN: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'
}, _commonContractAddres[exports.Network.mumbai] = {
  SYNTHETIX_PROXY_ADDRESS: '',
  GOVERNANCE_PROTO_CONTRACT: '',
  LEND_TO_AAVE_MIGRATOR: '',
  WETH_GATEWAY: '0xee9eE614Ad26963bEc1Bec0D2c92879ae1F209fA',
  FAUCET: '0x0b3C23243106A69449e79C14c58BB49E358f9B10',
  SWAP_COLLATERAL_ADAPTER: '',
  REPAY_WITH_COLLATERAL_ADAPTER: '',
  FLASHLIQUIDATION: '',
  INCENTIVES_CONTROLLER: '0xd41aE58e803Edf4304334acCE4DC4Ec34a63C644',
  INCENTIVES_CONTROLLER_REWARD_TOKEN: '0x9c3c9283d3e44854697cd22d3faa240cfb032889'
}, _commonContractAddres);
var distinctContractAddressBetweenMarketsV2 = (_distinctContractAddr = {}, _distinctContractAddr[exports.Market.Proto] = (_Market$Proto = {}, _Market$Proto[exports.Network.kovan] = {
  LENDINGPOOL_ADDRESS: '0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe'
}, _Market$Proto[exports.Network.ropsten] = {
  LENDINGPOOL_ADDRESS: ''
}, _Market$Proto[exports.Network.mainnet] = {
  LENDINGPOOL_ADDRESS: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9'
}, _Market$Proto[exports.Network.polygon] = {
  LENDINGPOOL_ADDRESS: '0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf'
}, _Market$Proto[exports.Network.mumbai] = {
  LENDINGPOOL_ADDRESS: '0x9198F13B08E299d85E096929fA9781A1E3d5d827'
}, _Market$Proto), _distinctContractAddr[exports.Market.AMM] = (_Market$AMM = {}, _Market$AMM[exports.Network.kovan] = {
  LENDINGPOOL_ADDRESS: '0x762E2a3BBe729240ea44D31D5a81EAB44d34ef01'
}, _Market$AMM[exports.Network.ropsten] = {
  LENDINGPOOL_ADDRESS: ''
}, _Market$AMM[exports.Network.mainnet] = {
  LENDINGPOOL_ADDRESS: '0x7937d4799803fbbe595ed57278bc4ca21f3bffcb'
}, _Market$AMM), _distinctContractAddr);
var aaveGovernanceV2Addresses = (_aaveGovernanceV2Addr = {}, _aaveGovernanceV2Addr[exports.Network.kovan] = {
  AAVE_GOVERNANCE_V2: '0xc2eBaB3Bac8f2f5028f5C7317027A41EBFCa31D2',
  AAVE_GOVERNANCE_V2_EXECUTOR_SHORT: '0x462eD5dc919BE6C96639D5f31ab919EBA8F31831',
  AAVE_GOVERNANCE_V2_EXECUTOR_LONG: '0x7e5195b0A6a60b371Ba3276032CF6958eADFA652',
  AAVE_GOVERNANCE_V2_HELPER: '0xffd5BEb5712952FC9a9DDC7499487422B29Fdda6'
}, _aaveGovernanceV2Addr[exports.Network.ropsten] = {
  AAVE_GOVERNANCE_V2: '',
  AAVE_GOVERNANCE_V2_EXECUTOR_SHORT: '',
  AAVE_GOVERNANCE_V2_EXECUTOR_LONG: '',
  AAVE_GOVERNANCE_V2_HELPER: ''
}, _aaveGovernanceV2Addr[exports.Network.mainnet] = {
  AAVE_GOVERNANCE_V2: '0xEC568fffba86c094cf06b22134B23074DFE2252c',
  AAVE_GOVERNANCE_V2_EXECUTOR_SHORT: '0x61910EcD7e8e942136CE7Fe7943f956cea1CC2f7',
  AAVE_GOVERNANCE_V2_EXECUTOR_LONG: '0xEE56e2B3D491590B5b31738cC34d5232F378a8D5',
  AAVE_GOVERNANCE_V2_HELPER: '0x16ff7583ea21055bf5f929ec4b896d997ff35847'
}, _aaveGovernanceV2Addr[exports.Network.polygon] = {
  AAVE_GOVERNANCE_V2: '',
  AAVE_GOVERNANCE_V2_EXECUTOR_SHORT: '',
  AAVE_GOVERNANCE_V2_EXECUTOR_LONG: '',
  AAVE_GOVERNANCE_V2_HELPER: ''
}, _aaveGovernanceV2Addr[exports.Network.mumbai] = {
  AAVE_GOVERNANCE_V2: '',
  AAVE_GOVERNANCE_V2_EXECUTOR_SHORT: '',
  AAVE_GOVERNANCE_V2_EXECUTOR_LONG: '',
  AAVE_GOVERNANCE_V2_HELPER: ''
}, _aaveGovernanceV2Addr);

var _gasLimitRecommendati, _Stake$Aave, _Stake$Balancer, _distinctStakingAddre, _staking, _lendingPool;
var DEFAULT_NULL_VALUE_ON_TX =
/*#__PURE__*/
ethers.BigNumber.from(0).toHexString();
var DEFAULT_APPROVE_AMOUNT =
/*#__PURE__*/
ethers.constants.MaxUint256.toString();
var MAX_UINT_AMOUNT = '115792089237316195423570985008687907853269984665640564039457584007913129639935';
var SUPER_BIG_ALLOWANCE_NUMBER = '11579208923731619542357098500868790785326998466564056403945758400791';
var API_ETH_MOCK_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
var uniswapEthAmount = '0.1';
var SURPLUS = '0.05';
var gasLimitRecommendations = (_gasLimitRecommendati = {}, _gasLimitRecommendati[exports.ProtocolAction["default"]] = {
  limit: '210000',
  recommended: '210000'
}, _gasLimitRecommendati[exports.ProtocolAction.deposit] = {
  limit: '300000',
  recommended: '300000'
}, _gasLimitRecommendati[exports.ProtocolAction.withdraw] = {
  limit: '230000',
  recommended: '300000'
}, _gasLimitRecommendati[exports.ProtocolAction.liquidationCall] = {
  limit: '700000',
  recommended: '700000'
}, _gasLimitRecommendati[exports.ProtocolAction.liquidationFlash] = {
  limit: '995000',
  recommended: '995000'
}, _gasLimitRecommendati[exports.ProtocolAction.repay] = {
  limit: '300000',
  recommended: '300000'
}, _gasLimitRecommendati[exports.ProtocolAction.borrowETH] = {
  limit: '450000',
  recommended: '450000'
}, _gasLimitRecommendati[exports.ProtocolAction.withdrawETH] = {
  limit: '640000',
  recommended: '640000'
}, _gasLimitRecommendati[exports.ProtocolAction.swapCollateral] = {
  limit: '700000',
  recommended: '700000'
}, _gasLimitRecommendati[exports.ProtocolAction.repayCollateral] = {
  limit: '700000',
  recommended: '700000'
}, _gasLimitRecommendati);
var distinctStakingAddressesBetweenTokens = (_distinctStakingAddre = {}, _distinctStakingAddre[exports.Stake.Aave] = (_Stake$Aave = {}, _Stake$Aave[exports.Network.kovan] = {
  canUsePermit: true,
  TOKEN_STAKING_ADDRESS: '0xf2fbf9A6710AfDa1c4AaB2E922DE9D69E0C97fd2',
  STAKING_REWARD_TOKEN_ADDRESS: '0xb597cd8d3217ea6477232f9217fa70837ff667af',
  STAKING_HELPER_ADDRESS: '0xf267aCc8BF1D8b41c89b6dc1a0aD8439dfbc890c'
}, _Stake$Aave[exports.Network.ropsten] = {
  canUsePermit: false,
  TOKEN_STAKING_ADDRESS: '',
  STAKING_REWARD_TOKEN_ADDRESS: '',
  STAKING_HELPER_ADDRESS: ''
}, _Stake$Aave[exports.Network.mainnet] = {
  canUsePermit: true,
  TOKEN_STAKING_ADDRESS: '0x4da27a545c0c5b758a6ba100e3a049001de870f5',
  STAKING_REWARD_TOKEN_ADDRESS: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
  STAKING_HELPER_ADDRESS: '0xce0424653fb2fd48ed1b621bdbd60db16b2e388a'
}, _Stake$Aave[exports.Network.polygon] = {
  canUsePermit: false,
  TOKEN_STAKING_ADDRESS: '',
  STAKING_REWARD_TOKEN_ADDRESS: '',
  STAKING_HELPER_ADDRESS: ''
}, _Stake$Aave[exports.Network.mumbai] = {
  canUsePermit: false,
  TOKEN_STAKING_ADDRESS: '',
  STAKING_REWARD_TOKEN_ADDRESS: '',
  STAKING_HELPER_ADDRESS: ''
}, _Stake$Aave), _distinctStakingAddre[exports.Stake.Balancer] = (_Stake$Balancer = {}, _Stake$Balancer[exports.Network.kovan] = {
  canUsePermit: false,
  TOKEN_STAKING_ADDRESS: '0x31ce45Ab6E26C72c47C52c27498D460099545ef2',
  STAKING_REWARD_TOKEN_ADDRESS: '0xb597cd8d3217ea6477232f9217fa70837ff667af',
  STAKING_HELPER_ADDRESS: ''
}, _Stake$Balancer[exports.Network.ropsten] = {
  canUsePermit: false,
  TOKEN_STAKING_ADDRESS: '',
  STAKING_REWARD_TOKEN_ADDRESS: '',
  STAKING_HELPER_ADDRESS: ''
}, _Stake$Balancer[exports.Network.mainnet] = {
  canUsePermit: false,
  TOKEN_STAKING_ADDRESS: '0xa1116930326D21fB917d5A27F1E9943A9595fb47',
  STAKING_REWARD_TOKEN_ADDRESS: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
  STAKING_HELPER_ADDRESS: ''
}, _Stake$Balancer[exports.Network.polygon] = {
  canUsePermit: false,
  TOKEN_STAKING_ADDRESS: '',
  STAKING_REWARD_TOKEN_ADDRESS: '',
  STAKING_HELPER_ADDRESS: ''
}, _Stake$Balancer[exports.Network.mumbai] = {
  canUsePermit: false,
  TOKEN_STAKING_ADDRESS: '',
  STAKING_REWARD_TOKEN_ADDRESS: '',
  STAKING_HELPER_ADDRESS: ''
}, _Stake$Balancer), _distinctStakingAddre);
var enabledNetworksByService = {
  staking: (_staking = {}, _staking[exports.Stake.Balancer] = [exports.Network.kovan, exports.Network.mainnet], _staking[exports.Stake.Aave] = [exports.Network.kovan, exports.Network.mainnet], _staking),
  lendingPool: (_lendingPool = {}, _lendingPool[exports.Market.Proto] = [exports.Network.kovan, exports.Network.mainnet, exports.Network.polygon, exports.Network.mumbai], _lendingPool[exports.Market.AMM] = [exports.Network.kovan, exports.Network.mainnet], _lendingPool),
  governance: [exports.Network.kovan, exports.Network.mainnet],
  wethGateway: [exports.Network.kovan, exports.Network.mainnet, exports.Network.polygon, exports.Network.mumbai],
  faucet: [exports.Network.kovan, exports.Network.mumbai],
  liquiditySwapAdapter: [exports.Network.mainnet, exports.Network.polygon],
  repayWithCollateralAdapter: [exports.Network.kovan, exports.Network.mainnet],
  aaveGovernanceV2: [exports.Network.kovan, exports.Network.mainnet],
  ltaMigrator: [exports.Network.kovan, exports.Network.mainnet],
  incentivesController: [exports.Network.polygon, exports.Network.mumbai, exports.Network.mainnet]
};

/* Autogenerated file. Do not edit manually. */
var IAaveGovernanceV2__factory =
/*#__PURE__*/
function () {
  function IAaveGovernanceV2__factory() {}

  IAaveGovernanceV2__factory.connect = function connect(address, signerOrProvider) {
    return new ethers.Contract(address, _abi, signerOrProvider);
  };

  return IAaveGovernanceV2__factory;
}();
var _abi = [{
  anonymous: false,
  inputs: [{
    indexed: false,
    internalType: "address",
    name: "executor",
    type: "address"
  }],
  name: "ExecutorAuthorized",
  type: "event"
}, {
  anonymous: false,
  inputs: [{
    indexed: false,
    internalType: "address",
    name: "executor",
    type: "address"
  }],
  name: "ExecutorUnauthorized",
  type: "event"
}, {
  anonymous: false,
  inputs: [{
    indexed: true,
    internalType: "address",
    name: "newStrategy",
    type: "address"
  }, {
    indexed: true,
    internalType: "address",
    name: "initiatorChange",
    type: "address"
  }],
  name: "GovernanceStrategyChanged",
  type: "event"
}, {
  anonymous: false,
  inputs: [{
    indexed: false,
    internalType: "uint256",
    name: "id",
    type: "uint256"
  }],
  name: "ProposalCanceled",
  type: "event"
}, {
  anonymous: false,
  inputs: [{
    indexed: false,
    internalType: "uint256",
    name: "id",
    type: "uint256"
  }, {
    indexed: true,
    internalType: "address",
    name: "creator",
    type: "address"
  }, {
    indexed: true,
    internalType: "contract IExecutorWithTimelock",
    name: "executor",
    type: "address"
  }, {
    indexed: false,
    internalType: "address[]",
    name: "targets",
    type: "address[]"
  }, {
    indexed: false,
    internalType: "uint256[]",
    name: "values",
    type: "uint256[]"
  }, {
    indexed: false,
    internalType: "string[]",
    name: "signatures",
    type: "string[]"
  }, {
    indexed: false,
    internalType: "bytes[]",
    name: "calldatas",
    type: "bytes[]"
  }, {
    indexed: false,
    internalType: "bool[]",
    name: "withDelegatecalls",
    type: "bool[]"
  }, {
    indexed: false,
    internalType: "uint256",
    name: "startBlock",
    type: "uint256"
  }, {
    indexed: false,
    internalType: "uint256",
    name: "endBlock",
    type: "uint256"
  }, {
    indexed: false,
    internalType: "address",
    name: "strategy",
    type: "address"
  }, {
    indexed: false,
    internalType: "bytes32",
    name: "ipfsHash",
    type: "bytes32"
  }],
  name: "ProposalCreated",
  type: "event"
}, {
  anonymous: false,
  inputs: [{
    indexed: false,
    internalType: "uint256",
    name: "id",
    type: "uint256"
  }, {
    indexed: true,
    internalType: "address",
    name: "initiatorExecution",
    type: "address"
  }],
  name: "ProposalExecuted",
  type: "event"
}, {
  anonymous: false,
  inputs: [{
    indexed: false,
    internalType: "uint256",
    name: "id",
    type: "uint256"
  }, {
    indexed: false,
    internalType: "uint256",
    name: "executionTime",
    type: "uint256"
  }, {
    indexed: true,
    internalType: "address",
    name: "initiatorQueueing",
    type: "address"
  }],
  name: "ProposalQueued",
  type: "event"
}, {
  anonymous: false,
  inputs: [{
    indexed: false,
    internalType: "uint256",
    name: "id",
    type: "uint256"
  }, {
    indexed: true,
    internalType: "address",
    name: "voter",
    type: "address"
  }, {
    indexed: false,
    internalType: "bool",
    name: "support",
    type: "bool"
  }, {
    indexed: false,
    internalType: "uint256",
    name: "votingPower",
    type: "uint256"
  }],
  name: "VoteEmitted",
  type: "event"
}, {
  anonymous: false,
  inputs: [{
    indexed: false,
    internalType: "uint256",
    name: "newVotingDelay",
    type: "uint256"
  }, {
    indexed: true,
    internalType: "address",
    name: "initiatorChange",
    type: "address"
  }],
  name: "VotingDelayChanged",
  type: "event"
}, {
  inputs: [],
  name: "__abdicate",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}, {
  inputs: [{
    internalType: "address[]",
    name: "executors",
    type: "address[]"
  }],
  name: "authorizeExecutors",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}, {
  inputs: [{
    internalType: "uint256",
    name: "proposalId",
    type: "uint256"
  }],
  name: "cancel",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}, {
  inputs: [{
    internalType: "contract IExecutorWithTimelock",
    name: "executor",
    type: "address"
  }, {
    internalType: "address[]",
    name: "targets",
    type: "address[]"
  }, {
    internalType: "uint256[]",
    name: "values",
    type: "uint256[]"
  }, {
    internalType: "string[]",
    name: "signatures",
    type: "string[]"
  }, {
    internalType: "bytes[]",
    name: "calldatas",
    type: "bytes[]"
  }, {
    internalType: "bool[]",
    name: "withDelegatecalls",
    type: "bool[]"
  }, {
    internalType: "bytes32",
    name: "ipfsHash",
    type: "bytes32"
  }],
  name: "create",
  outputs: [{
    internalType: "uint256",
    name: "",
    type: "uint256"
  }],
  stateMutability: "nonpayable",
  type: "function"
}, {
  inputs: [{
    internalType: "uint256",
    name: "proposalId",
    type: "uint256"
  }],
  name: "execute",
  outputs: [],
  stateMutability: "payable",
  type: "function"
}, {
  inputs: [],
  name: "getGovernanceStrategy",
  outputs: [{
    internalType: "address",
    name: "",
    type: "address"
  }],
  stateMutability: "view",
  type: "function"
}, {
  inputs: [],
  name: "getGuardian",
  outputs: [{
    internalType: "address",
    name: "",
    type: "address"
  }],
  stateMutability: "view",
  type: "function"
}, {
  inputs: [{
    internalType: "uint256",
    name: "proposalId",
    type: "uint256"
  }],
  name: "getProposalById",
  outputs: [{
    components: [{
      internalType: "uint256",
      name: "id",
      type: "uint256"
    }, {
      internalType: "address",
      name: "creator",
      type: "address"
    }, {
      internalType: "contract IExecutorWithTimelock",
      name: "executor",
      type: "address"
    }, {
      internalType: "address[]",
      name: "targets",
      type: "address[]"
    }, {
      internalType: "uint256[]",
      name: "values",
      type: "uint256[]"
    }, {
      internalType: "string[]",
      name: "signatures",
      type: "string[]"
    }, {
      internalType: "bytes[]",
      name: "calldatas",
      type: "bytes[]"
    }, {
      internalType: "bool[]",
      name: "withDelegatecalls",
      type: "bool[]"
    }, {
      internalType: "uint256",
      name: "startBlock",
      type: "uint256"
    }, {
      internalType: "uint256",
      name: "endBlock",
      type: "uint256"
    }, {
      internalType: "uint256",
      name: "executionTime",
      type: "uint256"
    }, {
      internalType: "uint256",
      name: "forVotes",
      type: "uint256"
    }, {
      internalType: "uint256",
      name: "againstVotes",
      type: "uint256"
    }, {
      internalType: "bool",
      name: "executed",
      type: "bool"
    }, {
      internalType: "bool",
      name: "canceled",
      type: "bool"
    }, {
      internalType: "address",
      name: "strategy",
      type: "address"
    }, {
      internalType: "bytes32",
      name: "ipfsHash",
      type: "bytes32"
    }],
    internalType: "struct IAaveGovernanceV2.ProposalWithoutVotes",
    name: "",
    type: "tuple"
  }],
  stateMutability: "view",
  type: "function"
}, {
  inputs: [{
    internalType: "uint256",
    name: "proposalId",
    type: "uint256"
  }],
  name: "getProposalState",
  outputs: [{
    internalType: "enum IAaveGovernanceV2.ProposalState",
    name: "",
    type: "uint8"
  }],
  stateMutability: "view",
  type: "function"
}, {
  inputs: [],
  name: "getProposalsCount",
  outputs: [{
    internalType: "uint256",
    name: "",
    type: "uint256"
  }],
  stateMutability: "view",
  type: "function"
}, {
  inputs: [{
    internalType: "uint256",
    name: "proposalId",
    type: "uint256"
  }, {
    internalType: "address",
    name: "voter",
    type: "address"
  }],
  name: "getVoteOnProposal",
  outputs: [{
    components: [{
      internalType: "bool",
      name: "support",
      type: "bool"
    }, {
      internalType: "uint248",
      name: "votingPower",
      type: "uint248"
    }],
    internalType: "struct IAaveGovernanceV2.Vote",
    name: "",
    type: "tuple"
  }],
  stateMutability: "view",
  type: "function"
}, {
  inputs: [],
  name: "getVotingDelay",
  outputs: [{
    internalType: "uint256",
    name: "",
    type: "uint256"
  }],
  stateMutability: "view",
  type: "function"
}, {
  inputs: [{
    internalType: "address",
    name: "executor",
    type: "address"
  }],
  name: "isExecutorAuthorized",
  outputs: [{
    internalType: "bool",
    name: "",
    type: "bool"
  }],
  stateMutability: "view",
  type: "function"
}, {
  inputs: [{
    internalType: "uint256",
    name: "proposalId",
    type: "uint256"
  }],
  name: "queue",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}, {
  inputs: [{
    internalType: "address",
    name: "governanceStrategy",
    type: "address"
  }],
  name: "setGovernanceStrategy",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}, {
  inputs: [{
    internalType: "uint256",
    name: "votingDelay",
    type: "uint256"
  }],
  name: "setVotingDelay",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}, {
  inputs: [{
    internalType: "uint256",
    name: "proposalId",
    type: "uint256"
  }, {
    internalType: "bool",
    name: "support",
    type: "bool"
  }],
  name: "submitVote",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}, {
  inputs: [{
    internalType: "uint256",
    name: "proposalId",
    type: "uint256"
  }, {
    internalType: "bool",
    name: "support",
    type: "bool"
  }, {
    internalType: "uint8",
    name: "v",
    type: "uint8"
  }, {
    internalType: "bytes32",
    name: "r",
    type: "bytes32"
  }, {
    internalType: "bytes32",
    name: "s",
    type: "bytes32"
  }],
  name: "submitVoteBySignature",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}, {
  inputs: [{
    internalType: "address[]",
    name: "executors",
    type: "address[]"
  }],
  name: "unauthorizeExecutors",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}];

/* Autogenerated file. Do not edit manually. */
var IAaveIncentivesController__factory =
/*#__PURE__*/
function () {
  function IAaveIncentivesController__factory() {}

  IAaveIncentivesController__factory.connect = function connect(address, signerOrProvider) {
    return new ethers.Contract(address, _abi$1, signerOrProvider);
  };

  return IAaveIncentivesController__factory;
}();
var _abi$1 = [{
  inputs: [{
    internalType: "address[]",
    name: "assets",
    type: "address[]"
  }, {
    internalType: "uint256",
    name: "amount",
    type: "uint256"
  }, {
    internalType: "address",
    name: "to",
    type: "address"
  }],
  name: "claimRewards",
  outputs: [{
    internalType: "uint256",
    name: "",
    type: "uint256"
  }],
  stateMutability: "nonpayable",
  type: "function"
}];

/* Autogenerated file. Do not edit manually. */
var IAaveStakingHelper__factory =
/*#__PURE__*/
function () {
  function IAaveStakingHelper__factory() {}

  IAaveStakingHelper__factory.connect = function connect(address, signerOrProvider) {
    return new ethers.Contract(address, _abi$2, signerOrProvider);
  };

  return IAaveStakingHelper__factory;
}();
var _abi$2 = [{
  inputs: [{
    internalType: "address",
    name: "user",
    type: "address"
  }, {
    internalType: "uint256",
    name: "amount",
    type: "uint256"
  }, {
    internalType: "uint8",
    name: "v",
    type: "uint8"
  }, {
    internalType: "bytes32",
    name: "r",
    type: "bytes32"
  }, {
    internalType: "bytes32",
    name: "s",
    type: "bytes32"
  }],
  name: "stake",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}];

/* Autogenerated file. Do not edit manually. */
var IDebtTokenBase__factory =
/*#__PURE__*/
function () {
  function IDebtTokenBase__factory() {}

  IDebtTokenBase__factory.connect = function connect(address, signerOrProvider) {
    return new ethers.Contract(address, _abi$3, signerOrProvider);
  };

  return IDebtTokenBase__factory;
}();
var _abi$3 = [{
  inputs: [{
    internalType: "address",
    name: "delegatee",
    type: "address"
  }, {
    internalType: "uint256",
    name: "amount",
    type: "uint256"
  }],
  name: "approveDelegation",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}, {
  inputs: [{
    internalType: "address",
    name: "fromUser",
    type: "address"
  }, {
    internalType: "address",
    name: "toUser",
    type: "address"
  }],
  name: "borrowAllowance",
  outputs: [{
    internalType: "uint256",
    name: "",
    type: "uint256"
  }],
  stateMutability: "view",
  type: "function"
}];

/* Autogenerated file. Do not edit manually. */
var IERC20Detailed__factory =
/*#__PURE__*/
function () {
  function IERC20Detailed__factory() {}

  IERC20Detailed__factory.connect = function connect(address, signerOrProvider) {
    return new ethers.Contract(address, _abi$4, signerOrProvider);
  };

  return IERC20Detailed__factory;
}();
var _abi$4 = [{
  inputs: [{
    internalType: "address",
    name: "owner",
    type: "address"
  }, {
    internalType: "address",
    name: "spender",
    type: "address"
  }],
  name: "allowance",
  outputs: [{
    internalType: "uint256",
    name: "",
    type: "uint256"
  }],
  stateMutability: "view",
  type: "function"
}, {
  inputs: [{
    internalType: "address",
    name: "spender",
    type: "address"
  }, {
    internalType: "uint256",
    name: "amount",
    type: "uint256"
  }],
  name: "approve",
  outputs: [{
    internalType: "bool",
    name: "",
    type: "bool"
  }],
  stateMutability: "nonpayable",
  type: "function"
}, {
  inputs: [],
  name: "decimals",
  outputs: [{
    internalType: "uint8",
    name: "",
    type: "uint8"
  }],
  stateMutability: "view",
  type: "function"
}, {
  inputs: [],
  name: "name",
  outputs: [{
    internalType: "string",
    name: "",
    type: "string"
  }],
  stateMutability: "view",
  type: "function"
}, {
  inputs: [],
  name: "symbol",
  outputs: [{
    internalType: "string",
    name: "",
    type: "string"
  }],
  stateMutability: "view",
  type: "function"
}];

/* Autogenerated file. Do not edit manually. */
var IFaucet__factory =
/*#__PURE__*/
function () {
  function IFaucet__factory() {}

  IFaucet__factory.connect = function connect(address, signerOrProvider) {
    return new ethers.Contract(address, _abi$5, signerOrProvider);
  };

  return IFaucet__factory;
}();
var _abi$5 = [{
  inputs: [{
    internalType: "address",
    name: "_token",
    type: "address"
  }],
  name: "getMinter",
  outputs: [{
    internalType: "address",
    name: "",
    type: "address"
  }],
  stateMutability: "view",
  type: "function"
}, {
  inputs: [{
    internalType: "address",
    name: "_token",
    type: "address"
  }, {
    internalType: "uint256",
    name: "_amount",
    type: "uint256"
  }],
  name: "mint",
  outputs: [{
    internalType: "uint256",
    name: "",
    type: "uint256"
  }],
  stateMutability: "payable",
  type: "function"
}];

/* Autogenerated file. Do not edit manually. */
var IGovernancePowerDelegationToken__factory =
/*#__PURE__*/
function () {
  function IGovernancePowerDelegationToken__factory() {}

  IGovernancePowerDelegationToken__factory.connect = function connect(address, signerOrProvider) {
    return new ethers.Contract(address, _abi$6, signerOrProvider);
  };

  return IGovernancePowerDelegationToken__factory;
}();
var _abi$6 = [{
  anonymous: false,
  inputs: [{
    indexed: true,
    internalType: "address",
    name: "delegator",
    type: "address"
  }, {
    indexed: true,
    internalType: "address",
    name: "delegatee",
    type: "address"
  }, {
    indexed: false,
    internalType: "enum IGovernancePowerDelegationToken.DelegationType",
    name: "delegationType",
    type: "uint8"
  }],
  name: "DelegateChanged",
  type: "event"
}, {
  anonymous: false,
  inputs: [{
    indexed: true,
    internalType: "address",
    name: "user",
    type: "address"
  }, {
    indexed: false,
    internalType: "uint256",
    name: "amount",
    type: "uint256"
  }, {
    indexed: false,
    internalType: "enum IGovernancePowerDelegationToken.DelegationType",
    name: "delegationType",
    type: "uint8"
  }],
  name: "DelegatedPowerChanged",
  type: "event"
}, {
  inputs: [{
    internalType: "address",
    name: "",
    type: "address"
  }],
  name: "_nonces",
  outputs: [{
    internalType: "uint256",
    name: "",
    type: "uint256"
  }],
  stateMutability: "view",
  type: "function"
}, {
  inputs: [{
    internalType: "address",
    name: "delegatee",
    type: "address"
  }],
  name: "delegate",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}, {
  inputs: [{
    internalType: "address",
    name: "delegatee",
    type: "address"
  }, {
    internalType: "uint256",
    name: "nonce",
    type: "uint256"
  }, {
    internalType: "uint256",
    name: "expiry",
    type: "uint256"
  }, {
    internalType: "uint8",
    name: "v",
    type: "uint8"
  }, {
    internalType: "bytes32",
    name: "r",
    type: "bytes32"
  }, {
    internalType: "bytes32",
    name: "s",
    type: "bytes32"
  }],
  name: "delegateBySig",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}, {
  inputs: [{
    internalType: "address",
    name: "delegatee",
    type: "address"
  }, {
    internalType: "enum IGovernancePowerDelegationToken.DelegationType",
    name: "delegationType",
    type: "uint8"
  }],
  name: "delegateByType",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}, {
  inputs: [{
    internalType: "address",
    name: "delegatee",
    type: "address"
  }, {
    internalType: "enum IGovernancePowerDelegationToken.DelegationType",
    name: "delegationType",
    type: "uint8"
  }, {
    internalType: "uint256",
    name: "nonce",
    type: "uint256"
  }, {
    internalType: "uint256",
    name: "expiry",
    type: "uint256"
  }, {
    internalType: "uint8",
    name: "v",
    type: "uint8"
  }, {
    internalType: "bytes32",
    name: "r",
    type: "bytes32"
  }, {
    internalType: "bytes32",
    name: "s",
    type: "bytes32"
  }],
  name: "delegateByTypeBySig",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}, {
  inputs: [{
    internalType: "address",
    name: "delegator",
    type: "address"
  }, {
    internalType: "enum IGovernancePowerDelegationToken.DelegationType",
    name: "delegationType",
    type: "uint8"
  }],
  name: "getDelegateeByType",
  outputs: [{
    internalType: "address",
    name: "",
    type: "address"
  }],
  stateMutability: "view",
  type: "function"
}, {
  inputs: [{
    internalType: "address",
    name: "user",
    type: "address"
  }, {
    internalType: "uint256",
    name: "blockNumber",
    type: "uint256"
  }, {
    internalType: "enum IGovernancePowerDelegationToken.DelegationType",
    name: "delegationType",
    type: "uint8"
  }],
  name: "getPowerAtBlock",
  outputs: [{
    internalType: "uint256",
    name: "",
    type: "uint256"
  }],
  stateMutability: "view",
  type: "function"
}, {
  inputs: [{
    internalType: "address",
    name: "user",
    type: "address"
  }, {
    internalType: "enum IGovernancePowerDelegationToken.DelegationType",
    name: "delegationType",
    type: "uint8"
  }],
  name: "getPowerCurrent",
  outputs: [{
    internalType: "uint256",
    name: "",
    type: "uint256"
  }],
  stateMutability: "view",
  type: "function"
}, {
  inputs: [{
    internalType: "uint256",
    name: "blockNumber",
    type: "uint256"
  }],
  name: "totalSupplyAt",
  outputs: [{
    internalType: "uint256",
    name: "",
    type: "uint256"
  }],
  stateMutability: "view",
  type: "function"
}];

/* Autogenerated file. Do not edit manually. */
var IGovernanceStrategy__factory =
/*#__PURE__*/
function () {
  function IGovernanceStrategy__factory() {}

  IGovernanceStrategy__factory.connect = function connect(address, signerOrProvider) {
    return new ethers.Contract(address, _abi$7, signerOrProvider);
  };

  return IGovernanceStrategy__factory;
}();
var _abi$7 = [{
  inputs: [],
  name: "AAVE",
  outputs: [{
    internalType: "address",
    name: "",
    type: "address"
  }],
  stateMutability: "view",
  type: "function"
}, {
  inputs: [],
  name: "STK_AAVE",
  outputs: [{
    internalType: "address",
    name: "",
    type: "address"
  }],
  stateMutability: "view",
  type: "function"
}, {
  inputs: [{
    internalType: "address",
    name: "user",
    type: "address"
  }, {
    internalType: "uint256",
    name: "blockNumber",
    type: "uint256"
  }],
  name: "getPropositionPowerAt",
  outputs: [{
    internalType: "uint256",
    name: "",
    type: "uint256"
  }],
  stateMutability: "view",
  type: "function"
}, {
  inputs: [{
    internalType: "uint256",
    name: "blockNumber",
    type: "uint256"
  }],
  name: "getTotalPropositionSupplyAt",
  outputs: [{
    internalType: "uint256",
    name: "",
    type: "uint256"
  }],
  stateMutability: "view",
  type: "function"
}, {
  inputs: [{
    internalType: "uint256",
    name: "blockNumber",
    type: "uint256"
  }],
  name: "getTotalVotingSupplyAt",
  outputs: [{
    internalType: "uint256",
    name: "",
    type: "uint256"
  }],
  stateMutability: "view",
  type: "function"
}, {
  inputs: [{
    internalType: "address",
    name: "user",
    type: "address"
  }, {
    internalType: "uint256",
    name: "blockNumber",
    type: "uint256"
  }],
  name: "getVotingPowerAt",
  outputs: [{
    internalType: "uint256",
    name: "",
    type: "uint256"
  }],
  stateMutability: "view",
  type: "function"
}];

/* Autogenerated file. Do not edit manually. */
var IGovernanceV2Helper__factory =
/*#__PURE__*/
function () {
  function IGovernanceV2Helper__factory() {}

  IGovernanceV2Helper__factory.connect = function connect(address, signerOrProvider) {
    return new ethers.Contract(address, _abi$8, signerOrProvider);
  };

  return IGovernanceV2Helper__factory;
}();
var _abi$8 = [{
  inputs: [{
    internalType: "uint256",
    name: "id",
    type: "uint256"
  }, {
    internalType: "contract IAaveGovernanceV2",
    name: "governance",
    type: "address"
  }],
  name: "getProposal",
  outputs: [{
    components: [{
      internalType: "uint256",
      name: "totalVotingSupply",
      type: "uint256"
    }, {
      internalType: "uint256",
      name: "minimumQuorum",
      type: "uint256"
    }, {
      internalType: "uint256",
      name: "minimumDiff",
      type: "uint256"
    }, {
      internalType: "uint256",
      name: "executionTimeWithGracePeriod",
      type: "uint256"
    }, {
      internalType: "uint256",
      name: "proposalCreated",
      type: "uint256"
    }, {
      internalType: "uint256",
      name: "id",
      type: "uint256"
    }, {
      internalType: "address",
      name: "creator",
      type: "address"
    }, {
      internalType: "contract IExecutorWithTimelock",
      name: "executor",
      type: "address"
    }, {
      internalType: "address[]",
      name: "targets",
      type: "address[]"
    }, {
      internalType: "uint256[]",
      name: "values",
      type: "uint256[]"
    }, {
      internalType: "string[]",
      name: "signatures",
      type: "string[]"
    }, {
      internalType: "bytes[]",
      name: "calldatas",
      type: "bytes[]"
    }, {
      internalType: "bool[]",
      name: "withDelegatecalls",
      type: "bool[]"
    }, {
      internalType: "uint256",
      name: "startBlock",
      type: "uint256"
    }, {
      internalType: "uint256",
      name: "endBlock",
      type: "uint256"
    }, {
      internalType: "uint256",
      name: "executionTime",
      type: "uint256"
    }, {
      internalType: "uint256",
      name: "forVotes",
      type: "uint256"
    }, {
      internalType: "uint256",
      name: "againstVotes",
      type: "uint256"
    }, {
      internalType: "bool",
      name: "executed",
      type: "bool"
    }, {
      internalType: "bool",
      name: "canceled",
      type: "bool"
    }, {
      internalType: "address",
      name: "strategy",
      type: "address"
    }, {
      internalType: "bytes32",
      name: "ipfsHash",
      type: "bytes32"
    }, {
      internalType: "enum IAaveGovernanceV2.ProposalState",
      name: "proposalState",
      type: "uint8"
    }],
    internalType: "struct IGovernanceV2Helper.ProposalStats",
    name: "proposalStats",
    type: "tuple"
  }],
  stateMutability: "view",
  type: "function"
}, {
  inputs: [{
    internalType: "uint256",
    name: "skip",
    type: "uint256"
  }, {
    internalType: "uint256",
    name: "limit",
    type: "uint256"
  }, {
    internalType: "contract IAaveGovernanceV2",
    name: "governance",
    type: "address"
  }],
  name: "getProposals",
  outputs: [{
    components: [{
      internalType: "uint256",
      name: "totalVotingSupply",
      type: "uint256"
    }, {
      internalType: "uint256",
      name: "minimumQuorum",
      type: "uint256"
    }, {
      internalType: "uint256",
      name: "minimumDiff",
      type: "uint256"
    }, {
      internalType: "uint256",
      name: "executionTimeWithGracePeriod",
      type: "uint256"
    }, {
      internalType: "uint256",
      name: "proposalCreated",
      type: "uint256"
    }, {
      internalType: "uint256",
      name: "id",
      type: "uint256"
    }, {
      internalType: "address",
      name: "creator",
      type: "address"
    }, {
      internalType: "contract IExecutorWithTimelock",
      name: "executor",
      type: "address"
    }, {
      internalType: "address[]",
      name: "targets",
      type: "address[]"
    }, {
      internalType: "uint256[]",
      name: "values",
      type: "uint256[]"
    }, {
      internalType: "string[]",
      name: "signatures",
      type: "string[]"
    }, {
      internalType: "bytes[]",
      name: "calldatas",
      type: "bytes[]"
    }, {
      internalType: "bool[]",
      name: "withDelegatecalls",
      type: "bool[]"
    }, {
      internalType: "uint256",
      name: "startBlock",
      type: "uint256"
    }, {
      internalType: "uint256",
      name: "endBlock",
      type: "uint256"
    }, {
      internalType: "uint256",
      name: "executionTime",
      type: "uint256"
    }, {
      internalType: "uint256",
      name: "forVotes",
      type: "uint256"
    }, {
      internalType: "uint256",
      name: "againstVotes",
      type: "uint256"
    }, {
      internalType: "bool",
      name: "executed",
      type: "bool"
    }, {
      internalType: "bool",
      name: "canceled",
      type: "bool"
    }, {
      internalType: "address",
      name: "strategy",
      type: "address"
    }, {
      internalType: "bytes32",
      name: "ipfsHash",
      type: "bytes32"
    }, {
      internalType: "enum IAaveGovernanceV2.ProposalState",
      name: "proposalState",
      type: "uint8"
    }],
    internalType: "struct IGovernanceV2Helper.ProposalStats[]",
    name: "proposalsStats",
    type: "tuple[]"
  }],
  stateMutability: "view",
  type: "function"
}, {
  inputs: [{
    internalType: "address",
    name: "user",
    type: "address"
  }, {
    internalType: "address[]",
    name: "tokens",
    type: "address[]"
  }],
  name: "getTokensPower",
  outputs: [{
    components: [{
      internalType: "uint256",
      name: "votingPower",
      type: "uint256"
    }, {
      internalType: "address",
      name: "delegatedAddressVotingPower",
      type: "address"
    }, {
      internalType: "uint256",
      name: "propositionPower",
      type: "uint256"
    }, {
      internalType: "address",
      name: "delegatedAddressPropositionPower",
      type: "address"
    }],
    internalType: "struct IGovernanceV2Helper.Power[]",
    name: "power",
    type: "tuple[]"
  }],
  stateMutability: "view",
  type: "function"
}];

/* Autogenerated file. Do not edit manually. */
var ILendingPool__factory =
/*#__PURE__*/
function () {
  function ILendingPool__factory() {}

  ILendingPool__factory.connect = function connect(address, signerOrProvider) {
    return new ethers.Contract(address, _abi$9, signerOrProvider);
  };

  return ILendingPool__factory;
}();
var _abi$9 = [{
  inputs: [],
  name: "FLASHLOAN_PREMIUM_TOTAL",
  outputs: [{
    internalType: "uint256",
    name: "",
    type: "uint256"
  }],
  stateMutability: "view",
  type: "function"
}, {
  inputs: [{
    internalType: "address",
    name: "reserve",
    type: "address"
  }, {
    internalType: "uint256",
    name: "amount",
    type: "uint256"
  }, {
    internalType: "uint256",
    name: "interestRateMode",
    type: "uint256"
  }, {
    internalType: "uint16",
    name: "referralCode",
    type: "uint16"
  }, {
    internalType: "address",
    name: "onBehalfOf",
    type: "address"
  }],
  name: "borrow",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}, {
  inputs: [{
    internalType: "address",
    name: "reserve",
    type: "address"
  }, {
    internalType: "uint256",
    name: "amount",
    type: "uint256"
  }, {
    internalType: "address",
    name: "onBehalfOf",
    type: "address"
  }, {
    internalType: "uint16",
    name: "referralCode",
    type: "uint16"
  }],
  name: "deposit",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}, {
  inputs: [{
    internalType: "address",
    name: "receiver",
    type: "address"
  }, {
    internalType: "address[]",
    name: "assets",
    type: "address[]"
  }, {
    internalType: "uint256[]",
    name: "amounts",
    type: "uint256[]"
  }, {
    internalType: "uint256[]",
    name: "modes",
    type: "uint256[]"
  }, {
    internalType: "address",
    name: "onBehalfOf",
    type: "address"
  }, {
    internalType: "bytes",
    name: "params",
    type: "bytes"
  }, {
    internalType: "uint16",
    name: "referralCode",
    type: "uint16"
  }],
  name: "flashLoan",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}, {
  inputs: [{
    internalType: "address",
    name: "collateral",
    type: "address"
  }, {
    internalType: "address",
    name: "reserve",
    type: "address"
  }, {
    internalType: "address",
    name: "user",
    type: "address"
  }, {
    internalType: "uint256",
    name: "purchaseAmount",
    type: "uint256"
  }, {
    internalType: "bool",
    name: "receiveAToken",
    type: "bool"
  }],
  name: "liquidationCall",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}, {
  inputs: [{
    internalType: "address",
    name: "reserve",
    type: "address"
  }, {
    internalType: "uint256",
    name: "amount",
    type: "uint256"
  }, {
    internalType: "uint256",
    name: "rateMode",
    type: "uint256"
  }, {
    internalType: "address",
    name: "onBehalfOf",
    type: "address"
  }],
  name: "repay",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}, {
  inputs: [{
    internalType: "address",
    name: "reserve",
    type: "address"
  }, {
    internalType: "bool",
    name: "useAsCollateral",
    type: "bool"
  }],
  name: "setUserUseReserveAsCollateral",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}, {
  inputs: [{
    internalType: "address",
    name: "reserve",
    type: "address"
  }, {
    internalType: "uint256",
    name: "rateMode",
    type: "uint256"
  }],
  name: "swapBorrowRateMode",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}, {
  inputs: [{
    internalType: "address",
    name: "reserve",
    type: "address"
  }, {
    internalType: "uint256",
    name: "amount",
    type: "uint256"
  }, {
    internalType: "address",
    name: "to",
    type: "address"
  }],
  name: "withdraw",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}];

/* Autogenerated file. Do not edit manually. */
var ILendToAaveMigrator__factory =
/*#__PURE__*/
function () {
  function ILendToAaveMigrator__factory() {}

  ILendToAaveMigrator__factory.connect = function connect(address, signerOrProvider) {
    return new ethers.Contract(address, _abi$a, signerOrProvider);
  };

  return ILendToAaveMigrator__factory;
}();
var _abi$a = [{
  inputs: [],
  name: "LEND",
  outputs: [{
    internalType: "address",
    name: "",
    type: "address"
  }],
  stateMutability: "view",
  type: "function"
}, {
  inputs: [{
    internalType: "uint256",
    name: "amount",
    type: "uint256"
  }],
  name: "migrateFromLEND",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}];

/* Autogenerated file. Do not edit manually. */
var IMinter__factory =
/*#__PURE__*/
function () {
  function IMinter__factory() {}

  IMinter__factory.connect = function connect(address, signerOrProvider) {
    return new ethers.Contract(address, _abi$b, signerOrProvider);
  };

  return IMinter__factory;
}();
var _abi$b = [{
  inputs: [],
  name: "isEthRequired",
  outputs: [{
    internalType: "bool",
    name: "",
    type: "bool"
  }],
  stateMutability: "pure",
  type: "function"
}, {
  inputs: [{
    internalType: "address",
    name: "_token",
    type: "address"
  }, {
    internalType: "uint256",
    name: "_amount",
    type: "uint256"
  }],
  name: "mint",
  outputs: [{
    internalType: "uint256",
    name: "",
    type: "uint256"
  }],
  stateMutability: "payable",
  type: "function"
}];

/* Autogenerated file. Do not edit manually. */
var IRepayWithCollateral__factory =
/*#__PURE__*/
function () {
  function IRepayWithCollateral__factory() {}

  IRepayWithCollateral__factory.connect = function connect(address, signerOrProvider) {
    return new ethers.Contract(address, _abi$c, signerOrProvider);
  };

  return IRepayWithCollateral__factory;
}();
var _abi$c = [{
  inputs: [{
    internalType: "address",
    name: "collateralAsset",
    type: "address"
  }, {
    internalType: "address",
    name: "debtAsset",
    type: "address"
  }, {
    internalType: "uint256",
    name: "collateralAmount",
    type: "uint256"
  }, {
    internalType: "uint256",
    name: "debtRepayAmount",
    type: "uint256"
  }, {
    internalType: "uint256",
    name: "debtRateMode",
    type: "uint256"
  }, {
    components: [{
      internalType: "uint256",
      name: "amount",
      type: "uint256"
    }, {
      internalType: "uint256",
      name: "deadline",
      type: "uint256"
    }, {
      internalType: "uint8",
      name: "v",
      type: "uint8"
    }, {
      internalType: "bytes32",
      name: "r",
      type: "bytes32"
    }, {
      internalType: "bytes32",
      name: "s",
      type: "bytes32"
    }],
    internalType: "struct IRepayWithCollateral.PermitSignature",
    name: "permitSignature",
    type: "tuple"
  }, {
    internalType: "bool",
    name: "useEthPath",
    type: "bool"
  }],
  name: "swapAndRepay",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}];

/* Autogenerated file. Do not edit manually. */
var IStakedToken__factory =
/*#__PURE__*/
function () {
  function IStakedToken__factory() {}

  IStakedToken__factory.connect = function connect(address, signerOrProvider) {
    return new ethers.Contract(address, _abi$d, signerOrProvider);
  };

  return IStakedToken__factory;
}();
var _abi$d = [{
  inputs: [],
  name: "REWARD_TOKEN",
  outputs: [{
    internalType: "address",
    name: "",
    type: "address"
  }],
  stateMutability: "view",
  type: "function"
}, {
  inputs: [],
  name: "STAKED_TOKEN",
  outputs: [{
    internalType: "address",
    name: "",
    type: "address"
  }],
  stateMutability: "view",
  type: "function"
}, {
  inputs: [{
    internalType: "address",
    name: "to",
    type: "address"
  }, {
    internalType: "uint256",
    name: "amount",
    type: "uint256"
  }],
  name: "claimRewards",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}, {
  inputs: [],
  name: "cooldown",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}, {
  inputs: [{
    internalType: "address",
    name: "to",
    type: "address"
  }, {
    internalType: "uint256",
    name: "amount",
    type: "uint256"
  }],
  name: "redeem",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}, {
  inputs: [{
    internalType: "address",
    name: "onBehalfOf",
    type: "address"
  }, {
    internalType: "uint256",
    name: "amount",
    type: "uint256"
  }],
  name: "stake",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}];

/* Autogenerated file. Do not edit manually. */
var IParaSwapLiquiditySwapAdapter__factory =
/*#__PURE__*/
function () {
  function IParaSwapLiquiditySwapAdapter__factory() {}

  IParaSwapLiquiditySwapAdapter__factory.connect = function connect(address, signerOrProvider) {
    return new ethers.Contract(address, _abi$e, signerOrProvider);
  };

  return IParaSwapLiquiditySwapAdapter__factory;
}();
var _abi$e = [{
  inputs: [{
    internalType: "address",
    name: "assetToSwapFrom",
    type: "address"
  }, {
    internalType: "address",
    name: "assetToSwapTo",
    type: "address"
  }, {
    internalType: "uint256",
    name: "amountToSwap",
    type: "uint256"
  }, {
    internalType: "uint256",
    name: "minAmountToReceive",
    type: "uint256"
  }, {
    internalType: "uint256",
    name: "swapAllBalanceOffset",
    type: "uint256"
  }, {
    internalType: "bytes",
    name: "swapCalldata",
    type: "bytes"
  }, {
    internalType: "address",
    name: "augustus",
    type: "address"
  }, {
    components: [{
      internalType: "uint256",
      name: "amount",
      type: "uint256"
    }, {
      internalType: "uint256",
      name: "deadline",
      type: "uint256"
    }, {
      internalType: "uint8",
      name: "v",
      type: "uint8"
    }, {
      internalType: "bytes32",
      name: "r",
      type: "bytes32"
    }, {
      internalType: "bytes32",
      name: "s",
      type: "bytes32"
    }],
    internalType: "struct IParaSwapLiquiditySwapAdapter.PermitSignature",
    name: "permitParams",
    type: "tuple"
  }],
  name: "swapAndDeposit",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}];

/* Autogenerated file. Do not edit manually. */
var ISynthetix__factory =
/*#__PURE__*/
function () {
  function ISynthetix__factory() {}

  ISynthetix__factory.connect = function connect(address, signerOrProvider) {
    return new ethers.Contract(address, _abi$f, signerOrProvider);
  };

  return ISynthetix__factory;
}();
var _abi$f = [{
  inputs: [{
    internalType: "address",
    name: "account",
    type: "address"
  }],
  name: "transferableSynthetix",
  outputs: [{
    internalType: "uint256",
    name: "transferable",
    type: "uint256"
  }],
  stateMutability: "view",
  type: "function"
}];

/* Autogenerated file. Do not edit manually. */
var IWETHGateway__factory =
/*#__PURE__*/
function () {
  function IWETHGateway__factory() {}

  IWETHGateway__factory.connect = function connect(address, signerOrProvider) {
    return new ethers.Contract(address, _abi$g, signerOrProvider);
  };

  return IWETHGateway__factory;
}();
var _abi$g = [{
  inputs: [{
    internalType: "address",
    name: "lendingPool",
    type: "address"
  }, {
    internalType: "uint256",
    name: "amount",
    type: "uint256"
  }, {
    internalType: "uint256",
    name: "interesRateMode",
    type: "uint256"
  }, {
    internalType: "uint16",
    name: "referralCode",
    type: "uint16"
  }],
  name: "borrowETH",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}, {
  inputs: [{
    internalType: "address",
    name: "lendingPool",
    type: "address"
  }, {
    internalType: "address",
    name: "onBehalfOf",
    type: "address"
  }, {
    internalType: "uint16",
    name: "referralCode",
    type: "uint16"
  }],
  name: "depositETH",
  outputs: [],
  stateMutability: "payable",
  type: "function"
}, {
  inputs: [{
    internalType: "address",
    name: "lendingPool",
    type: "address"
  }, {
    internalType: "uint256",
    name: "amount",
    type: "uint256"
  }, {
    internalType: "uint256",
    name: "rateMode",
    type: "uint256"
  }, {
    internalType: "address",
    name: "onBehalfOf",
    type: "address"
  }],
  name: "repayETH",
  outputs: [],
  stateMutability: "payable",
  type: "function"
}, {
  inputs: [{
    internalType: "address",
    name: "lendingPool",
    type: "address"
  }, {
    internalType: "uint256",
    name: "amount",
    type: "uint256"
  }, {
    internalType: "address",
    name: "onBehalfOf",
    type: "address"
  }],
  name: "withdrawETH",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}];

var parseNumber = function parseNumber(value, decimals) {
  return new BigNumber__default(value).multipliedBy(new BigNumber__default(10).pow(decimals)).toFixed(0);
};
var getTxValue = function getTxValue(reserve, amount) {
  return reserve.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase() ? amount : DEFAULT_NULL_VALUE_ON_TX;
};
var mintAmountsPerToken = {
  AAVE:
  /*#__PURE__*/
  parseNumber('100', 18),
  BAT:
  /*#__PURE__*/
  parseNumber('100000', 18),
  BUSD:
  /*#__PURE__*/
  parseNumber('10000', 18),
  DAI:
  /*#__PURE__*/
  parseNumber('10000', 18),
  ENJ:
  /*#__PURE__*/
  parseNumber('100000', 18),
  KNC:
  /*#__PURE__*/
  parseNumber('10000', 18),
  LEND:
  /*#__PURE__*/
  parseNumber('1000', 18),
  LINK:
  /*#__PURE__*/
  parseNumber('1000', 18),
  MANA:
  /*#__PURE__*/
  parseNumber('100000', 18),
  MKR:
  /*#__PURE__*/
  parseNumber('10', 18),
  WETH:
  /*#__PURE__*/
  parseNumber('10', 18),
  REN:
  /*#__PURE__*/
  parseNumber('10000', 18),
  REP:
  /*#__PURE__*/
  parseNumber('1000', 18),
  SNX:
  /*#__PURE__*/
  parseNumber('100', 18),
  SUSD:
  /*#__PURE__*/
  parseNumber('10000', 18),
  TUSD: '0',
  UNI:
  /*#__PURE__*/
  parseNumber('1000', 18),
  USDC:
  /*#__PURE__*/
  parseNumber('10000', 6),
  USDT:
  /*#__PURE__*/
  parseNumber('10000', 6),
  WBTC:
  /*#__PURE__*/
  parseNumber('1', 8),
  YFI:
  /*#__PURE__*/
  parseNumber('1', 18),
  ZRX:
  /*#__PURE__*/
  parseNumber('100000', 18),
  UNIUSDC:
  /*#__PURE__*/
  parseNumber(uniswapEthAmount, 6),
  UNIDAI:
  /*#__PURE__*/
  parseNumber(uniswapEthAmount, 18),
  UNIUSDT:
  /*#__PURE__*/
  parseNumber(uniswapEthAmount, 6),
  UNIDAIETH:
  /*#__PURE__*/
  parseNumber(uniswapEthAmount, 18),
  UNIUSDCETH:
  /*#__PURE__*/
  parseNumber(uniswapEthAmount, 18),
  UNISETHETH:
  /*#__PURE__*/
  parseNumber(uniswapEthAmount, 18),
  UNILENDETH:
  /*#__PURE__*/
  parseNumber(uniswapEthAmount, 18),
  UNILINKETH:
  /*#__PURE__*/
  parseNumber(uniswapEthAmount, 18),
  UNIMKRETH:
  /*#__PURE__*/
  parseNumber(uniswapEthAmount, 18)
};
var canBeEnsAddress = function canBeEnsAddress(ensAddress) {
  return ensAddress.toLowerCase().endsWith('.eth');
};

/* eslint-disable prefer-rest-params */
var isEthAddressMetadataKey =
/*#__PURE__*/
Symbol('ethAddress');
var isEthAddressOrENSMetadataKey =
/*#__PURE__*/
Symbol('ethOrENSAddress');
var isPositiveMetadataKey =
/*#__PURE__*/
Symbol('isPositive');
var isPositiveOrMinusOneMetadataKey =
/*#__PURE__*/
Symbol('isPositiveOrMinusOne');
var is0OrPositiveMetadataKey =
/*#__PURE__*/
Symbol('is0OrPositiveMetadataKey');
var optionalMetadataKey =
/*#__PURE__*/
Symbol('Optional'); // tslint:disable-next-line: function-name

function IsEthAddress(field) {
  return function ( // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  target, propertyKey, parameterIndex) {
    var existingPossibleAddresses = Reflect.getOwnMetadata(isEthAddressMetadataKey, target, propertyKey) || [];
    existingPossibleAddresses.push({
      index: parameterIndex,
      field: field
    });
    Reflect.defineMetadata(isEthAddressMetadataKey, existingPossibleAddresses, target, propertyKey);
  };
} // tslint:disable-next-line: function-name
function IsEthAddressOrENS(field) {
  return function ( // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  target, propertyKey, parameterIndex) {
    var existingPossibleAddresses = Reflect.getOwnMetadata(isEthAddressOrENSMetadataKey, target, propertyKey) || [];
    existingPossibleAddresses.push({
      index: parameterIndex,
      field: field
    });
    Reflect.defineMetadata(isEthAddressOrENSMetadataKey, existingPossibleAddresses, target, propertyKey);
  };
}
function IsPositiveAmount(field) {
  return function ( // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  target, propertyKey, parameterIndex) {
    var params = Reflect.getOwnMetadata(isPositiveMetadataKey, target, propertyKey) || [];
    params.push({
      index: parameterIndex,
      field: field
    });
    Reflect.defineMetadata(isPositiveMetadataKey, params, target, propertyKey);
  };
}
function Is0OrPositiveAmount(field) {
  return function ( // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  target, propertyKey, parameterIndex) {
    var params = Reflect.getOwnMetadata(is0OrPositiveMetadataKey, target, propertyKey) || [];
    params.push({
      index: parameterIndex,
      field: field
    });
    Reflect.defineMetadata(is0OrPositiveMetadataKey, params, target, propertyKey);
  };
}
function IsPositiveOrMinusOneAmount(field) {
  return function ( // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  target, propertyKey, parameterIndex) {
    var params = Reflect.getOwnMetadata(isPositiveOrMinusOneMetadataKey, target, propertyKey) || [];
    params.push({
      index: parameterIndex,
      field: field
    });
    Reflect.defineMetadata(isPositiveOrMinusOneMetadataKey, params, target, propertyKey);
  };
}
function Optional( // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
target, propertyKey, parameterIndex) {
  var existingOptionalParameters = Reflect.getOwnMetadata(optionalMetadataKey, target, propertyKey) || [];
  existingOptionalParameters.push(parameterIndex);
  Reflect.defineMetadata(optionalMetadataKey, existingOptionalParameters, target, propertyKey);
}

/* eslint-disable prefer-rest-params */
function optionalValidator(target, propertyName, methodArguments) {
  var optionalParameters = Reflect.getOwnMetadata(optionalMetadataKey, target, propertyName);
  var isParamOptional = [];

  if (optionalParameters) {
    optionalParameters.forEach(function (parameterIndex) {
      if (methodArguments[parameterIndex] == null) {
        isParamOptional[parameterIndex] = true;
      }
    });
  }

  return isParamOptional;
}
function isEthAddressValidator(target, propertyName, methodArguments, isParamOptional) {
  var addressParameters = Reflect.getOwnMetadata(isEthAddressMetadataKey, target, propertyName);

  if (addressParameters) {
    addressParameters.forEach(function (storedParams) {
      if (storedParams.field) {
        if (methodArguments[0][storedParams.field] && !ethers.utils.isAddress(methodArguments[0][storedParams.field])) {
          throw new Error("Address: " + methodArguments[0][storedParams.field] + " is not a valid ethereum Address");
        }
      } else {
        var isOptional = isParamOptional && isParamOptional[storedParams.index];

        if (methodArguments[storedParams.index] && !isOptional && !ethers.utils.isAddress(methodArguments[storedParams.index])) {
          throw new Error("Address: " + methodArguments[storedParams.index] + " is not a valid ethereum Address");
        }
      }
    });
  }
}
function isEthAddressOrEnsValidator(target, propertyName, methodArguments, isParamOptional) {
  var addressParameters = Reflect.getOwnMetadata(isEthAddressOrENSMetadataKey, target, propertyName);

  if (addressParameters) {
    addressParameters.forEach(function (storedParams) {
      if (storedParams.field) {
        if (methodArguments[0][storedParams.field] && !ethers.utils.isAddress(methodArguments[0][storedParams.field])) {
          if (!canBeEnsAddress(methodArguments[0][storedParams.field])) {
            throw new Error("Address " + methodArguments[0][storedParams.field] + " is not valid ENS format or a valid ethereum Address");
          }
        }
      } else {
        var isOptional = isParamOptional && isParamOptional[storedParams.index];

        if (methodArguments[storedParams.index] && !isOptional && !ethers.utils.isAddress(methodArguments[storedParams.index])) {
          if (!canBeEnsAddress(methodArguments[storedParams.index])) {
            throw new Error("Address " + methodArguments[storedParams.index] + " is not valid ENS format or a valid ethereum Address");
          }
        }
      }
    });
  }
}
function amountGtThan0Validator(target, propertyName, methodArguments, isParamOptional) {
  var amountParameters = Reflect.getOwnMetadata(isPositiveMetadataKey, target, propertyName);

  if (amountParameters) {
    amountParameters.forEach(function (storedParams) {
      if (storedParams.field) {
        if (methodArguments[0][storedParams.field] && !(Number(methodArguments[0][storedParams.field]) > 0)) {
          throw new Error("Amount: " + methodArguments[0][storedParams.field] + " needs to be greater than 0");
        }
      } else {
        var isOptional = isParamOptional && isParamOptional[storedParams.index];

        if (!isOptional && !(Number(methodArguments[storedParams.index]) > 0)) {
          throw new Error("Amount: " + methodArguments[storedParams.index] + " needs to be greater than 0");
        }
      }
    });
  }
}
function amount0OrPositiveValidator(target, propertyName, methodArguments, isParamOptional) {
  var amountParameters = Reflect.getOwnMetadata(is0OrPositiveMetadataKey, target, propertyName);

  if (amountParameters) {
    amountParameters.forEach(function (storedParams) {
      if (storedParams.field) {
        if (methodArguments[0][storedParams.field] && !(Number(methodArguments[0][storedParams.field]) >= 0)) {
          throw new Error("Amount: " + methodArguments[0][storedParams.field] + " needs to be greater than 0");
        }
      } else {
        var isOptional = isParamOptional && isParamOptional[storedParams.index];

        if (!isOptional && !(Number(methodArguments[storedParams.index]) >= 0)) {
          throw new Error("Amount: " + methodArguments[storedParams.index] + " needs to be greater than 0");
        }
      }
    });
  }
}
function amountGtThan0OrMinus1(target, propertyName, methodArguments, isParamOptional) {
  var amountMinusOneParameters = Reflect.getOwnMetadata(isPositiveOrMinusOneMetadataKey, target, propertyName);

  if (amountMinusOneParameters) {
    amountMinusOneParameters.forEach(function (storedParams) {
      if (storedParams.field) {
        if (methodArguments[0][storedParams.field] && !(Number(methodArguments[0][storedParams.field]) > 0 || methodArguments[0][storedParams.field] === '-1')) {
          throw new Error("Amount: " + methodArguments[0][storedParams.field] + " needs to be greater than 0 or -1");
        }
      } else {
        var isOptional = isParamOptional && isParamOptional[storedParams.index];

        if (!isOptional && !(Number(methodArguments[storedParams.index]) > 0 || methodArguments[storedParams.index] === '-1')) {
          throw new Error("Amount: " + methodArguments[storedParams.index] + " needs to be greater than 0 or -1");
        }
      }
    });
  }
}

function LPValidator( // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
target, propertyName, descriptor) {
  var method = descriptor.value; // eslint-disable-next-line no-param-reassign

  descriptor.value = function () {
    var currentNetwork = this.config.network;
    var acceptedNetworks = enabledNetworksByService.lendingPool[this.market];

    if (acceptedNetworks.indexOf(currentNetwork) === -1) {
      return [];
    }

    isEthAddressValidator(target, propertyName, arguments);
    amountGtThan0Validator(target, propertyName, arguments);
    amountGtThan0OrMinus1(target, propertyName, arguments);
    return method == null ? void 0 : method.apply(this, arguments);
  };
}
function LTAMigratorValidator( // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
target, propertyName, descriptor) {
  var method = descriptor.value; // eslint-disable-next-line no-param-reassign

  descriptor.value = function () {
    var currentNetwork = this.config.network;
    var acceptedNetworks = enabledNetworksByService.ltaMigrator;

    if (acceptedNetworks.indexOf(currentNetwork) === -1) {
      return [];
    }

    isEthAddressValidator(target, propertyName, arguments);
    amountGtThan0Validator(target, propertyName, arguments);
    return method == null ? void 0 : method.apply(this, arguments);
  };
}
function IncentivesValidator( // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
target, propertyName, descriptor) {
  var method = descriptor.value; // eslint-disable-next-line no-param-reassign

  descriptor.value = function () {
    var currentNetwork = this.config.network;
    var acceptedNetworks = enabledNetworksByService.incentivesController;

    if (acceptedNetworks.indexOf(currentNetwork) === -1) {
      return [];
    }

    isEthAddressValidator(target, propertyName, arguments); // isEthAddressArrayValidator(target, propertyName, arguments);

    return method == null ? void 0 : method.apply(this, arguments);
  };
}
function LiquiditySwapValidator( // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
target, propertyName, descriptor) {
  var method = descriptor.value; // eslint-disable-next-line no-param-reassign

  descriptor.value = function () {
    var currentNetwork = this.config.network;
    var acceptedNetworks = enabledNetworksByService.liquiditySwapAdapter;

    if (acceptedNetworks.indexOf(currentNetwork) === -1) {
      return [];
    }

    isEthAddressValidator(target, propertyName, arguments);
    amountGtThan0Validator(target, propertyName, arguments);
    amountGtThan0OrMinus1(target, propertyName, arguments);
    return method == null ? void 0 : method.apply(this, arguments);
  };
}
function RepayWithCollateralValidator( // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
target, propertyName, descriptor) {
  var method = descriptor.value; // eslint-disable-next-line no-param-reassign

  descriptor.value = function () {
    var currentNetwork = this.config.network;
    var acceptedNetworks = enabledNetworksByService.repayWithCollateralAdapter;

    if (acceptedNetworks.indexOf(currentNetwork) === -1) {
      return [];
    }

    isEthAddressValidator(target, propertyName, arguments);
    amountGtThan0Validator(target, propertyName, arguments);
    amountGtThan0OrMinus1(target, propertyName, arguments);
    return method == null ? void 0 : method.apply(this, arguments);
  };
}
function StakingValidator( // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
target, propertyName, descriptor) {
  var method = descriptor.value; // eslint-disable-next-line no-param-reassign

  descriptor.value = function () {
    var currentNetwork = this.config.network;
    var acceptedNetworks = enabledNetworksByService.staking[this.tokenStake];

    if (acceptedNetworks.indexOf(currentNetwork) === -1) {
      return [];
    }

    var isParamOptional = optionalValidator(target, propertyName, arguments);
    isEthAddressValidator(target, propertyName, arguments, isParamOptional);
    amountGtThan0Validator(target, propertyName, arguments, isParamOptional);
    return method == null ? void 0 : method.apply(this, arguments);
  };
}
function FaucetValidator( // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
target, propertyName, descriptor) {
  var method = descriptor.value; // eslint-disable-next-line no-param-reassign

  descriptor.value = function () {
    var currentNetwork = this.config.network;
    var acceptedNetworks = enabledNetworksByService.faucet;

    if (acceptedNetworks.indexOf(currentNetwork) === -1) {
      return [];
    }

    var isParamOptional = optionalValidator(target, propertyName, arguments);
    isEthAddressValidator(target, propertyName, arguments, isParamOptional);
    amountGtThan0Validator(target, propertyName, arguments, isParamOptional);
    return method == null ? void 0 : method.apply(this, arguments);
  };
}
function WETHValidator( // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
target, propertyName, descriptor) {
  var method = descriptor.value; // eslint-disable-next-line no-param-reassign

  descriptor.value = function () {
    var currentNetwork = this.config.network;
    var acceptedNetworks = enabledNetworksByService.wethGateway;

    if (acceptedNetworks.indexOf(currentNetwork) === -1) {
      return [];
    }

    isEthAddressValidator(target, propertyName, arguments);
    amountGtThan0Validator(target, propertyName, arguments);
    amountGtThan0OrMinus1(target, propertyName, arguments);
    return method == null ? void 0 : method.apply(this, arguments);
  };
}
function GovValidator( // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
target, propertyName, descriptor) {
  var method = descriptor.value; // eslint-disable-next-line no-param-reassign

  descriptor.value = function () {
    var currentNetwork = this.config.network;
    var acceptedNetworks = enabledNetworksByService.aaveGovernanceV2;

    if (acceptedNetworks.indexOf(currentNetwork) === -1) {
      return [];
    }

    isEthAddressValidator(target, propertyName, arguments);
    amount0OrPositiveValidator(target, propertyName, arguments);
    return method == null ? void 0 : method.apply(this, arguments);
  };
}
function GovDelegationValidator( // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
target, propertyName, descriptor) {
  var method = descriptor.value; // eslint-disable-next-line no-param-reassign

  descriptor.value = function () {
    var currentNetwork = this.config.network;
    var acceptedNetworks = enabledNetworksByService.aaveGovernanceV2;

    if (acceptedNetworks.indexOf(currentNetwork) === -1) {
      return [];
    }

    isEthAddressValidator(target, propertyName, arguments);
    isEthAddressOrEnsValidator(target, propertyName, arguments);
    amountGtThan0Validator(target, propertyName, arguments);
    amount0OrPositiveValidator(target, propertyName, arguments);
    return method == null ? void 0 : method.apply(this, arguments);
  };
}

var DEFAULT_SURPLUS = 30; // 30%
// polygon gas estimation is very off for some reason

var POLYGON_SURPLUS = 60; // 60%
var estimateGasByNetwork =
/*#__PURE__*/
function () {
  var _ref2 =
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  runtime_1.mark(function _callee2(tx, config, gasSurplus) {
    var estimatedGas, network;
    return runtime_1.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return config.provider.estimateGas(tx);

          case 2:
            estimatedGas = _context2.sent;
            network = config.network;

            if (!(network === exports.Network.polygon)) {
              _context2.next = 6;
              break;
            }

            return _context2.abrupt("return", estimatedGas.add(estimatedGas.mul(POLYGON_SURPLUS).div(100)));

          case 6:
            return _context2.abrupt("return", estimatedGas.add(estimatedGas.mul(gasSurplus || DEFAULT_SURPLUS).div(100)));

          case 7:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function estimateGasByNetwork(_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}();
var getGasPrice =
/*#__PURE__*/
function () {
  var _ref3 =
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  runtime_1.mark(function _callee3(config) {
    var gasPrice;
    return runtime_1.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return config.provider.getGasPrice();

          case 2:
            gasPrice = _context3.sent;
            return _context3.abrupt("return", gasPrice);

          case 4:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function getGasPrice(_x7) {
    return _ref3.apply(this, arguments);
  };
}();

var BaseService = function BaseService(config, contractFactory) {
  var _this = this;

  this.getContractInstance = function (address) {
    if (!_this.contractInstances[address]) {
      var provider = _this.config.provider;
      _this.contractInstances[address] = _this.contractFactory.connect(address, provider);
    }

    return _this.contractInstances[address];
  };

  this.generateTxCallback = function (_ref) {
    var rawTxMethod = _ref.rawTxMethod,
        from = _ref.from,
        value = _ref.value,
        gasSurplus = _ref.gasSurplus,
        action = _ref.action;
    return (
      /*#__PURE__*/
      _asyncToGenerator(
      /*#__PURE__*/
      runtime_1.mark(function _callee() {
        var txRaw, tx;
        return runtime_1.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return rawTxMethod();

              case 2:
                txRaw = _context.sent;
                tx = _extends({}, txRaw, {
                  from: from,
                  value: value || DEFAULT_NULL_VALUE_ON_TX
                });
                _context.next = 6;
                return estimateGasByNetwork(tx, _this.config, gasSurplus);

              case 6:
                tx.gasLimit = _context.sent;

                if (action && gasLimitRecommendations[action] && tx.gasLimit.lte(ethers.BigNumber.from(gasLimitRecommendations[action].limit))) {
                  tx.gasLimit = ethers.BigNumber.from(gasLimitRecommendations[action].recommended);
                }

                return _context.abrupt("return", tx);

              case 9:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }))
    );
  };

  this.generateTxPriceEstimation = function (txs, txCallback, action) {
    if (action === void 0) {
      action = exports.ProtocolAction["default"];
    }

    return (
      /*#__PURE__*/
      function () {
        var _ref3 = _asyncToGenerator(
        /*#__PURE__*/
        runtime_1.mark(function _callee2(force) {
          var gasPrice, hasPendingApprovals, _ref4, gasLimit, gasPriceProv;

          return runtime_1.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  if (force === void 0) {
                    force = false;
                  }

                  _context2.prev = 1;
                  _context2.next = 4;
                  return getGasPrice(_this.config);

                case 4:
                  gasPrice = _context2.sent;
                  hasPendingApprovals = txs.find(function (tx) {
                    return tx.txType === exports.eEthereumTxType.ERC20_APPROVAL;
                  });

                  if (!(!hasPendingApprovals || force)) {
                    _context2.next = 15;
                    break;
                  }

                  _context2.next = 9;
                  return txCallback();

                case 9:
                  _ref4 = _context2.sent;
                  gasLimit = _ref4.gasLimit;
                  gasPriceProv = _ref4.gasPrice;

                  if (gasLimit) {
                    _context2.next = 14;
                    break;
                  }

                  throw new Error('Transaction calculation error');

                case 14:
                  return _context2.abrupt("return", {
                    gasLimit: gasLimit.toString(),
                    gasPrice: gasPriceProv ? gasPriceProv.toString() : gasPrice.toString()
                  });

                case 15:
                  return _context2.abrupt("return", {
                    gasLimit: gasLimitRecommendations[action].recommended,
                    gasPrice: gasPrice.toString()
                  });

                case 18:
                  _context2.prev = 18;
                  _context2.t0 = _context2["catch"](1);
                  console.error('Calculate error on calculate estimation gas price.', _context2.t0);
                  return _context2.abrupt("return", null);

                case 22:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2, null, [[1, 18]]);
        }));

        return function (_x) {
          return _ref3.apply(this, arguments);
        };
      }()
    );
  };

  this.config = config;
  this.contractFactory = contractFactory;
  this.contractInstances = {};
};

function augustusFromAmountOffsetFromCalldata(calldata) {
  switch (calldata.slice(0, 10)) {
    case '0xda8567c8':
      // Augustus V3 multiSwap
      return 4 + 32 + 2 * 32;

    case '0x58b9d179':
      // Augustus V4 swapOnUniswap
      return 4;

    case '0x0863b7ac':
      // Augustus V4 swapOnUniswapFork
      return 4 + 2 * 32;

    case '0x8f00eccb':
      // Augustus V4 multiSwap
      return 4 + 32 + 32;

    case '0xec1d21dd':
      // Augustus V4 megaSwap
      return 4 + 32 + 32;

    default:
      throw new Error('Unrecognized function selector for Augustus');
  }
}

var LiquiditySwapAdapterService =
/*#__PURE__*/
function (_BaseService) {
  _inheritsLoose(LiquiditySwapAdapterService, _BaseService);

  function LiquiditySwapAdapterService(config) {
    var _this;

    _this = _BaseService.call(this, config, IParaSwapLiquiditySwapAdapter__factory) || this;
    var SWAP_COLLATERAL_ADAPTER = commonContractAddressBetweenMarketsV2[_this.config.network].SWAP_COLLATERAL_ADAPTER;
    _this.liquiditySwapAdapterAddress = SWAP_COLLATERAL_ADAPTER;
    return _this;
  }

  var _proto = LiquiditySwapAdapterService.prototype;

  _proto.swapAndDeposit = function swapAndDeposit(_ref) {
    var user = _ref.user,
        assetToSwapFrom = _ref.assetToSwapFrom,
        assetToSwapTo = _ref.assetToSwapTo,
        amountToSwap = _ref.amountToSwap,
        minAmountToReceive = _ref.minAmountToReceive,
        permitParams = _ref.permitParams,
        augustus = _ref.augustus,
        swapCallData = _ref.swapCallData,
        swapAll = _ref.swapAll;
    var liquiditySwapContract = this.getContractInstance(this.liquiditySwapAdapterAddress);
    var txCallback = this.generateTxCallback({
      rawTxMethod: function rawTxMethod() {
        return liquiditySwapContract.populateTransaction.swapAndDeposit(assetToSwapFrom, assetToSwapTo, amountToSwap, minAmountToReceive, swapAll ? augustusFromAmountOffsetFromCalldata(swapCallData) : 0, swapCallData, augustus, permitParams);
      },
      from: user
    });
    return {
      tx: txCallback,
      txType: exports.eEthereumTxType.DLP_ACTION,
      gas: this.generateTxPriceEstimation([], txCallback)
    };
  };

  return LiquiditySwapAdapterService;
}(BaseService);

tslib.__decorate([LiquiditySwapValidator, tslib.__param(0, IsEthAddress('user')), tslib.__param(0, IsEthAddress('assetToSwapFrom')), tslib.__param(0, IsEthAddress('assetToSwapTo')), tslib.__param(0, IsEthAddress('augustus')), tslib.__param(0, IsPositiveAmount('amountToSwap')), tslib.__param(0, IsPositiveAmount('minAmountToReceive')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Object)], LiquiditySwapAdapterService.prototype, "swapAndDeposit", null);

var buildParaSwapLiquiditySwapParams = function buildParaSwapLiquiditySwapParams(assetToSwapTo, minAmountToReceive, swapAllBalanceOffset, swapCalldata, augustus, permitAmount, deadline, v, r, s) {
  return ethers.utils.defaultAbiCoder.encode(['address', 'uint256', 'uint256', 'bytes', 'address', 'tuple(uint256,uint256,uint8,bytes32,bytes32)'], [assetToSwapTo, minAmountToReceive, swapAllBalanceOffset, swapCalldata, augustus, [permitAmount, deadline, v, r, s]]);
};

var LendingPool =
/*#__PURE__*/
function (_BaseService) {
  _inheritsLoose(LendingPool, _BaseService);

  function LendingPool(config, erc20Service, synthetixService, wethGatewayService, liquiditySwapAdapterService, repayWithCollateralAdapterService, market) {
    var _this;

    _this = _BaseService.call(this, config, ILendingPool__factory) || this;
    _this.erc20Service = erc20Service;
    _this.synthetixService = synthetixService;
    _this.wethGatewayService = wethGatewayService;
    _this.liquiditySwapAdapterService = liquiditySwapAdapterService;
    _this.repayWithCollateralAdapterService = repayWithCollateralAdapterService;
    _this.market = market;
    var network = _this.config.network;
    _this.lendingPoolAddress = distinctContractAddressBetweenMarketsV2[_this.market][network].LENDINGPOOL_ADDRESS;
    return _this;
  }

  var _proto = LendingPool.prototype;

  _proto.deposit =
  /*#__PURE__*/
  function () {
    var _deposit =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee(_ref) {
      var user, reserve, amount, onBehalfOf, referralCode, _this$erc20Service, isApproved, approve, decimalsOf, txs, reserveDecimals, convertedAmount, fundsAvailable, approved, approveTx, lendingPoolContract, txCallback;

      return runtime_1.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              user = _ref.user, reserve = _ref.reserve, amount = _ref.amount, onBehalfOf = _ref.onBehalfOf, referralCode = _ref.referralCode;

              if (!(reserve.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase())) {
                _context.next = 3;
                break;
              }

              return _context.abrupt("return", this.wethGatewayService.depositETH({
                lendingPool: this.lendingPoolAddress,
                user: user,
                amount: amount,
                onBehalfOf: onBehalfOf,
                referralCode: referralCode
              }));

            case 3:
              _this$erc20Service = this.erc20Service, isApproved = _this$erc20Service.isApproved, approve = _this$erc20Service.approve, decimalsOf = _this$erc20Service.decimalsOf;
              txs = [];
              _context.next = 7;
              return decimalsOf(reserve);

            case 7:
              reserveDecimals = _context.sent;
              convertedAmount = parseNumber(amount, reserveDecimals);
              _context.next = 11;
              return this.synthetixService.synthetixValidation(user, reserve, convertedAmount);

            case 11:
              fundsAvailable = _context.sent;

              if (fundsAvailable) {
                _context.next = 14;
                break;
              }

              throw new Error('Not enough funds to execute operation');

            case 14:
              _context.next = 16;
              return isApproved(reserve, user, this.lendingPoolAddress, amount);

            case 16:
              approved = _context.sent;

              if (!approved) {
                approveTx = approve(user, reserve, this.lendingPoolAddress, DEFAULT_APPROVE_AMOUNT);
                txs.push(approveTx);
              }

              lendingPoolContract = this.getContractInstance(this.lendingPoolAddress);
              txCallback = this.generateTxCallback({
                rawTxMethod: function rawTxMethod() {
                  return lendingPoolContract.populateTransaction.deposit(reserve, convertedAmount, onBehalfOf || user, referralCode || '0');
                },
                from: user,
                value: getTxValue(reserve, convertedAmount)
              });
              txs.push({
                tx: txCallback,
                txType: exports.eEthereumTxType.DLP_ACTION,
                gas: this.generateTxPriceEstimation(txs, txCallback, exports.ProtocolAction.deposit)
              });
              return _context.abrupt("return", txs);

            case 22:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function deposit(_x) {
      return _deposit.apply(this, arguments);
    }

    return deposit;
  }();

  _proto.withdraw =
  /*#__PURE__*/
  function () {
    var _withdraw =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee2(_ref2) {
      var user, reserve, amount, onBehalfOf, aTokenAddress, decimalsOf, decimals, convertedAmount, lendingPoolContract, txCallback;
      return runtime_1.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              user = _ref2.user, reserve = _ref2.reserve, amount = _ref2.amount, onBehalfOf = _ref2.onBehalfOf, aTokenAddress = _ref2.aTokenAddress;

              if (!(reserve.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase())) {
                _context2.next = 5;
                break;
              }

              if (aTokenAddress) {
                _context2.next = 4;
                break;
              }

              throw new Error('To withdraw ETH you need to pass the aWETH token address');

            case 4:
              return _context2.abrupt("return", this.wethGatewayService.withdrawETH({
                lendingPool: this.lendingPoolAddress,
                user: user,
                amount: amount,
                onBehalfOf: onBehalfOf,
                aTokenAddress: aTokenAddress
              }));

            case 5:
              decimalsOf = this.erc20Service.decimalsOf;
              _context2.next = 8;
              return decimalsOf(reserve);

            case 8:
              decimals = _context2.sent;
              convertedAmount = amount === '-1' ? ethers.constants.MaxUint256.toString() : parseNumber(amount, decimals);
              lendingPoolContract = this.getContractInstance(this.lendingPoolAddress);
              txCallback = this.generateTxCallback({
                rawTxMethod: function rawTxMethod() {
                  return lendingPoolContract.populateTransaction.withdraw(reserve, convertedAmount, onBehalfOf || user);
                },
                from: user,
                action: exports.ProtocolAction.withdraw
              });
              return _context2.abrupt("return", [{
                tx: txCallback,
                txType: exports.eEthereumTxType.DLP_ACTION,
                gas: this.generateTxPriceEstimation([], txCallback, exports.ProtocolAction.withdraw)
              }]);

            case 13:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function withdraw(_x2) {
      return _withdraw.apply(this, arguments);
    }

    return withdraw;
  }();

  _proto.borrow =
  /*#__PURE__*/
  function () {
    var _borrow =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee3(_ref3) {
      var user, reserve, amount, interestRateMode, debtTokenAddress, onBehalfOf, referralCode, decimalsOf, reserveDecimals, formatAmount, numericRateMode, lendingPoolContract, txCallback;
      return runtime_1.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              user = _ref3.user, reserve = _ref3.reserve, amount = _ref3.amount, interestRateMode = _ref3.interestRateMode, debtTokenAddress = _ref3.debtTokenAddress, onBehalfOf = _ref3.onBehalfOf, referralCode = _ref3.referralCode;

              if (!(reserve.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase())) {
                _context3.next = 5;
                break;
              }

              if (debtTokenAddress) {
                _context3.next = 4;
                break;
              }

              throw new Error("To borrow ETH you need to pass the stable or variable WETH debt Token Address corresponding the interestRateMode");

            case 4:
              return _context3.abrupt("return", this.wethGatewayService.borrowETH({
                lendingPool: this.lendingPoolAddress,
                user: user,
                amount: amount,
                debtTokenAddress: debtTokenAddress,
                interestRateMode: interestRateMode,
                referralCode: referralCode
              }));

            case 5:
              decimalsOf = this.erc20Service.decimalsOf;
              _context3.next = 8;
              return decimalsOf(reserve);

            case 8:
              reserveDecimals = _context3.sent;
              formatAmount = parseNumber(amount, reserveDecimals);
              numericRateMode = interestRateMode === exports.InterestRate.Variable ? 2 : 1;
              lendingPoolContract = this.getContractInstance(this.lendingPoolAddress);
              txCallback = this.generateTxCallback({
                rawTxMethod: function rawTxMethod() {
                  return lendingPoolContract.populateTransaction.borrow(reserve, formatAmount, numericRateMode, referralCode || 0, onBehalfOf || user);
                },
                from: user
              });
              return _context3.abrupt("return", [{
                tx: txCallback,
                txType: exports.eEthereumTxType.DLP_ACTION,
                gas: this.generateTxPriceEstimation([], txCallback)
              }]);

            case 14:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    function borrow(_x3) {
      return _borrow.apply(this, arguments);
    }

    return borrow;
  }();

  _proto.repay =
  /*#__PURE__*/
  function () {
    var _repay =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee4(_ref4) {
      var user, reserve, amount, interestRateMode, onBehalfOf, txs, _this$erc20Service2, isApproved, approve, decimalsOf, lendingPoolContract, populateTransaction, numericRateMode, decimals, convertedAmount, fundsAvailable, approved, approveTx, txCallback;

      return runtime_1.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              user = _ref4.user, reserve = _ref4.reserve, amount = _ref4.amount, interestRateMode = _ref4.interestRateMode, onBehalfOf = _ref4.onBehalfOf;

              if (!(reserve.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase())) {
                _context4.next = 3;
                break;
              }

              return _context4.abrupt("return", this.wethGatewayService.repayETH({
                lendingPool: this.lendingPoolAddress,
                user: user,
                amount: amount,
                interestRateMode: interestRateMode,
                onBehalfOf: onBehalfOf
              }));

            case 3:
              txs = [];
              _this$erc20Service2 = this.erc20Service, isApproved = _this$erc20Service2.isApproved, approve = _this$erc20Service2.approve, decimalsOf = _this$erc20Service2.decimalsOf;
              lendingPoolContract = this.getContractInstance(this.lendingPoolAddress);
              populateTransaction = lendingPoolContract.populateTransaction;
              numericRateMode = interestRateMode === exports.InterestRate.Variable ? 2 : 1;
              _context4.next = 10;
              return decimalsOf(reserve);

            case 10:
              decimals = _context4.sent;
              convertedAmount = amount === '-1' ? ethers.constants.MaxUint256.toString() : parseNumber(amount, decimals);

              if (!(amount !== '-1')) {
                _context4.next = 18;
                break;
              }

              _context4.next = 15;
              return this.synthetixService.synthetixValidation(user, reserve, convertedAmount);

            case 15:
              fundsAvailable = _context4.sent;

              if (fundsAvailable) {
                _context4.next = 18;
                break;
              }

              throw new Error('Not enough funds to execute operation');

            case 18:
              _context4.next = 20;
              return isApproved(reserve, user, this.lendingPoolAddress, amount);

            case 20:
              approved = _context4.sent;

              if (!approved) {
                approveTx = approve(user, reserve, this.lendingPoolAddress, DEFAULT_APPROVE_AMOUNT);
                txs.push(approveTx);
              }

              txCallback = this.generateTxCallback({
                rawTxMethod: function rawTxMethod() {
                  return populateTransaction.repay(reserve, convertedAmount, numericRateMode, onBehalfOf || user);
                },
                from: user,
                value: getTxValue(reserve, convertedAmount)
              });
              txs.push({
                tx: txCallback,
                txType: exports.eEthereumTxType.DLP_ACTION,
                gas: this.generateTxPriceEstimation(txs, txCallback, exports.ProtocolAction.repay)
              });
              return _context4.abrupt("return", txs);

            case 25:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    function repay(_x4) {
      return _repay.apply(this, arguments);
    }

    return repay;
  }();

  _proto.swapBorrowRateMode =
  /*#__PURE__*/
  function () {
    var _swapBorrowRateMode =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee5(_ref5) {
      var user, reserve, interestRateMode, numericRateMode, lendingPoolContract, txCallback;
      return runtime_1.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              user = _ref5.user, reserve = _ref5.reserve, interestRateMode = _ref5.interestRateMode;
              numericRateMode = interestRateMode === exports.InterestRate.Variable ? 2 : 1;
              lendingPoolContract = this.getContractInstance(this.lendingPoolAddress);
              txCallback = this.generateTxCallback({
                rawTxMethod: function rawTxMethod() {
                  return lendingPoolContract.populateTransaction.swapBorrowRateMode(reserve, numericRateMode);
                },
                from: user
              });
              return _context5.abrupt("return", [{
                txType: exports.eEthereumTxType.DLP_ACTION,
                tx: txCallback,
                gas: this.generateTxPriceEstimation([], txCallback)
              }]);

            case 5:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }));

    function swapBorrowRateMode(_x5) {
      return _swapBorrowRateMode.apply(this, arguments);
    }

    return swapBorrowRateMode;
  }();

  _proto.setUsageAsCollateral =
  /*#__PURE__*/
  function () {
    var _setUsageAsCollateral =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee6(_ref6) {
      var user, reserve, usageAsCollateral, lendingPoolContract, txCallback;
      return runtime_1.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              user = _ref6.user, reserve = _ref6.reserve, usageAsCollateral = _ref6.usageAsCollateral;
              lendingPoolContract = this.getContractInstance(this.lendingPoolAddress);
              txCallback = this.generateTxCallback({
                rawTxMethod: function rawTxMethod() {
                  return lendingPoolContract.populateTransaction.setUserUseReserveAsCollateral(reserve, usageAsCollateral);
                },
                from: user
              });
              return _context6.abrupt("return", [{
                tx: txCallback,
                txType: exports.eEthereumTxType.DLP_ACTION,
                gas: this.generateTxPriceEstimation([], txCallback)
              }]);

            case 4:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6, this);
    }));

    function setUsageAsCollateral(_x6) {
      return _setUsageAsCollateral.apply(this, arguments);
    }

    return setUsageAsCollateral;
  }();

  _proto.liquidationCall =
  /*#__PURE__*/
  function () {
    var _liquidationCall =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee7(_ref7) {
      var liquidator, liquidatedUser, debtReserve, collateralReserve, purchaseAmount, getAToken, liquidateAll, txs, _this$erc20Service3, isApproved, approve, getTokenData, approved, approveTx, _ref8, debtReserveInfo, reserveDecimals, convertedAmount, lendingPoolContract, txCallback;

      return runtime_1.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              liquidator = _ref7.liquidator, liquidatedUser = _ref7.liquidatedUser, debtReserve = _ref7.debtReserve, collateralReserve = _ref7.collateralReserve, purchaseAmount = _ref7.purchaseAmount, getAToken = _ref7.getAToken, liquidateAll = _ref7.liquidateAll;
              txs = [];
              _this$erc20Service3 = this.erc20Service, isApproved = _this$erc20Service3.isApproved, approve = _this$erc20Service3.approve, getTokenData = _this$erc20Service3.getTokenData;
              _context7.next = 5;
              return isApproved(debtReserve, liquidator, this.lendingPoolAddress, purchaseAmount);

            case 5:
              approved = _context7.sent;

              if (!approved) {
                approveTx = approve(liquidator, debtReserve, this.lendingPoolAddress, DEFAULT_APPROVE_AMOUNT);
                txs.push(approveTx);
              }

              _context7.next = 9;
              return Promise.all([getTokenData(debtReserve)]);

            case 9:
              _ref8 = _context7.sent;
              debtReserveInfo = _ref8[0];
              reserveDecimals = debtReserveInfo.decimals;
              convertedAmount = liquidateAll ? MAX_UINT_AMOUNT : parseNumber(purchaseAmount, reserveDecimals);
              lendingPoolContract = this.getContractInstance(this.lendingPoolAddress);
              txCallback = this.generateTxCallback({
                rawTxMethod: function rawTxMethod() {
                  return lendingPoolContract.populateTransaction.liquidationCall(collateralReserve, debtReserve, liquidatedUser, convertedAmount, getAToken || false);
                },
                from: liquidator,
                value: getTxValue(debtReserve, convertedAmount)
              });
              txs.push({
                tx: txCallback,
                txType: exports.eEthereumTxType.DLP_ACTION,
                gas: this.generateTxPriceEstimation(txs, txCallback, exports.ProtocolAction.liquidationCall)
              });
              return _context7.abrupt("return", txs);

            case 17:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7, this);
    }));

    function liquidationCall(_x7) {
      return _liquidationCall.apply(this, arguments);
    }

    return liquidationCall;
  }();

  _proto.swapCollateral =
  /*#__PURE__*/
  function () {
    var _swapCollateral =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee8(_ref9) {
      var user, flash, fromAsset, fromAToken, toAsset, fromAmount, minToAmount, permitSignature, swapAll, onBehalfOf, referralCode, augustus, swapCallData, txs, permitParams, SWAP_COLLATERAL_ADAPTER, approved, approveTx, tokenDecimals, convertedAmount, tokenToDecimals, amountSlippageConverted, lendingPoolContract, params, amountWithSurplus, convertedAmountWithSurplus, txCallback, swapAndDepositTx;
      return runtime_1.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              user = _ref9.user, flash = _ref9.flash, fromAsset = _ref9.fromAsset, fromAToken = _ref9.fromAToken, toAsset = _ref9.toAsset, fromAmount = _ref9.fromAmount, minToAmount = _ref9.minToAmount, permitSignature = _ref9.permitSignature, swapAll = _ref9.swapAll, onBehalfOf = _ref9.onBehalfOf, referralCode = _ref9.referralCode, augustus = _ref9.augustus, swapCallData = _ref9.swapCallData;
              txs = [];
              permitParams = permitSignature || {
                amount: '0',
                deadline: '0',
                v: 0,
                r: '0x0000000000000000000000000000000000000000000000000000000000000000',
                s: '0x0000000000000000000000000000000000000000000000000000000000000000'
              };
              SWAP_COLLATERAL_ADAPTER = commonContractAddressBetweenMarketsV2[this.config.network].SWAP_COLLATERAL_ADAPTER;
              _context8.next = 6;
              return this.erc20Service.isApproved(fromAToken, user, SWAP_COLLATERAL_ADAPTER, fromAmount);

            case 6:
              approved = _context8.sent;

              if (!approved) {
                approveTx = this.erc20Service.approve(user, fromAToken, SWAP_COLLATERAL_ADAPTER, ethers.constants.MaxUint256.toString());
                txs.push(approveTx);
              }

              _context8.next = 10;
              return this.erc20Service.decimalsOf(fromAsset);

            case 10:
              tokenDecimals = _context8.sent;
              convertedAmount = parseNumber(fromAmount, tokenDecimals);
              _context8.next = 14;
              return this.erc20Service.decimalsOf(toAsset);

            case 14:
              tokenToDecimals = _context8.sent;
              amountSlippageConverted = parseNumber(minToAmount, tokenToDecimals);
              lendingPoolContract = this.getContractInstance(this.lendingPoolAddress);
              params = buildParaSwapLiquiditySwapParams(toAsset, amountSlippageConverted, swapAll ? augustusFromAmountOffsetFromCalldata(swapCallData) : 0, swapCallData, augustus, permitParams.amount, permitParams.deadline, permitParams.v, permitParams.r, permitParams.s);

              if (!flash) {
                _context8.next = 24;
                break;
              }

              amountWithSurplus = (Number(fromAmount) + Number(fromAmount) * Number(SURPLUS) / 100).toString();
              convertedAmountWithSurplus = parseNumber(amountWithSurplus, tokenDecimals);
              txCallback = this.generateTxCallback({
                rawTxMethod: function rawTxMethod() {
                  return lendingPoolContract.populateTransaction.flashLoan(SWAP_COLLATERAL_ADAPTER, [fromAsset], swapAll ? [convertedAmountWithSurplus] : [convertedAmount], [0], // interest rate mode to NONE for flashloan to not open debt
                  onBehalfOf || user, params, referralCode || '0');
                },
                from: user
              });
              txs.push({
                tx: txCallback,
                txType: exports.eEthereumTxType.DLP_ACTION,
                gas: this.generateTxPriceEstimation(txs, txCallback, exports.ProtocolAction.swapCollateral)
              });
              return _context8.abrupt("return", txs);

            case 24:
              _context8.next = 26;
              return this.liquiditySwapAdapterService.swapAndDeposit({
                user: user,
                assetToSwapFrom: fromAsset,
                assetToSwapTo: toAsset,
                amountToSwap: convertedAmount,
                minAmountToReceive: amountSlippageConverted,
                swapAll: swapAll,
                swapCallData: swapCallData,
                augustus: augustus,
                permitParams: permitParams
              });

            case 26:
              swapAndDepositTx = _context8.sent;
              txs.push(swapAndDepositTx);
              return _context8.abrupt("return", txs);

            case 29:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8, this);
    }));

    function swapCollateral(_x8) {
      return _swapCollateral.apply(this, arguments);
    }

    return swapCollateral;
  }();

  _proto.repayWithCollateral =
  /*#__PURE__*/
  function () {
    var _repayWithCollateral =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee9(_ref10) {
      var user, fromAsset, fromAToken, assetToRepay, repayWithAmount, repayAmount, permitSignature, repayAllDebt, rateMode, onBehalfOf, referralCode, flash, useEthPath, txs, permitParams, REPAY_WITH_COLLATERAL_ADAPTER, approved, approveTx, fromDecimals, convertedRepayWithAmount, repayAmountWithSurplus, decimals, convertedRepayAmount, numericInterestRate, params, lendingPoolContract, txCallback, swapAndRepayTx;
      return runtime_1.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              user = _ref10.user, fromAsset = _ref10.fromAsset, fromAToken = _ref10.fromAToken, assetToRepay = _ref10.assetToRepay, repayWithAmount = _ref10.repayWithAmount, repayAmount = _ref10.repayAmount, permitSignature = _ref10.permitSignature, repayAllDebt = _ref10.repayAllDebt, rateMode = _ref10.rateMode, onBehalfOf = _ref10.onBehalfOf, referralCode = _ref10.referralCode, flash = _ref10.flash, useEthPath = _ref10.useEthPath;
              txs = [];
              permitParams = permitSignature || {
                amount: '0',
                deadline: '0',
                v: 0,
                r: '0x0000000000000000000000000000000000000000000000000000000000000000',
                s: '0x0000000000000000000000000000000000000000000000000000000000000000'
              };
              REPAY_WITH_COLLATERAL_ADAPTER = commonContractAddressBetweenMarketsV2[this.config.network].REPAY_WITH_COLLATERAL_ADAPTER;
              _context9.next = 6;
              return this.erc20Service.isApproved(fromAToken, user, REPAY_WITH_COLLATERAL_ADAPTER, repayWithAmount);

            case 6:
              approved = _context9.sent;

              if (!approved) {
                approveTx = this.erc20Service.approve(user, fromAToken, REPAY_WITH_COLLATERAL_ADAPTER, ethers.constants.MaxUint256.toString());
                txs.push(approveTx);
              }

              _context9.next = 10;
              return this.erc20Service.decimalsOf(fromAsset);

            case 10:
              fromDecimals = _context9.sent;
              convertedRepayWithAmount = parseNumber(repayWithAmount, fromDecimals);
              repayAmountWithSurplus = (Number(repayAmount) + Number(repayAmount) * Number(SURPLUS) / 100).toString();
              _context9.next = 15;
              return this.erc20Service.decimalsOf(assetToRepay);

            case 15:
              decimals = _context9.sent;
              convertedRepayAmount = repayAllDebt ? parseNumber(repayAmountWithSurplus, decimals) : parseNumber(repayAmount, decimals);
              numericInterestRate = 0;

              if (rateMode) {
                numericInterestRate = rateMode === exports.InterestRate.Stable ? 1 : 2;
              }

              if (!flash) {
                _context9.next = 25;
                break;
              }

              params = ethers.utils.defaultAbiCoder.encode(['address', 'uint256', 'uint256', 'uint256', 'uint256', 'uint8', 'bytes32', 'bytes32', 'bool'], [fromAsset, convertedRepayWithAmount, numericInterestRate, permitParams.amount, permitParams.deadline, permitParams.v, permitParams.r, permitParams.s, useEthPath || false]);
              lendingPoolContract = this.getContractInstance(this.lendingPoolAddress);
              txCallback = this.generateTxCallback({
                rawTxMethod: function rawTxMethod() {
                  return lendingPoolContract.populateTransaction.flashLoan(REPAY_WITH_COLLATERAL_ADAPTER, [assetToRepay], [convertedRepayAmount], [0], // interest rate mode to NONE for flashloan to not open debt
                  onBehalfOf || user, params, referralCode || '0');
                },
                from: user
              });
              txs.push({
                tx: txCallback,
                txType: exports.eEthereumTxType.DLP_ACTION,
                gas: this.generateTxPriceEstimation(txs, txCallback, exports.ProtocolAction.repayCollateral)
              });
              return _context9.abrupt("return", txs);

            case 25:
              swapAndRepayTx = this.repayWithCollateralAdapterService.swapAndRepay({
                user: user,
                collateralAsset: fromAsset,
                debtAsset: assetToRepay,
                collateralAmount: convertedRepayWithAmount,
                debtRepayAmount: convertedRepayAmount,
                debtRateMode: numericInterestRate,
                permit: permitParams,
                useEthPath: useEthPath
              });
              txs.push(swapAndRepayTx);
              return _context9.abrupt("return", txs);

            case 28:
            case "end":
              return _context9.stop();
          }
        }
      }, _callee9, this);
    }));

    function repayWithCollateral(_x9) {
      return _repayWithCollateral.apply(this, arguments);
    }

    return repayWithCollateral;
  }();

  _proto.flashLiquidation =
  /*#__PURE__*/
  function () {
    var _flashLiquidation =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee10(_ref11) {
      var user, collateralAsset, borrowedAsset, debtTokenCover, liquidateAll, initiator, useEthPath, addSurplus, txs, FLASHLIQUIDATION, lendingPoolContract, tokenDecimals, convertedDebt, convertedDebtTokenCover, flashBorrowAmount, params, txCallback;
      return runtime_1.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              user = _ref11.user, collateralAsset = _ref11.collateralAsset, borrowedAsset = _ref11.borrowedAsset, debtTokenCover = _ref11.debtTokenCover, liquidateAll = _ref11.liquidateAll, initiator = _ref11.initiator, useEthPath = _ref11.useEthPath;

              addSurplus = function addSurplus(amount) {
                return (Number(amount) + Number(amount) * Number(amount) / 100).toString();
              };

              txs = [];
              FLASHLIQUIDATION = commonContractAddressBetweenMarketsV2[this.config.network].FLASHLIQUIDATION;
              lendingPoolContract = this.getContractInstance(this.lendingPoolAddress);
              _context10.next = 7;
              return this.erc20Service.decimalsOf(borrowedAsset);

            case 7:
              tokenDecimals = _context10.sent;
              convertedDebt = parseNumber(debtTokenCover, tokenDecimals);
              convertedDebtTokenCover = liquidateAll ? ethers.constants.MaxUint256.toString() : convertedDebt;
              flashBorrowAmount = liquidateAll ? parseNumber(addSurplus(debtTokenCover), tokenDecimals) : convertedDebt;
              params = ethers.utils.defaultAbiCoder.encode(['address', 'address', 'address', 'uint256', 'bool'], [collateralAsset, borrowedAsset, user, convertedDebtTokenCover, useEthPath || false]);
              txCallback = this.generateTxCallback({
                rawTxMethod: function rawTxMethod() {
                  return lendingPoolContract.populateTransaction.flashLoan(FLASHLIQUIDATION, [borrowedAsset], [flashBorrowAmount], [0], initiator, params, '0');
                },
                from: initiator
              });
              txs.push({
                tx: txCallback,
                txType: exports.eEthereumTxType.DLP_ACTION,
                gas: this.generateTxPriceEstimation(txs, txCallback, exports.ProtocolAction.liquidationFlash)
              });
              return _context10.abrupt("return", txs);

            case 15:
            case "end":
              return _context10.stop();
          }
        }
      }, _callee10, this);
    }));

    function flashLiquidation(_x10) {
      return _flashLiquidation.apply(this, arguments);
    }

    return flashLiquidation;
  }();

  return LendingPool;
}(BaseService);

tslib.__decorate([LPValidator, tslib.__param(0, IsEthAddress('user')), tslib.__param(0, IsEthAddress('reserve')), tslib.__param(0, IsPositiveAmount('amount')), tslib.__param(0, IsEthAddress('onBehalfOf')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], LendingPool.prototype, "deposit", null);

tslib.__decorate([LPValidator, tslib.__param(0, IsEthAddress('user')), tslib.__param(0, IsEthAddress('reserve')), tslib.__param(0, IsPositiveOrMinusOneAmount('amount')), tslib.__param(0, IsEthAddress('onBehalfOf')), tslib.__param(0, IsEthAddress('aTokenAddress')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], LendingPool.prototype, "withdraw", null);

tslib.__decorate([LPValidator, tslib.__param(0, IsEthAddress('user')), tslib.__param(0, IsEthAddress('reserve')), tslib.__param(0, IsPositiveAmount('amount')), tslib.__param(0, IsEthAddress('debtTokenAddress')), tslib.__param(0, IsEthAddress('onBehalfOf')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], LendingPool.prototype, "borrow", null);

tslib.__decorate([LPValidator, tslib.__param(0, IsEthAddress('user')), tslib.__param(0, IsEthAddress('reserve')), tslib.__param(0, IsPositiveOrMinusOneAmount('amount')), tslib.__param(0, IsEthAddress('onBehalfOf')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], LendingPool.prototype, "repay", null);

tslib.__decorate([LPValidator, tslib.__param(0, IsEthAddress('user')), tslib.__param(0, IsEthAddress('reserve')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], LendingPool.prototype, "swapBorrowRateMode", null);

tslib.__decorate([LPValidator, tslib.__param(0, IsEthAddress('user')), tslib.__param(0, IsEthAddress('reserve')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], LendingPool.prototype, "setUsageAsCollateral", null);

tslib.__decorate([LPValidator, tslib.__param(0, IsEthAddress('liquidator')), tslib.__param(0, IsEthAddress('liquidatedUser')), tslib.__param(0, IsEthAddress('debtReserve')), tslib.__param(0, IsEthAddress('collateralReserve')), tslib.__param(0, IsPositiveAmount('purchaseAmount')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], LendingPool.prototype, "liquidationCall", null);

tslib.__decorate([LPValidator, tslib.__param(0, IsEthAddress('user')), tslib.__param(0, IsEthAddress('fromAsset')), tslib.__param(0, IsEthAddress('fromAToken')), tslib.__param(0, IsEthAddress('toAsset')), tslib.__param(0, IsEthAddress('onBehalfOf')), tslib.__param(0, IsEthAddress('augustus')), tslib.__param(0, IsPositiveAmount('fromAmount')), tslib.__param(0, IsPositiveAmount('minToAmount')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], LendingPool.prototype, "swapCollateral", null);

tslib.__decorate([LPValidator, tslib.__param(0, IsEthAddress('user')), tslib.__param(0, IsEthAddress('fromAsset')), tslib.__param(0, IsEthAddress('fromAToken')), tslib.__param(0, IsEthAddress('assetToRepay')), tslib.__param(0, IsEthAddress('onBehalfOf')), tslib.__param(0, IsPositiveAmount('repayWithAmount')), tslib.__param(0, IsPositiveAmount('repayAmount')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], LendingPool.prototype, "repayWithCollateral", null);

tslib.__decorate([LPValidator, tslib.__param(0, IsEthAddress('user')), tslib.__param(0, IsEthAddress('collateralAsset')), tslib.__param(0, IsEthAddress('borrowedAsset')), tslib.__param(0, IsPositiveAmount('debtTokenCover')), tslib.__param(0, IsEthAddress('initiator')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], LendingPool.prototype, "flashLiquidation", null);

var ERC20Service =
/*#__PURE__*/
function (_BaseService) {
  _inheritsLoose(ERC20Service, _BaseService);

  function ERC20Service(config) {
    var _this;

    _this = _BaseService.call(this, config, IERC20Detailed__factory) || this;

    _this.approve = function (user, token, spender, amount) {
      var erc20Contract = _this.getContractInstance(token);

      var txCallback = _this.generateTxCallback({
        rawTxMethod: function rawTxMethod() {
          return erc20Contract.populateTransaction.approve(spender, amount);
        },
        from: user
      });

      return {
        tx: txCallback,
        txType: exports.eEthereumTxType.ERC20_APPROVAL,
        gas: _this.generateTxPriceEstimation([], txCallback)
      };
    };

    _this.isApproved =
    /*#__PURE__*/
    function () {
      var _ref = _asyncToGenerator(
      /*#__PURE__*/
      runtime_1.mark(function _callee(token, userAddress, spender, amount) {
        var decimals, erc20Contract, allowance, amountBNWithDecimals;
        return runtime_1.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(token.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase())) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return", true);

              case 2:
                _context.next = 4;
                return _this.decimalsOf(token);

              case 4:
                decimals = _context.sent;
                erc20Contract = _this.getContractInstance(token);
                _context.next = 8;
                return erc20Contract.allowance(userAddress, spender);

              case 8:
                allowance = _context.sent;
                amountBNWithDecimals = amount === '-1' ? ethers.BigNumber.from(SUPER_BIG_ALLOWANCE_NUMBER) : ethers.BigNumber.from(parseNumber(amount, decimals));
                return _context.abrupt("return", allowance.gte(amountBNWithDecimals));

              case 11:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      return function (_x, _x2, _x3, _x4) {
        return _ref.apply(this, arguments);
      };
    }();

    _this.decimalsOf =
    /*#__PURE__*/
    function () {
      var _ref2 = _asyncToGenerator(
      /*#__PURE__*/
      runtime_1.mark(function _callee2(token) {
        var erc20Contract;
        return runtime_1.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!(token.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase())) {
                  _context2.next = 2;
                  break;
                }

                return _context2.abrupt("return", 18);

              case 2:
                if (_this.tokenDecimals[token]) {
                  _context2.next = 7;
                  break;
                }

                erc20Contract = _this.getContractInstance(token);
                _context2.next = 6;
                return erc20Contract.decimals();

              case 6:
                _this.tokenDecimals[token] = _context2.sent;

              case 7:
                return _context2.abrupt("return", _this.tokenDecimals[token]);

              case 8:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      return function (_x5) {
        return _ref2.apply(this, arguments);
      };
    }();

    _this.getTokenData =
    /*#__PURE__*/
    function () {
      var _ref3 = _asyncToGenerator(
      /*#__PURE__*/
      runtime_1.mark(function _callee3(token) {
        var _this$getContractInst, nameGetter, symbolGetter, decimalsGetter, _ref4, name, symbol, decimals;

        return runtime_1.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!(token.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase())) {
                  _context3.next = 2;
                  break;
                }

                return _context3.abrupt("return", {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                  address: token
                });

              case 2:
                if (!(token.toLowerCase() === '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2'.toLowerCase())) {
                  _context3.next = 4;
                  break;
                }

                return _context3.abrupt("return", {
                  name: 'Maker',
                  symbol: 'MKR',
                  decimals: 18,
                  address: token
                });

              case 4:
                _this$getContractInst = _this.getContractInstance(token), nameGetter = _this$getContractInst.name, symbolGetter = _this$getContractInst.symbol, decimalsGetter = _this$getContractInst.decimals;
                _context3.next = 7;
                return Promise.all([nameGetter(), symbolGetter(), decimalsGetter()]);

              case 7:
                _ref4 = _context3.sent;
                name = _ref4[0];
                symbol = _ref4[1];
                decimals = _ref4[2];
                return _context3.abrupt("return", {
                  name: name,
                  symbol: symbol,
                  decimals: decimals,
                  address: token
                });

              case 12:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      return function (_x6) {
        return _ref3.apply(this, arguments);
      };
    }();

    _this.tokenDecimals = {};
    return _this;
  }

  return ERC20Service;
}(BaseService);

var FaucetService =
/*#__PURE__*/
function (_BaseService) {
  _inheritsLoose(FaucetService, _BaseService);

  function FaucetService(config) {
    var _this;

    _this = _BaseService.call(this, config, IMinter__factory) || this;
    var _this$config = _this.config,
        provider = _this$config.provider,
        network = _this$config.network;
    var FAUCET = commonContractAddressBetweenMarketsV2[network].FAUCET;
    _this.faucetAddress = FAUCET;

    if (enabledNetworksByService.faucet.indexOf(network) > -1) {
      _this.faucetContract = IFaucet__factory.connect(_this.faucetAddress, provider);
    }

    return _this;
  }

  var _proto = FaucetService.prototype;

  _proto.mint =
  /*#__PURE__*/
  function () {
    var _mint =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee(_ref) {
      var _this2 = this;

      var userAddress, reserve, tokenSymbol, amount, txCallback;
      return runtime_1.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              userAddress = _ref.userAddress, reserve = _ref.reserve, tokenSymbol = _ref.tokenSymbol;
              amount = mintAmountsPerToken[tokenSymbol];
              txCallback = this.generateTxCallback({
                rawTxMethod: function rawTxMethod() {
                  return _this2.faucetContract.populateTransaction.mint(reserve, amount);
                },
                from: userAddress,
                value: DEFAULT_NULL_VALUE_ON_TX
              });
              return _context.abrupt("return", [{
                tx: txCallback,
                txType: exports.eEthereumTxType.FAUCET_MINT,
                gas: this.generateTxPriceEstimation([], txCallback)
              }]);

            case 4:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function mint(_x) {
      return _mint.apply(this, arguments);
    }

    return mint;
  }();

  return FaucetService;
}(BaseService);

tslib.__decorate([FaucetValidator, tslib.__param(0, IsEthAddress('userAddress')), tslib.__param(0, IsEthAddress('reserve')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], FaucetService.prototype, "mint", null);

var LTAMigratorService =
/*#__PURE__*/
function (_BaseService) {
  _inheritsLoose(LTAMigratorService, _BaseService);

  function LTAMigratorService(config, erc20Service) {
    var _this;

    _this = _BaseService.call(this, config, ILendToAaveMigrator__factory) || this;
    _this.erc20Service = erc20Service;
    var network = _this.config.network;
    _this.migratorAddress = commonContractAddressBetweenMarketsV2[network].LEND_TO_AAVE_MIGRATOR;
    return _this;
  }

  var _proto = LTAMigratorService.prototype;

  _proto.migrateLendToAave =
  /*#__PURE__*/
  function () {
    var _migrateLendToAave =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee(user, amount) {
      var txs, _this$erc20Service, isApproved, approve, decimalsOf, migratorContract, lendToken, approved, decimals, convertedAmount, txCallback;

      return runtime_1.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              txs = []; // TODO: delete conditional when mainnet address

              if (!(this.config.network === exports.Network.ropsten)) {
                _context.next = 3;
                break;
              }

              return _context.abrupt("return", txs);

            case 3:
              _this$erc20Service = this.erc20Service, isApproved = _this$erc20Service.isApproved, approve = _this$erc20Service.approve, decimalsOf = _this$erc20Service.decimalsOf;
              migratorContract = this.getContractInstance(this.migratorAddress);
              _context.next = 7;
              return migratorContract.LEND();

            case 7:
              lendToken = _context.sent;
              _context.next = 10;
              return isApproved(lendToken, user, this.migratorAddress, amount);

            case 10:
              approved = _context.sent;

              if (!approved) {
                txs.push(approve(user, lendToken, this.migratorAddress, DEFAULT_APPROVE_AMOUNT));
              }

              _context.next = 14;
              return decimalsOf(lendToken);

            case 14:
              decimals = _context.sent;
              _context.next = 17;
              return parseNumber(amount, decimals);

            case 17:
              convertedAmount = _context.sent;
              txCallback = this.generateTxCallback({
                rawTxMethod: function rawTxMethod() {
                  return migratorContract.populateTransaction.migrateFromLEND(convertedAmount);
                },
                from: user
              });
              txs.push({
                txType: exports.eEthereumTxType.MIGRATION_LEND_AAVE,
                tx: txCallback,
                gas: this.generateTxPriceEstimation(txs, txCallback)
              });
              return _context.abrupt("return", txs);

            case 21:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function migrateLendToAave(_x, _x2) {
      return _migrateLendToAave.apply(this, arguments);
    }

    return migrateLendToAave;
  }();

  return LTAMigratorService;
}(BaseService);

tslib.__decorate([LTAMigratorValidator, tslib.__param(0, IsEthAddress()), tslib.__param(1, IsPositiveAmount()), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [String, String]), tslib.__metadata("design:returntype", Promise)], LTAMigratorService.prototype, "migrateLendToAave", null);

var StakingService =
/*#__PURE__*/
function (_BaseService) {
  _inheritsLoose(StakingService, _BaseService);

  function StakingService(config, erc20Service, tokenStake) {
    var _this;

    _this = _BaseService.call(this, config, IStakedToken__factory) || this;
    _this.tokenStake = tokenStake;
    _this.erc20Service = erc20Service;
    var _this$config = _this.config,
        provider = _this$config.provider,
        network = _this$config.network;
    var _distinctStakingAddre = distinctStakingAddressesBetweenTokens[_this.tokenStake][network],
        TOKEN_STAKING_ADDRESS = _distinctStakingAddre.TOKEN_STAKING_ADDRESS,
        STAKING_REWARD_TOKEN_ADDRESS = _distinctStakingAddre.STAKING_REWARD_TOKEN_ADDRESS,
        STAKING_HELPER_ADDRESS = _distinctStakingAddre.STAKING_HELPER_ADDRESS,
        canUsePermit = _distinctStakingAddre.canUsePermit;
    _this.stakingContractAddress = TOKEN_STAKING_ADDRESS;
    _this.stakingRewardTokenContractAddress = STAKING_REWARD_TOKEN_ADDRESS;
    _this.stakingHelperContractAddress = STAKING_HELPER_ADDRESS;
    _this.canUsePermit = canUsePermit;

    if (_this.canUsePermit) {
      _this.stakingHelperContract = IAaveStakingHelper__factory.connect(STAKING_HELPER_ADDRESS, provider);
    }

    return _this;
  }

  var _proto = StakingService.prototype;

  _proto.signStaking =
  /*#__PURE__*/
  function () {
    var _signStaking =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee(user, amount, nonce) {
      var getTokenData, stakingContract, stakedToken, _ref, name, decimals, convertedAmount, typeData;

      return runtime_1.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (this.canUsePermit) {
                _context.next = 2;
                break;
              }

              return _context.abrupt("return", '');

            case 2:
              getTokenData = this.erc20Service.getTokenData;
              stakingContract = this.getContractInstance(this.stakingContractAddress);
              _context.next = 6;
              return stakingContract.STAKED_TOKEN();

            case 6:
              stakedToken = _context.sent;
              _context.next = 9;
              return getTokenData(stakedToken);

            case 9:
              _ref = _context.sent;
              name = _ref.name;
              decimals = _ref.decimals;
              convertedAmount = parseNumber(amount, decimals);
              typeData = {
                types: {
                  EIP712Domain: [{
                    name: 'name',
                    type: 'string'
                  }, {
                    name: 'version',
                    type: 'string'
                  }, {
                    name: 'chainId',
                    type: 'uint256'
                  }, {
                    name: 'verifyingContract',
                    type: 'address'
                  }],
                  Permit: [{
                    name: 'owner',
                    type: 'address'
                  }, {
                    name: 'spender',
                    type: 'address'
                  }, {
                    name: 'value',
                    type: 'uint256'
                  }, {
                    name: 'nonce',
                    type: 'uint256'
                  }, {
                    name: 'deadline',
                    type: 'uint256'
                  }]
                },
                primaryType: 'Permit',
                domain: {
                  name: name,
                  version: '1',
                  chainId: exports.ChainId[this.config.network],
                  verifyingContract: stakedToken
                },
                message: {
                  owner: user,
                  spender: this.stakingHelperContractAddress,
                  value: convertedAmount,
                  nonce: nonce,
                  deadline: ethers.constants.MaxUint256.toString()
                }
              };
              return _context.abrupt("return", JSON.stringify(typeData));

            case 15:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function signStaking(_x, _x2, _x3) {
      return _signStaking.apply(this, arguments);
    }

    return signStaking;
  }();

  _proto.stakeWithPermit =
  /*#__PURE__*/
  function () {
    var _stakeWithPermit =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee2(user, amount, signature) {
      var _this2 = this;

      var txs, decimalsOf, stakingContract, stakedToken, stakedTokenDecimals, convertedAmount, sig, txCallback;
      return runtime_1.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (this.canUsePermit) {
                _context2.next = 2;
                break;
              }

              return _context2.abrupt("return", []);

            case 2:
              txs = [];
              decimalsOf = this.erc20Service.decimalsOf;
              stakingContract = this.getContractInstance(this.stakingContractAddress);
              _context2.next = 7;
              return stakingContract.STAKED_TOKEN();

            case 7:
              stakedToken = _context2.sent;
              _context2.next = 10;
              return decimalsOf(stakedToken);

            case 10:
              stakedTokenDecimals = _context2.sent;
              convertedAmount = parseNumber(amount, stakedTokenDecimals);
              sig = ethers.utils.splitSignature(signature);
              txCallback = this.generateTxCallback({
                rawTxMethod: function rawTxMethod() {
                  return _this2.stakingHelperContract.populateTransaction.stake(user, convertedAmount, sig.v, sig.r, sig.s);
                },
                from: user
              });
              txs.push({
                tx: txCallback,
                txType: exports.eEthereumTxType.STAKE_ACTION,
                gas: this.generateTxPriceEstimation(txs, txCallback)
              });
              return _context2.abrupt("return", txs);

            case 16:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function stakeWithPermit(_x4, _x5, _x6) {
      return _stakeWithPermit.apply(this, arguments);
    }

    return stakeWithPermit;
  }();

  _proto.stake =
  /*#__PURE__*/
  function () {
    var _stake =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee3(user, amount, onBehalfOf) {
      var txs, _this$erc20Service, decimalsOf, isApproved, approve, stakingContract, stakedToken, stakedTokenDecimals, convertedAmount, approved, approveTx, txCallback;

      return runtime_1.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              txs = [];
              _this$erc20Service = this.erc20Service, decimalsOf = _this$erc20Service.decimalsOf, isApproved = _this$erc20Service.isApproved, approve = _this$erc20Service.approve;
              stakingContract = this.getContractInstance(this.stakingContractAddress);
              _context3.next = 5;
              return stakingContract.STAKED_TOKEN();

            case 5:
              stakedToken = _context3.sent;
              _context3.next = 8;
              return decimalsOf(stakedToken);

            case 8:
              stakedTokenDecimals = _context3.sent;
              convertedAmount = parseNumber(amount, stakedTokenDecimals);
              _context3.next = 12;
              return isApproved(stakedToken, user, this.stakingContractAddress, amount);

            case 12:
              approved = _context3.sent;

              if (!approved) {
                approveTx = approve(user, stakedToken, this.stakingContractAddress, DEFAULT_APPROVE_AMOUNT);
                txs.push(approveTx);
              }

              txCallback = this.generateTxCallback({
                rawTxMethod: function rawTxMethod() {
                  return stakingContract.populateTransaction.stake(onBehalfOf || user, convertedAmount);
                },
                from: user
              });
              txs.push({
                tx: txCallback,
                txType: exports.eEthereumTxType.STAKE_ACTION,
                gas: this.generateTxPriceEstimation(txs, txCallback)
              });
              return _context3.abrupt("return", txs);

            case 17:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    function stake(_x7, _x8, _x9) {
      return _stake.apply(this, arguments);
    }

    return stake;
  }();

  _proto.redeem =
  /*#__PURE__*/
  function () {
    var _redeem =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee4(user, amount) {
      var convertedAmount, stakingContract, decimalsOf, stakedToken, stakedTokenDecimals, txCallback;
      return runtime_1.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              stakingContract = this.getContractInstance(this.stakingContractAddress);

              if (!(amount === '-1')) {
                _context4.next = 5;
                break;
              }

              convertedAmount = MAX_UINT_AMOUNT;
              _context4.next = 13;
              break;

            case 5:
              decimalsOf = this.erc20Service.decimalsOf;
              _context4.next = 8;
              return stakingContract.STAKED_TOKEN();

            case 8:
              stakedToken = _context4.sent;
              _context4.next = 11;
              return decimalsOf(stakedToken);

            case 11:
              stakedTokenDecimals = _context4.sent;
              convertedAmount = parseNumber(amount, stakedTokenDecimals);

            case 13:
              txCallback = this.generateTxCallback({
                rawTxMethod: function rawTxMethod() {
                  return stakingContract.populateTransaction.redeem(user, convertedAmount);
                },
                from: user,
                gasSurplus: 20
              });
              return _context4.abrupt("return", [{
                tx: txCallback,
                txType: exports.eEthereumTxType.STAKE_ACTION,
                gas: this.generateTxPriceEstimation([], txCallback)
              }]);

            case 15:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    function redeem(_x10, _x11) {
      return _redeem.apply(this, arguments);
    }

    return redeem;
  }();

  _proto.cooldown =
  /*#__PURE__*/
  function () {
    var _cooldown =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee5(user) {
      var stakingContract, txCallback;
      return runtime_1.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              stakingContract = this.getContractInstance(this.stakingContractAddress);
              txCallback = this.generateTxCallback({
                rawTxMethod: function rawTxMethod() {
                  return stakingContract.populateTransaction.cooldown();
                },
                from: user
              });
              return _context5.abrupt("return", [{
                tx: txCallback,
                txType: exports.eEthereumTxType.STAKE_ACTION,
                gas: this.generateTxPriceEstimation([], txCallback)
              }]);

            case 3:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }));

    function cooldown(_x12) {
      return _cooldown.apply(this, arguments);
    }

    return cooldown;
  }();

  _proto.claimRewards =
  /*#__PURE__*/
  function () {
    var _claimRewards =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee6(user, amount) {
      var convertedAmount, stakingContract, decimalsOf, stakedToken, stakedTokenDecimals, txCallback;
      return runtime_1.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              stakingContract = this.getContractInstance(this.stakingContractAddress);

              if (!(amount === '-1')) {
                _context6.next = 5;
                break;
              }

              convertedAmount = MAX_UINT_AMOUNT;
              _context6.next = 13;
              break;

            case 5:
              decimalsOf = this.erc20Service.decimalsOf;
              _context6.next = 8;
              return stakingContract.REWARD_TOKEN();

            case 8:
              stakedToken = _context6.sent;
              _context6.next = 11;
              return decimalsOf(stakedToken);

            case 11:
              stakedTokenDecimals = _context6.sent;
              convertedAmount = parseNumber(amount, stakedTokenDecimals);

            case 13:
              txCallback = this.generateTxCallback({
                rawTxMethod: function rawTxMethod() {
                  return stakingContract.populateTransaction.claimRewards(user, convertedAmount);
                },
                from: user,
                gasSurplus: 20
              });
              return _context6.abrupt("return", [{
                tx: txCallback,
                txType: exports.eEthereumTxType.STAKE_ACTION,
                gas: this.generateTxPriceEstimation([], txCallback)
              }]);

            case 15:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6, this);
    }));

    function claimRewards(_x13, _x14) {
      return _claimRewards.apply(this, arguments);
    }

    return claimRewards;
  }();

  return StakingService;
}(BaseService);

tslib.__decorate([StakingValidator, tslib.__param(0, IsEthAddress()), tslib.__param(1, IsPositiveAmount()), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [String, String, String]), tslib.__metadata("design:returntype", Promise)], StakingService.prototype, "signStaking", null);

tslib.__decorate([StakingValidator, tslib.__param(0, IsEthAddress()), tslib.__param(1, IsPositiveAmount()), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [String, String, String]), tslib.__metadata("design:returntype", Promise)], StakingService.prototype, "stakeWithPermit", null);

tslib.__decorate([StakingValidator, tslib.__param(0, IsEthAddress()), tslib.__param(1, IsPositiveAmount()), tslib.__param(2, Optional), tslib.__param(2, IsEthAddress()), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [String, String, String]), tslib.__metadata("design:returntype", Promise)], StakingService.prototype, "stake", null);

tslib.__decorate([StakingValidator, tslib.__param(0, IsEthAddress()), tslib.__param(1, IsPositiveOrMinusOneAmount()), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [String, String]), tslib.__metadata("design:returntype", Promise)], StakingService.prototype, "redeem", null);

tslib.__decorate([StakingValidator, tslib.__param(0, IsEthAddress()), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [String]), tslib.__metadata("design:returntype", Promise)], StakingService.prototype, "cooldown", null);

tslib.__decorate([StakingValidator, tslib.__param(0, IsEthAddress()), tslib.__param(1, IsPositiveOrMinusOneAmount()), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [String, String]), tslib.__metadata("design:returntype", Promise)], StakingService.prototype, "claimRewards", null);

var SynthetixService =
/*#__PURE__*/
function (_BaseService) {
  _inheritsLoose(SynthetixService, _BaseService);

  function SynthetixService(config) {
    var _this;

    _this = _BaseService.call(this, config, ISynthetix__factory) || this;

    _this.synthetixValidation =
    /*#__PURE__*/
    function () {
      var _ref = _asyncToGenerator(
      /*#__PURE__*/
      runtime_1.mark(function _callee(userAddress, reserve, amount) {
        var synthAddress;
        return runtime_1.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                synthAddress = commonContractAddressBetweenMarketsV2[_this.config.network].SYNTHETIX_PROXY_ADDRESS;

                if (!(reserve.toUpperCase() === synthAddress.toUpperCase())) {
                  _context.next = 3;
                  break;
                }

                return _context.abrupt("return", _this.isSnxTransferable(userAddress, amount));

              case 3:
                return _context.abrupt("return", true);

              case 4:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      return function (_x, _x2, _x3) {
        return _ref.apply(this, arguments);
      };
    }();

    _this.isSnxTransferable =
    /*#__PURE__*/
    function () {
      var _ref2 = _asyncToGenerator(
      /*#__PURE__*/
      runtime_1.mark(function _callee2(userAddress, amount) {
        var synthContract, transferableAmount;
        return runtime_1.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                synthContract = _this.getContractInstance(commonContractAddressBetweenMarketsV2[_this.config.network].SYNTHETIX_PROXY_ADDRESS);
                _context2.next = 3;
                return synthContract.transferableSynthetix(userAddress);

              case 3:
                transferableAmount = _context2.sent;
                return _context2.abrupt("return", ethers.BigNumber.from(amount).lte(transferableAmount));

              case 5:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      return function (_x4, _x5) {
        return _ref2.apply(this, arguments);
      };
    }();

    return _this;
  }

  return SynthetixService;
}(BaseService);

var IncentivesController =
/*#__PURE__*/
function (_BaseService) {
  _inheritsLoose(IncentivesController, _BaseService);

  function IncentivesController(config) {
    var _this;

    _this = _BaseService.call(this, config, IAaveIncentivesController__factory) || this;
    var network = _this.config.network;
    var addresses = commonContractAddressBetweenMarketsV2[network];
    _this.incentivesControllerAddress = addresses.INCENTIVES_CONTROLLER;
    _this.incentivesControllerRewardTokenAddress = addresses.INCENTIVES_CONTROLLER_REWARD_TOKEN;
    return _this;
  }

  var _proto = IncentivesController.prototype;

  _proto.claimRewards = function claimRewards(_ref) {
    var user = _ref.user,
        assets = _ref.assets,
        to = _ref.to;
    var incentivesContract = this.getContractInstance(this.incentivesControllerAddress);
    var txCallback = this.generateTxCallback({
      rawTxMethod: function rawTxMethod() {
        return incentivesContract.populateTransaction.claimRewards(assets, ethers.constants.MaxUint256.toString(), to || user);
      },
      from: user
    });
    return [{
      tx: txCallback,
      txType: exports.eEthereumTxType.REWARD_ACTION,
      gas: this.generateTxPriceEstimation([], txCallback)
    }];
  };

  return IncentivesController;
}(BaseService);

tslib.__decorate([IncentivesValidator, tslib.__param(0, IsEthAddress('user')) // @IsEthAddressArray('assets')
, tslib.__param(0, IsEthAddress('to')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Array)], IncentivesController.prototype, "claimRewards", null);

var BaseTxBuilder = function BaseTxBuilder(network, injectedProvider, defaultProviderKeys) {
  var _this = this;

  if (network === void 0) {
    network = exports.Network.mainnet;
  }

  this.getStaking = function (stake) {
    var stakeToken = stake || exports.Stake.Aave;

    if (!_this.stakings[stakeToken]) {
      _this.stakings[stakeToken] = new StakingService(_this.configuration, _this.erc20Service, stakeToken);
    }

    return _this.stakings[stakeToken];
  };

  var provider; // TODO: this is probably not enough as we use network down the road

  var chainId = exports.ChainId[network];

  if (!injectedProvider) {
    if (defaultProviderKeys && Object.keys(defaultProviderKeys).length > 1) {
      provider = ethers.ethers.getDefaultProvider(network, defaultProviderKeys);
    } else {
      provider = ethers.ethers.getDefaultProvider(network);
      console.log("These API keys are a provided as a community resource by the backend services for low-traffic projects and for early prototyping.\n          It is highly recommended to use own keys: https://docs.ethers.io/v5/api-keys/");
    }
  } else if (typeof injectedProvider === 'string') {
    provider = new ethers.providers.StaticJsonRpcProvider(injectedProvider, chainId);
  } else if (injectedProvider instanceof ethers.providers.Web3Provider || injectedProvider instanceof ethers.providers.StaticJsonRpcProvider) {
    provider = injectedProvider;
  } else {
    provider = new ethers.providers.Web3Provider(injectedProvider, chainId);
  }

  this.configuration = {
    network: network,
    provider: provider
  };
  this.erc20Service = new ERC20Service(this.configuration);
  this.synthetixService = new SynthetixService(this.configuration);
  this.ltaMigratorService = new LTAMigratorService(this.configuration, this.erc20Service);
  this.faucetService = new FaucetService(this.configuration);
  this.incentiveService = new IncentivesController(this.configuration);
  this.stakings = {};
};

var WETHGatewayService =
/*#__PURE__*/
function (_BaseService) {
  _inheritsLoose(WETHGatewayService, _BaseService);

  function WETHGatewayService(config, baseDebtTokenService, erc20Service) {
    var _this;

    _this = _BaseService.call(this, config, IWETHGateway__factory) || this;
    _this.config = config;
    _this.baseDebtTokenService = baseDebtTokenService;
    _this.erc20Service = erc20Service;
    var network = _this.config.network;
    var WETH_GATEWAY = commonContractAddressBetweenMarketsV2[network].WETH_GATEWAY;
    _this.wethGatewayAddress = WETH_GATEWAY;
    return _this;
  }

  var _proto = WETHGatewayService.prototype;

  _proto.depositETH =
  /*#__PURE__*/
  function () {
    var _depositETH =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee(_ref) {
      var lendingPool, user, amount, onBehalfOf, referralCode, convertedAmount, wethGatewayContract, txCallback;
      return runtime_1.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              lendingPool = _ref.lendingPool, user = _ref.user, amount = _ref.amount, onBehalfOf = _ref.onBehalfOf, referralCode = _ref.referralCode;
              convertedAmount = parseNumber(amount, 18);
              wethGatewayContract = this.getContractInstance(this.wethGatewayAddress);
              txCallback = this.generateTxCallback({
                rawTxMethod: function rawTxMethod() {
                  return wethGatewayContract.populateTransaction.depositETH(lendingPool, onBehalfOf || user, referralCode || '0');
                },
                from: user,
                value: convertedAmount
              });
              return _context.abrupt("return", [{
                tx: txCallback,
                txType: exports.eEthereumTxType.DLP_ACTION,
                gas: this.generateTxPriceEstimation([], txCallback)
              }]);

            case 5:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function depositETH(_x) {
      return _depositETH.apply(this, arguments);
    }

    return depositETH;
  }();

  _proto.borrowETH =
  /*#__PURE__*/
  function () {
    var _borrowETH =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee2(_ref2) {
      var lendingPool, user, amount, debtTokenAddress, interestRateMode, referralCode, txs, convertedAmount, numericRateMode, delegationApproved, approveDelegationTx, wethGatewayContract, txCallback;
      return runtime_1.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              lendingPool = _ref2.lendingPool, user = _ref2.user, amount = _ref2.amount, debtTokenAddress = _ref2.debtTokenAddress, interestRateMode = _ref2.interestRateMode, referralCode = _ref2.referralCode;
              txs = [];
              convertedAmount = parseNumber(amount, 18);
              numericRateMode = interestRateMode === exports.InterestRate.Variable ? 2 : 1;
              _context2.next = 6;
              return this.baseDebtTokenService.isDelegationApproved(debtTokenAddress, user, this.wethGatewayAddress, amount);

            case 6:
              delegationApproved = _context2.sent;

              if (!delegationApproved) {
                approveDelegationTx = this.baseDebtTokenService.approveDelegation(user, this.wethGatewayAddress, debtTokenAddress, ethers.constants.MaxUint256.toString());
                txs.push(approveDelegationTx);
              }

              wethGatewayContract = this.getContractInstance(this.wethGatewayAddress);
              txCallback = this.generateTxCallback({
                rawTxMethod: function rawTxMethod() {
                  return wethGatewayContract.populateTransaction.borrowETH(lendingPool, convertedAmount, numericRateMode, referralCode || '0');
                },
                from: user
              });
              txs.push({
                tx: txCallback,
                txType: exports.eEthereumTxType.DLP_ACTION,
                gas: this.generateTxPriceEstimation(txs, txCallback, exports.ProtocolAction.borrowETH)
              });
              return _context2.abrupt("return", txs);

            case 12:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function borrowETH(_x2) {
      return _borrowETH.apply(this, arguments);
    }

    return borrowETH;
  }();

  _proto.withdrawETH =
  /*#__PURE__*/
  function () {
    var _withdrawETH =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee3(_ref3) {
      var lendingPool, user, amount, onBehalfOf, aTokenAddress, txs, _this$erc20Service, isApproved, approve, convertedAmount, approved, approveTx, wethGatewayContract, txCallback;

      return runtime_1.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              lendingPool = _ref3.lendingPool, user = _ref3.user, amount = _ref3.amount, onBehalfOf = _ref3.onBehalfOf, aTokenAddress = _ref3.aTokenAddress;
              txs = [];
              _this$erc20Service = this.erc20Service, isApproved = _this$erc20Service.isApproved, approve = _this$erc20Service.approve;
              convertedAmount = amount === '-1' ? ethers.constants.MaxUint256.toString() : parseNumber(amount, 18);
              _context3.next = 6;
              return isApproved(aTokenAddress, user, this.wethGatewayAddress, amount);

            case 6:
              approved = _context3.sent;

              if (!approved) {
                approveTx = approve(user, aTokenAddress, this.wethGatewayAddress, ethers.constants.MaxUint256.toString());
                txs.push(approveTx);
              }

              wethGatewayContract = this.getContractInstance(this.wethGatewayAddress);
              txCallback = this.generateTxCallback({
                rawTxMethod: function rawTxMethod() {
                  return wethGatewayContract.populateTransaction.withdrawETH(lendingPool, convertedAmount, onBehalfOf || user);
                },
                from: user
              });
              txs.push({
                tx: txCallback,
                txType: exports.eEthereumTxType.DLP_ACTION,
                gas: this.generateTxPriceEstimation(txs, txCallback, exports.ProtocolAction.withdrawETH)
              });
              return _context3.abrupt("return", txs);

            case 12:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    function withdrawETH(_x3) {
      return _withdrawETH.apply(this, arguments);
    }

    return withdrawETH;
  }();

  _proto.repayETH =
  /*#__PURE__*/
  function () {
    var _repayETH =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee4(_ref4) {
      var lendingPool, user, amount, interestRateMode, onBehalfOf, convertedAmount, numericRateMode, wethGatewayContract, txCallback;
      return runtime_1.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              lendingPool = _ref4.lendingPool, user = _ref4.user, amount = _ref4.amount, interestRateMode = _ref4.interestRateMode, onBehalfOf = _ref4.onBehalfOf;
              convertedAmount = parseNumber(amount, 18);
              numericRateMode = interestRateMode === exports.InterestRate.Variable ? 2 : 1;
              wethGatewayContract = this.getContractInstance(this.wethGatewayAddress);
              txCallback = this.generateTxCallback({
                rawTxMethod: function rawTxMethod() {
                  return wethGatewayContract.populateTransaction.repayETH(lendingPool, convertedAmount, numericRateMode, onBehalfOf || user);
                },
                gasSurplus: 30,
                from: user,
                value: convertedAmount
              });
              return _context4.abrupt("return", [{
                tx: txCallback,
                txType: exports.eEthereumTxType.DLP_ACTION,
                gas: this.generateTxPriceEstimation([], txCallback)
              }]);

            case 6:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    function repayETH(_x4) {
      return _repayETH.apply(this, arguments);
    }

    return repayETH;
  }();

  return WETHGatewayService;
}(BaseService);

tslib.__decorate([WETHValidator, tslib.__param(0, IsEthAddress('lendingPool')), tslib.__param(0, IsEthAddress('user')), tslib.__param(0, IsEthAddress('onBehalfOf')), tslib.__param(0, IsPositiveAmount('amount')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], WETHGatewayService.prototype, "depositETH", null);

tslib.__decorate([WETHValidator, tslib.__param(0, IsEthAddress('lendingPool')), tslib.__param(0, IsEthAddress('user')), tslib.__param(0, IsPositiveAmount('amount')), tslib.__param(0, IsEthAddress('debtTokenAddress')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], WETHGatewayService.prototype, "borrowETH", null);

tslib.__decorate([WETHValidator, tslib.__param(0, IsEthAddress('lendingPool')), tslib.__param(0, IsEthAddress('user')), tslib.__param(0, IsEthAddress('onBehalfOf')), tslib.__param(0, IsPositiveOrMinusOneAmount('amount')), tslib.__param(0, IsEthAddress('aTokenAddress')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], WETHGatewayService.prototype, "withdrawETH", null);

tslib.__decorate([WETHValidator, tslib.__param(0, IsEthAddress('lendingPool')), tslib.__param(0, IsEthAddress('user')), tslib.__param(0, IsEthAddress('onBehalfOf')), tslib.__param(0, IsPositiveAmount('amount')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], WETHGatewayService.prototype, "repayETH", null);

var BaseDebtToken =
/*#__PURE__*/
function (_BaseService) {
  _inheritsLoose(BaseDebtToken, _BaseService);

  function BaseDebtToken(config, erc20Service) {
    var _this;

    _this = _BaseService.call(this, config, IDebtTokenBase__factory) || this;
    _this.erc20Service = erc20Service;
    return _this;
  }

  var _proto = BaseDebtToken.prototype;

  _proto.approveDelegation = function approveDelegation(user, delegatee, debtTokenAddress, amount) {
    var debtTokenContract = this.getContractInstance(debtTokenAddress);
    var txCallback = this.generateTxCallback({
      rawTxMethod: function rawTxMethod() {
        return debtTokenContract.populateTransaction.approveDelegation(delegatee, amount);
      },
      from: user
    });
    return {
      tx: txCallback,
      txType: exports.eEthereumTxType.ERC20_APPROVAL,
      gas: this.generateTxPriceEstimation([], txCallback)
    };
  };

  _proto.isDelegationApproved =
  /*#__PURE__*/
  function () {
    var _isDelegationApproved =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee(debtTokenAddress, allowanceGiver, allowanceReceiver, amount) {
      var decimals, debtTokenContract, delegatedAllowance, amountBNWithDecimals;
      return runtime_1.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return this.erc20Service.decimalsOf(debtTokenAddress);

            case 2:
              decimals = _context.sent;
              debtTokenContract = this.getContractInstance(debtTokenAddress);
              _context.next = 6;
              return debtTokenContract.borrowAllowance(allowanceGiver, allowanceReceiver);

            case 6:
              delegatedAllowance = _context.sent;
              amountBNWithDecimals = ethers.BigNumber.from(parseNumber(amount, decimals));
              return _context.abrupt("return", delegatedAllowance.gt(amountBNWithDecimals));

            case 9:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function isDelegationApproved(_x, _x2, _x3, _x4) {
      return _isDelegationApproved.apply(this, arguments);
    }

    return isDelegationApproved;
  }();

  return BaseDebtToken;
}(BaseService);

var RepayWithCollateralAdapterService =
/*#__PURE__*/
function (_BaseService) {
  _inheritsLoose(RepayWithCollateralAdapterService, _BaseService);

  function RepayWithCollateralAdapterService(config) {
    var _this;

    _this = _BaseService.call(this, config, IRepayWithCollateral__factory) || this;
    var REPAY_WITH_COLLATERAL_ADAPTER = commonContractAddressBetweenMarketsV2[_this.config.network].REPAY_WITH_COLLATERAL_ADAPTER;
    _this.repayWithCollateralAddress = REPAY_WITH_COLLATERAL_ADAPTER;
    return _this;
  }

  var _proto = RepayWithCollateralAdapterService.prototype;

  _proto.swapAndRepay = function swapAndRepay(_ref) {
    var user = _ref.user,
        collateralAsset = _ref.collateralAsset,
        debtAsset = _ref.debtAsset,
        collateralAmount = _ref.collateralAmount,
        debtRepayAmount = _ref.debtRepayAmount,
        debtRateMode = _ref.debtRateMode,
        permit = _ref.permit,
        useEthPath = _ref.useEthPath;
    var repayWithCollateralContract = this.getContractInstance(this.repayWithCollateralAddress);
    var txCallback = this.generateTxCallback({
      rawTxMethod: function rawTxMethod() {
        return repayWithCollateralContract.populateTransaction.swapAndRepay(collateralAsset, debtAsset, collateralAmount, debtRepayAmount, debtRateMode, permit, useEthPath || false);
      },
      from: user
    });
    return {
      tx: txCallback,
      txType: exports.eEthereumTxType.DLP_ACTION,
      gas: this.generateTxPriceEstimation([], txCallback)
    };
  };

  return RepayWithCollateralAdapterService;
}(BaseService);

tslib.__decorate([RepayWithCollateralValidator, tslib.__param(0, IsEthAddress('user')), tslib.__param(0, IsEthAddress('collateralAsset')), tslib.__param(0, IsEthAddress('debtAsset')), tslib.__param(0, IsPositiveAmount('collateralAmount')), tslib.__param(0, IsPositiveAmount('debtRepayAmount')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Object)], RepayWithCollateralAdapterService.prototype, "swapAndRepay", null);

(function (ExecutorType) {
  ExecutorType[ExecutorType["Short"] = 0] = "Short";
  ExecutorType[ExecutorType["Long"] = 1] = "Long";
})(exports.ExecutorType || (exports.ExecutorType = {}));

(function (ProposalState) {
  ProposalState["Pending"] = "Pending";
  ProposalState["Canceled"] = "Canceled";
  ProposalState["Active"] = "Active";
  ProposalState["Failed"] = "Failed";
  ProposalState["Succeeded"] = "Succeeded";
  ProposalState["Queued"] = "Queued";
  ProposalState["Expired"] = "Expired";
  ProposalState["Executed"] = "Executed";
})(exports.ProposalState || (exports.ProposalState = {}));

var ipfsEndpoint = 'https://cloudflare-ipfs.com/ipfs';
function getLink(hash) {
  return ipfsEndpoint + "/" + hash;
}
var MEMORIZE = {};
function getProposalMetadata(_x) {
  return _getProposalMetadata.apply(this, arguments);
}

function _getProposalMetadata() {
  _getProposalMetadata = _asyncToGenerator(
  /*#__PURE__*/
  runtime_1.mark(function _callee(hash) {
    var ipfsHash, _ref, data;

    return runtime_1.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            ipfsHash = utils.base58.encode(Buffer.from("1220" + hash.slice(2), 'hex'));

            if (!MEMORIZE[ipfsHash]) {
              _context.next = 3;
              break;
            }

            return _context.abrupt("return", MEMORIZE[ipfsHash]);

          case 3:
            _context.prev = 3;
            _context.next = 6;
            return axios.get(getLink(ipfsHash), {
              timeout: 2000
            });

          case 6:
            _ref = _context.sent;
            data = _ref.data;

            if (data != null && data.title) {
              _context.next = 10;
              break;
            }

            throw Error('Missing title field at proposal metadata.');

          case 10:
            if (data != null && data.description) {
              _context.next = 12;
              break;
            }

            throw Error('Missing description field at proposal metadata.');

          case 12:
            if (data != null && data.shortDescription) {
              _context.next = 14;
              break;
            }

            throw Error('Missing shortDescription field at proposal metadata.');

          case 14:
            MEMORIZE[ipfsHash] = {
              ipfsHash: ipfsHash,
              title: data.title,
              description: data.description,
              shortDescription: data.shortDescription
            };
            return _context.abrupt("return", MEMORIZE[ipfsHash]);

          case 18:
            _context.prev = 18;
            _context.t0 = _context["catch"](3);
            console.error("@aave/protocol-js: IPFS fetch Error: " + _context.t0.message);
            return _context.abrupt("return", {
              ipfsHash: ipfsHash,
              title: "Proposal - " + ipfsHash,
              description: "Proposal with invalid metadata format or IPFS gateway is down",
              shortDescription: "Proposal with invalid metadata format or IPFS gateway is down"
            });

          case 22:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[3, 18]]);
  }));
  return _getProposalMetadata.apply(this, arguments);
}

var parseProposal =
/*#__PURE__*/
function () {
  var _ref =
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  runtime_1.mark(function _callee(rawProposal) {
    var id, creator, executor, targets, values, signatures, calldatas, withDelegatecalls, startBlock, endBlock, executionTime, forVotes, againstVotes, executed, canceled, strategy, ipfsHex, totalVotingSupply, minimumQuorum, minimumDiff, executionTimeWithGracePeriod, proposalCreated, proposalState, proposalMetadata, proposal;
    return runtime_1.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            id = rawProposal.id, creator = rawProposal.creator, executor = rawProposal.executor, targets = rawProposal.targets, values = rawProposal.values, signatures = rawProposal.signatures, calldatas = rawProposal.calldatas, withDelegatecalls = rawProposal.withDelegatecalls, startBlock = rawProposal.startBlock, endBlock = rawProposal.endBlock, executionTime = rawProposal.executionTime, forVotes = rawProposal.forVotes, againstVotes = rawProposal.againstVotes, executed = rawProposal.executed, canceled = rawProposal.canceled, strategy = rawProposal.strategy, ipfsHex = rawProposal.ipfsHash, totalVotingSupply = rawProposal.totalVotingSupply, minimumQuorum = rawProposal.minimumQuorum, minimumDiff = rawProposal.minimumDiff, executionTimeWithGracePeriod = rawProposal.executionTimeWithGracePeriod, proposalCreated = rawProposal.proposalCreated, proposalState = rawProposal.proposalState;
            _context.next = 3;
            return getProposalMetadata(ipfsHex);

          case 3:
            proposalMetadata = _context.sent;
            proposal = {
              id: Number(id.toString()),
              creator: creator,
              executor: executor,
              targets: targets,
              values: values,
              signatures: signatures,
              calldatas: calldatas,
              withDelegatecalls: withDelegatecalls,
              startBlock: Number(startBlock.toString()),
              endBlock: Number(endBlock.toString()),
              executionTime: executionTime.toString(),
              forVotes: forVotes.toString(),
              againstVotes: againstVotes.toString(),
              executed: executed,
              canceled: canceled,
              strategy: strategy,
              ipfsHash: proposalMetadata.ipfsHash,
              state: Object.values(exports.ProposalState)[proposalState],
              minimumQuorum: minimumQuorum.toString(),
              minimumDiff: minimumDiff.toString(),
              executionTimeWithGracePeriod: executionTimeWithGracePeriod.toString(),
              title: proposalMetadata.title,
              description: proposalMetadata.description,
              shortDescription: proposalMetadata.shortDescription,
              proposalCreated: Number(proposalCreated.toString()),
              totalVotingSupply: totalVotingSupply.toString()
            };
            return _context.abrupt("return", proposal);

          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function parseProposal(_x) {
    return _ref.apply(this, arguments);
  };
}();

var AaveGovernanceV2Service =
/*#__PURE__*/
function (_BaseService) {
  _inheritsLoose(AaveGovernanceV2Service, _BaseService);

  function AaveGovernanceV2Service(config) {
    var _this;

    _this = _BaseService.call(this, config, IAaveGovernanceV2__factory) || this;
    _this.executors = [];
    var network = _this.config.network;
    var _aaveGovernanceV2Addr = aaveGovernanceV2Addresses[network],
        AAVE_GOVERNANCE_V2 = _aaveGovernanceV2Addr.AAVE_GOVERNANCE_V2,
        AAVE_GOVERNANCE_V2_HELPER = _aaveGovernanceV2Addr.AAVE_GOVERNANCE_V2_HELPER,
        AAVE_GOVERNANCE_V2_EXECUTOR_SHORT = _aaveGovernanceV2Addr.AAVE_GOVERNANCE_V2_EXECUTOR_SHORT,
        AAVE_GOVERNANCE_V2_EXECUTOR_LONG = _aaveGovernanceV2Addr.AAVE_GOVERNANCE_V2_EXECUTOR_LONG;
    _this.aaveGovernanceV2Address = AAVE_GOVERNANCE_V2;
    _this.aaveGovernanceV2HelperAddress = AAVE_GOVERNANCE_V2_HELPER;
    _this.executors[exports.ExecutorType.Short] = AAVE_GOVERNANCE_V2_EXECUTOR_SHORT;
    _this.executors[exports.ExecutorType.Long] = AAVE_GOVERNANCE_V2_EXECUTOR_LONG;
    return _this;
  }

  var _proto = AaveGovernanceV2Service.prototype;

  _proto.create =
  /*#__PURE__*/
  function () {
    var _create =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee2(_ref2) {
      var _this2 = this;

      var user, targets, values, signatures, calldatas, withDelegateCalls, ipfsHash, executor, txs, govContract, txCallback;
      return runtime_1.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              user = _ref2.user, targets = _ref2.targets, values = _ref2.values, signatures = _ref2.signatures, calldatas = _ref2.calldatas, withDelegateCalls = _ref2.withDelegateCalls, ipfsHash = _ref2.ipfsHash, executor = _ref2.executor;
              txs = [];
              govContract = this.getContractInstance(this.aaveGovernanceV2Address);
              txCallback = this.generateTxCallback({
                rawTxMethod: function rawTxMethod() {
                  return govContract.populateTransaction.create(_this2.executors[executor], targets, values, signatures, calldatas, withDelegateCalls, ipfsHash);
                },
                from: user
              });
              txs.push({
                tx: txCallback,
                txType: exports.eEthereumTxType.GOVERNANCE_ACTION,
                gas: this.generateTxPriceEstimation(txs, txCallback)
              });
              return _context2.abrupt("return", txs);

            case 6:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function create(_x2) {
      return _create.apply(this, arguments);
    }

    return create;
  }();

  _proto.cancel =
  /*#__PURE__*/
  function () {
    var _cancel =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee3(_ref3) {
      var user, proposalId, txs, govContract, txCallback;
      return runtime_1.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              user = _ref3.user, proposalId = _ref3.proposalId;
              txs = [];
              govContract = this.getContractInstance(this.aaveGovernanceV2Address);
              txCallback = this.generateTxCallback({
                rawTxMethod: function rawTxMethod() {
                  return govContract.populateTransaction.cancel(proposalId);
                },
                from: user
              });
              txs.push({
                tx: txCallback,
                txType: exports.eEthereumTxType.GOVERNANCE_ACTION,
                gas: this.generateTxPriceEstimation(txs, txCallback)
              });
              return _context3.abrupt("return", txs);

            case 6:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    function cancel(_x3) {
      return _cancel.apply(this, arguments);
    }

    return cancel;
  }();

  _proto.queue =
  /*#__PURE__*/
  function () {
    var _queue =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee4(_ref4) {
      var user, proposalId, txs, govContract, txCallback;
      return runtime_1.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              user = _ref4.user, proposalId = _ref4.proposalId;
              txs = [];
              govContract = this.getContractInstance(this.aaveGovernanceV2Address);
              txCallback = this.generateTxCallback({
                rawTxMethod: function rawTxMethod() {
                  return govContract.populateTransaction.queue(proposalId);
                },
                from: user
              });
              txs.push({
                tx: txCallback,
                txType: exports.eEthereumTxType.GOVERNANCE_ACTION,
                gas: this.generateTxPriceEstimation(txs, txCallback)
              });
              return _context4.abrupt("return", txs);

            case 6:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    function queue(_x4) {
      return _queue.apply(this, arguments);
    }

    return queue;
  }();

  _proto.execute =
  /*#__PURE__*/
  function () {
    var _execute =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee5(_ref5) {
      var user, proposalId, txs, govContract, txCallback;
      return runtime_1.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              user = _ref5.user, proposalId = _ref5.proposalId;
              txs = [];
              govContract = this.getContractInstance(this.aaveGovernanceV2Address);
              txCallback = this.generateTxCallback({
                rawTxMethod: function rawTxMethod() {
                  return govContract.populateTransaction.execute(proposalId);
                },
                from: user
              });
              txs.push({
                tx: txCallback,
                txType: exports.eEthereumTxType.GOVERNANCE_ACTION,
                gas: this.generateTxPriceEstimation(txs, txCallback)
              });
              return _context5.abrupt("return", txs);

            case 6:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }));

    function execute(_x5) {
      return _execute.apply(this, arguments);
    }

    return execute;
  }();

  _proto.submitVote =
  /*#__PURE__*/
  function () {
    var _submitVote =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee6(_ref6) {
      var user, proposalId, support, txs, govContract, txCallback;
      return runtime_1.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              user = _ref6.user, proposalId = _ref6.proposalId, support = _ref6.support;
              txs = [];
              govContract = this.getContractInstance(this.aaveGovernanceV2Address);
              txCallback = this.generateTxCallback({
                rawTxMethod: function rawTxMethod() {
                  return govContract.populateTransaction.submitVote(proposalId, support);
                },
                from: user
              });
              txs.push({
                tx: txCallback,
                txType: exports.eEthereumTxType.GOVERNANCE_ACTION,
                gas: this.generateTxPriceEstimation(txs, txCallback)
              });
              return _context6.abrupt("return", txs);

            case 6:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6, this);
    }));

    function submitVote(_x6) {
      return _submitVote.apply(this, arguments);
    }

    return submitVote;
  }();

  _proto.signVoting =
  /*#__PURE__*/
  function () {
    var _signVoting =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee7(_ref7) {
      var support, proposalId, typeData;
      return runtime_1.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              support = _ref7.support, proposalId = _ref7.proposalId;
              typeData = {
                types: {
                  EIP712Domain: [{
                    name: 'name',
                    type: 'string'
                  }, {
                    name: 'chainId',
                    type: 'uint256'
                  }, {
                    name: 'verifyingContract',
                    type: 'address'
                  }],
                  VoteEmitted: [{
                    name: 'id',
                    type: 'uint256'
                  }, {
                    name: 'support',
                    type: 'bool'
                  }]
                },
                primaryType: 'VoteEmitted',
                domain: {
                  name: 'Aave Governance v2',
                  chainId: exports.ChainId[this.config.network],
                  verifyingContract: this.aaveGovernanceV2Address
                },
                message: {
                  support: support,
                  id: proposalId
                }
              };
              return _context7.abrupt("return", JSON.stringify(typeData));

            case 3:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7, this);
    }));

    function signVoting(_x7) {
      return _signVoting.apply(this, arguments);
    }

    return signVoting;
  }();

  _proto.submitVoteBySignature =
  /*#__PURE__*/
  function () {
    var _submitVoteBySignature =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee8(_ref8) {
      var user, proposalId, support, signature, txs, govContract, sig, txCallback;
      return runtime_1.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              user = _ref8.user, proposalId = _ref8.proposalId, support = _ref8.support, signature = _ref8.signature;
              txs = [];
              govContract = this.getContractInstance(this.aaveGovernanceV2Address);
              sig = ethers.utils.splitSignature(signature);
              txCallback = this.generateTxCallback({
                rawTxMethod: function rawTxMethod() {
                  return govContract.populateTransaction.submitVoteBySignature(proposalId, support, sig.v, sig.r, sig.s);
                },
                from: user
              });
              txs.push({
                tx: txCallback,
                txType: exports.eEthereumTxType.GOVERNANCE_ACTION,
                gas: this.generateTxPriceEstimation(txs, txCallback)
              });
              return _context8.abrupt("return", txs);

            case 7:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8, this);
    }));

    function submitVoteBySignature(_x8) {
      return _submitVoteBySignature.apply(this, arguments);
    }

    return submitVoteBySignature;
  }();

  _proto.getProposals =
  /*#__PURE__*/
  function () {
    var _getProposals =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee10(_ref9) {
      var skip, limit, provider, helper, result, proposals;
      return runtime_1.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              skip = _ref9.skip, limit = _ref9.limit;
              provider = this.config.provider;
              helper = IGovernanceV2Helper__factory.connect(this.aaveGovernanceV2HelperAddress, provider);
              _context10.next = 5;
              return helper.getProposals(skip.toString(), limit.toString(), this.aaveGovernanceV2Address);

            case 5:
              result = _context10.sent;
              proposals = Promise.all(result.map(
              /*#__PURE__*/
              function () {
                var _ref10 = _asyncToGenerator(
                /*#__PURE__*/
                runtime_1.mark(function _callee9(rawProposal) {
                  return runtime_1.wrap(function _callee9$(_context9) {
                    while (1) {
                      switch (_context9.prev = _context9.next) {
                        case 0:
                          return _context9.abrupt("return", parseProposal(rawProposal));

                        case 1:
                        case "end":
                          return _context9.stop();
                      }
                    }
                  }, _callee9);
                }));

                return function (_x10) {
                  return _ref10.apply(this, arguments);
                };
              }()));
              return _context10.abrupt("return", proposals);

            case 8:
            case "end":
              return _context10.stop();
          }
        }
      }, _callee10, this);
    }));

    function getProposals(_x9) {
      return _getProposals.apply(this, arguments);
    }

    return getProposals;
  }();

  _proto.getProposal =
  /*#__PURE__*/
  function () {
    var _getProposal =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee11(_ref11) {
      var proposalId, provider, helper, proposal;
      return runtime_1.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              proposalId = _ref11.proposalId;
              provider = this.config.provider;
              helper = IGovernanceV2Helper__factory.connect(this.aaveGovernanceV2HelperAddress, provider);
              _context11.next = 5;
              return helper.getProposal(proposalId, this.aaveGovernanceV2Address);

            case 5:
              proposal = _context11.sent;
              return _context11.abrupt("return", parseProposal(proposal));

            case 7:
            case "end":
              return _context11.stop();
          }
        }
      }, _callee11, this);
    }));

    function getProposal(_x11) {
      return _getProposal.apply(this, arguments);
    }

    return getProposal;
  }();

  _proto.getPropositionPowerAt =
  /*#__PURE__*/
  function () {
    var _getPropositionPowerAt =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee12(_ref12) {
      var user, block, strategy, provider, proposalStrategy, power;
      return runtime_1.wrap(function _callee12$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              user = _ref12.user, block = _ref12.block, strategy = _ref12.strategy;
              provider = this.config.provider;
              proposalStrategy = IGovernanceStrategy__factory.connect(strategy, provider);
              _context12.next = 5;
              return proposalStrategy.getPropositionPowerAt(user, block.toString());

            case 5:
              power = _context12.sent;
              return _context12.abrupt("return", utils.formatEther(power));

            case 7:
            case "end":
              return _context12.stop();
          }
        }
      }, _callee12, this);
    }));

    function getPropositionPowerAt(_x12) {
      return _getPropositionPowerAt.apply(this, arguments);
    }

    return getPropositionPowerAt;
  }();

  _proto.getVotingPowerAt =
  /*#__PURE__*/
  function () {
    var _getVotingPowerAt =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee13(_ref13) {
      var user, block, strategy, provider, proposalStrategy, power;
      return runtime_1.wrap(function _callee13$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              user = _ref13.user, block = _ref13.block, strategy = _ref13.strategy;
              provider = this.config.provider;
              proposalStrategy = IGovernanceStrategy__factory.connect(strategy, provider);
              _context13.next = 5;
              return proposalStrategy.getVotingPowerAt(user, block.toString());

            case 5:
              power = _context13.sent;
              return _context13.abrupt("return", utils.formatEther(power));

            case 7:
            case "end":
              return _context13.stop();
          }
        }
      }, _callee13, this);
    }));

    function getVotingPowerAt(_x13) {
      return _getVotingPowerAt.apply(this, arguments);
    }

    return getVotingPowerAt;
  }();

  _proto.getTotalPropositionSupplyAt =
  /*#__PURE__*/
  function () {
    var _getTotalPropositionSupplyAt =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee14(_ref14) {
      var block, strategy, provider, proposalStrategy, total;
      return runtime_1.wrap(function _callee14$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              block = _ref14.block, strategy = _ref14.strategy;
              provider = this.config.provider;
              proposalStrategy = IGovernanceStrategy__factory.connect(strategy, provider);
              _context14.next = 5;
              return proposalStrategy.getTotalPropositionSupplyAt(block.toString());

            case 5:
              total = _context14.sent;
              return _context14.abrupt("return", utils.formatEther(total));

            case 7:
            case "end":
              return _context14.stop();
          }
        }
      }, _callee14, this);
    }));

    function getTotalPropositionSupplyAt(_x14) {
      return _getTotalPropositionSupplyAt.apply(this, arguments);
    }

    return getTotalPropositionSupplyAt;
  }();

  _proto.getTotalVotingSupplyAt =
  /*#__PURE__*/
  function () {
    var _getTotalVotingSupplyAt =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee15(_ref15) {
      var block, strategy, provider, proposalStrategy, total;
      return runtime_1.wrap(function _callee15$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              block = _ref15.block, strategy = _ref15.strategy;
              provider = this.config.provider;
              proposalStrategy = IGovernanceStrategy__factory.connect(strategy, provider);
              _context15.next = 5;
              return proposalStrategy.getTotalVotingSupplyAt(block.toString());

            case 5:
              total = _context15.sent;
              return _context15.abrupt("return", utils.formatEther(total));

            case 7:
            case "end":
              return _context15.stop();
          }
        }
      }, _callee15, this);
    }));

    function getTotalVotingSupplyAt(_x15) {
      return _getTotalVotingSupplyAt.apply(this, arguments);
    }

    return getTotalVotingSupplyAt;
  }();

  _proto.getTokensPower =
  /*#__PURE__*/
  function () {
    var _getTokensPower =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee16(_ref16) {
      var user, tokens, provider, helper, power;
      return runtime_1.wrap(function _callee16$(_context16) {
        while (1) {
          switch (_context16.prev = _context16.next) {
            case 0:
              user = _ref16.user, tokens = _ref16.tokens;
              provider = this.config.provider;
              helper = IGovernanceV2Helper__factory.connect(this.aaveGovernanceV2HelperAddress, provider);
              power = helper.getTokensPower(user, tokens);
              return _context16.abrupt("return", power);

            case 5:
            case "end":
              return _context16.stop();
          }
        }
      }, _callee16, this);
    }));

    function getTokensPower(_x16) {
      return _getTokensPower.apply(this, arguments);
    }

    return getTokensPower;
  }();

  _proto.getVoteOnProposal =
  /*#__PURE__*/
  function () {
    var _getVoteOnProposal =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee17(_ref17) {
      var proposalId, user, govContract;
      return runtime_1.wrap(function _callee17$(_context17) {
        while (1) {
          switch (_context17.prev = _context17.next) {
            case 0:
              proposalId = _ref17.proposalId, user = _ref17.user;
              govContract = this.getContractInstance(this.aaveGovernanceV2Address);
              return _context17.abrupt("return", govContract.getVoteOnProposal(proposalId, user));

            case 3:
            case "end":
              return _context17.stop();
          }
        }
      }, _callee17, this);
    }));

    function getVoteOnProposal(_x17) {
      return _getVoteOnProposal.apply(this, arguments);
    }

    return getVoteOnProposal;
  }();

  return AaveGovernanceV2Service;
}(BaseService);

tslib.__decorate([GovValidator, tslib.__param(0, IsEthAddress('user')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], AaveGovernanceV2Service.prototype, "create", null);

tslib.__decorate([GovValidator, tslib.__param(0, IsEthAddress('user')), tslib.__param(0, Is0OrPositiveAmount('proposalId')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], AaveGovernanceV2Service.prototype, "cancel", null);

tslib.__decorate([GovValidator, tslib.__param(0, IsEthAddress('user')), tslib.__param(0, Is0OrPositiveAmount('proposalId')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], AaveGovernanceV2Service.prototype, "queue", null);

tslib.__decorate([GovValidator, tslib.__param(0, IsEthAddress('user')), tslib.__param(0, Is0OrPositiveAmount('proposalId')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], AaveGovernanceV2Service.prototype, "execute", null);

tslib.__decorate([GovValidator, tslib.__param(0, IsEthAddress('user')), tslib.__param(0, Is0OrPositiveAmount('proposalId')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], AaveGovernanceV2Service.prototype, "submitVote", null);

tslib.__decorate([GovValidator, tslib.__param(0, Is0OrPositiveAmount('proposalId')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], AaveGovernanceV2Service.prototype, "signVoting", null);

tslib.__decorate([GovValidator, tslib.__param(0, IsEthAddress('user')), tslib.__param(0, Is0OrPositiveAmount('proposalId')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], AaveGovernanceV2Service.prototype, "submitVoteBySignature", null);

tslib.__decorate([GovValidator, tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], AaveGovernanceV2Service.prototype, "getProposals", null);

tslib.__decorate([GovValidator, tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], AaveGovernanceV2Service.prototype, "getProposal", null);

tslib.__decorate([GovValidator, tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], AaveGovernanceV2Service.prototype, "getPropositionPowerAt", null);

tslib.__decorate([GovValidator, tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], AaveGovernanceV2Service.prototype, "getVotingPowerAt", null);

tslib.__decorate([GovValidator, tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], AaveGovernanceV2Service.prototype, "getTotalPropositionSupplyAt", null);

tslib.__decorate([GovValidator, tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], AaveGovernanceV2Service.prototype, "getTotalVotingSupplyAt", null);

tslib.__decorate([GovValidator, tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], AaveGovernanceV2Service.prototype, "getTokensPower", null);

tslib.__decorate([GovValidator, tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], AaveGovernanceV2Service.prototype, "getVoteOnProposal", null);

var GovernanceDelegationTokenService =
/*#__PURE__*/
function (_BaseService) {
  _inheritsLoose(GovernanceDelegationTokenService, _BaseService);

  function GovernanceDelegationTokenService(config) {
    return _BaseService.call(this, config, IGovernancePowerDelegationToken__factory) || this;
  }

  var _proto = GovernanceDelegationTokenService.prototype;

  _proto.delegate =
  /*#__PURE__*/
  function () {
    var _delegate =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee(_ref) {
      var user, delegatee, governanceToken, txs, governanceDelegationToken, delegateeAddress, txCallback;
      return runtime_1.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              user = _ref.user, delegatee = _ref.delegatee, governanceToken = _ref.governanceToken;
              txs = [];
              governanceDelegationToken = this.getContractInstance(governanceToken);
              _context.next = 5;
              return this.getDelegateeAddress(delegatee);

            case 5:
              delegateeAddress = _context.sent;
              txCallback = this.generateTxCallback({
                rawTxMethod: function rawTxMethod() {
                  return governanceDelegationToken.populateTransaction.delegate(delegateeAddress);
                },
                from: user
              });
              txs.push({
                tx: txCallback,
                txType: exports.eEthereumTxType.GOV_DELEGATION_ACTION,
                gas: this.generateTxPriceEstimation(txs, txCallback)
              });
              return _context.abrupt("return", txs);

            case 9:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function delegate(_x) {
      return _delegate.apply(this, arguments);
    }

    return delegate;
  }();

  _proto.delegateByType =
  /*#__PURE__*/
  function () {
    var _delegateByType =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee2(_ref2) {
      var user, delegatee, delegationType, governanceToken, txs, governanceDelegationToken, delegateeAddress, txCallback;
      return runtime_1.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              user = _ref2.user, delegatee = _ref2.delegatee, delegationType = _ref2.delegationType, governanceToken = _ref2.governanceToken;
              txs = [];
              governanceDelegationToken = this.getContractInstance(governanceToken);
              _context2.next = 5;
              return this.getDelegateeAddress(delegatee);

            case 5:
              delegateeAddress = _context2.sent;
              txCallback = this.generateTxCallback({
                rawTxMethod: function rawTxMethod() {
                  return governanceDelegationToken.populateTransaction.delegateByType(delegateeAddress, delegationType);
                },
                from: user
              });
              txs.push({
                tx: txCallback,
                txType: exports.eEthereumTxType.GOV_DELEGATION_ACTION,
                gas: this.generateTxPriceEstimation(txs, txCallback)
              });
              return _context2.abrupt("return", txs);

            case 9:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function delegateByType(_x2) {
      return _delegateByType.apply(this, arguments);
    }

    return delegateByType;
  }();

  _proto.delegateBySig =
  /*#__PURE__*/
  function () {
    var _delegateBySig =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee3(_ref3) {
      var user, delegatee, expiry, signature, governanceToken, txs, governanceDelegationToken, nonce, _splitSignature, v, r, s, delegateeAddress, txCallback;

      return runtime_1.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              user = _ref3.user, delegatee = _ref3.delegatee, expiry = _ref3.expiry, signature = _ref3.signature, governanceToken = _ref3.governanceToken;
              txs = [];
              governanceDelegationToken = this.getContractInstance(governanceToken);
              _context3.next = 5;
              return this.getNonce({
                user: user,
                governanceToken: governanceToken
              });

            case 5:
              nonce = _context3.sent;
              _splitSignature = utils.splitSignature(signature), v = _splitSignature.v, r = _splitSignature.r, s = _splitSignature.s;
              _context3.next = 9;
              return this.getDelegateeAddress(delegatee);

            case 9:
              delegateeAddress = _context3.sent;
              txCallback = this.generateTxCallback({
                rawTxMethod: function rawTxMethod() {
                  return governanceDelegationToken.populateTransaction.delegateBySig(delegateeAddress, nonce, expiry, v, r, s);
                },
                from: user
              });
              txs.push({
                tx: txCallback,
                txType: exports.eEthereumTxType.GOV_DELEGATION_ACTION,
                gas: this.generateTxPriceEstimation(txs, txCallback)
              });
              return _context3.abrupt("return", txs);

            case 13:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    function delegateBySig(_x3) {
      return _delegateBySig.apply(this, arguments);
    }

    return delegateBySig;
  }();

  _proto.delegateByTypeBySig =
  /*#__PURE__*/
  function () {
    var _delegateByTypeBySig =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee4(_ref4) {
      var user, delegatee, delegationType, expiry, signature, governanceToken, txs, governanceDelegationToken, nonce, _splitSignature2, v, r, s, delegateeAddress, txCallback;

      return runtime_1.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              user = _ref4.user, delegatee = _ref4.delegatee, delegationType = _ref4.delegationType, expiry = _ref4.expiry, signature = _ref4.signature, governanceToken = _ref4.governanceToken;
              txs = [];
              governanceDelegationToken = this.getContractInstance(governanceToken);
              _context4.next = 5;
              return this.getNonce({
                user: user,
                governanceToken: governanceToken
              });

            case 5:
              nonce = _context4.sent;
              _splitSignature2 = utils.splitSignature(signature), v = _splitSignature2.v, r = _splitSignature2.r, s = _splitSignature2.s;
              _context4.next = 9;
              return this.getDelegateeAddress(delegatee);

            case 9:
              delegateeAddress = _context4.sent;
              txCallback = this.generateTxCallback({
                rawTxMethod: function rawTxMethod() {
                  return governanceDelegationToken.populateTransaction.delegateByTypeBySig(delegateeAddress, delegationType, nonce, expiry, v, r, s);
                },
                from: user
              });
              txs.push({
                tx: txCallback,
                txType: exports.eEthereumTxType.GOV_DELEGATION_ACTION,
                gas: this.generateTxPriceEstimation(txs, txCallback)
              });
              return _context4.abrupt("return", txs);

            case 13:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    function delegateByTypeBySig(_x4) {
      return _delegateByTypeBySig.apply(this, arguments);
    }

    return delegateByTypeBySig;
  }();

  _proto.prepareDelegateSignature =
  /*#__PURE__*/
  function () {
    var _prepareDelegateSignature =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee5(_ref5) {
      var delegatee, nonce, expiry, governanceTokenName, governanceToken, delegateeAddress, typeData;
      return runtime_1.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              delegatee = _ref5.delegatee, nonce = _ref5.nonce, expiry = _ref5.expiry, governanceTokenName = _ref5.governanceTokenName, governanceToken = _ref5.governanceToken;
              _context5.next = 3;
              return this.getDelegateeAddress(delegatee);

            case 3:
              delegateeAddress = _context5.sent;
              typeData = {
                types: {
                  EIP712Domain: [{
                    name: 'name',
                    type: 'string'
                  }, {
                    name: 'chainId',
                    type: 'uint256'
                  }, {
                    name: 'verifyingContract',
                    type: 'address'
                  }],
                  Delegate: [{
                    name: 'delegatee',
                    type: 'address'
                  }, {
                    name: 'nonce',
                    type: 'uint256'
                  }, {
                    name: 'expiry',
                    type: 'uint256'
                  }]
                },
                primaryType: 'Delegate',
                domain: {
                  name: governanceTokenName,
                  chainId: exports.ChainId[this.config.network],
                  verifyingContract: governanceToken
                },
                message: {
                  delegatee: delegateeAddress,
                  nonce: nonce,
                  expiry: expiry
                }
              };
              return _context5.abrupt("return", JSON.stringify(typeData));

            case 6:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }));

    function prepareDelegateSignature(_x5) {
      return _prepareDelegateSignature.apply(this, arguments);
    }

    return prepareDelegateSignature;
  }();

  _proto.prepareDelegateByTypeSignature =
  /*#__PURE__*/
  function () {
    var _prepareDelegateByTypeSignature =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee6(_ref6) {
      var delegatee, type, nonce, expiry, governanceTokenName, governanceToken, delegateeAddress, typeData;
      return runtime_1.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              delegatee = _ref6.delegatee, type = _ref6.type, nonce = _ref6.nonce, expiry = _ref6.expiry, governanceTokenName = _ref6.governanceTokenName, governanceToken = _ref6.governanceToken;
              _context6.next = 3;
              return this.getDelegateeAddress(delegatee);

            case 3:
              delegateeAddress = _context6.sent;
              typeData = {
                types: {
                  EIP712Domain: [{
                    name: 'name',
                    type: 'string'
                  }, {
                    name: 'chainId',
                    type: 'uint256'
                  }, {
                    name: 'verifyingContract',
                    type: 'address'
                  }],
                  DelegateByType: [{
                    name: 'delegatee',
                    type: 'address'
                  }, {
                    name: 'type',
                    type: 'uint256'
                  }, {
                    name: 'nonce',
                    type: 'uint256'
                  }, {
                    name: 'expiry',
                    type: 'uint256'
                  }]
                },
                primaryType: 'DelegateByType',
                domain: {
                  name: governanceTokenName,
                  chainId: exports.ChainId[this.config.network],
                  verifyingContract: governanceToken
                },
                message: {
                  delegatee: delegateeAddress,
                  type: type,
                  nonce: nonce,
                  expiry: expiry
                }
              };
              return _context6.abrupt("return", JSON.stringify(typeData));

            case 6:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6, this);
    }));

    function prepareDelegateByTypeSignature(_x6) {
      return _prepareDelegateByTypeSignature.apply(this, arguments);
    }

    return prepareDelegateByTypeSignature;
  }();

  _proto.getDelegateeByType =
  /*#__PURE__*/
  function () {
    var _getDelegateeByType =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee7(_ref7) {
      var delegator, delegationType, governanceToken, governanceDelegationToken;
      return runtime_1.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              delegator = _ref7.delegator, delegationType = _ref7.delegationType, governanceToken = _ref7.governanceToken;
              governanceDelegationToken = this.getContractInstance(governanceToken);
              return _context7.abrupt("return", governanceDelegationToken.getDelegateeByType(delegator, delegationType));

            case 3:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7, this);
    }));

    function getDelegateeByType(_x7) {
      return _getDelegateeByType.apply(this, arguments);
    }

    return getDelegateeByType;
  }();

  _proto.getPowerCurrent =
  /*#__PURE__*/
  function () {
    var _getPowerCurrent =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee8(_ref8) {
      var user, delegationType, governanceToken, governanceDelegationToken;
      return runtime_1.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              user = _ref8.user, delegationType = _ref8.delegationType, governanceToken = _ref8.governanceToken;
              governanceDelegationToken = this.getContractInstance(governanceToken);
              _context8.next = 4;
              return governanceDelegationToken.getPowerCurrent(user, delegationType);

            case 4:
              return _context8.abrupt("return", _context8.sent.toString());

            case 5:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8, this);
    }));

    function getPowerCurrent(_x8) {
      return _getPowerCurrent.apply(this, arguments);
    }

    return getPowerCurrent;
  }();

  _proto.getPowerAtBlock =
  /*#__PURE__*/
  function () {
    var _getPowerAtBlock =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee9(_ref9) {
      var user, blockNumber, delegationType, governanceToken, governanceDelegationToken;
      return runtime_1.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              user = _ref9.user, blockNumber = _ref9.blockNumber, delegationType = _ref9.delegationType, governanceToken = _ref9.governanceToken;
              governanceDelegationToken = this.getContractInstance(governanceToken);
              _context9.next = 4;
              return governanceDelegationToken.getPowerAtBlock(user, blockNumber, delegationType);

            case 4:
              return _context9.abrupt("return", _context9.sent.toString());

            case 5:
            case "end":
              return _context9.stop();
          }
        }
      }, _callee9, this);
    }));

    function getPowerAtBlock(_x9) {
      return _getPowerAtBlock.apply(this, arguments);
    }

    return getPowerAtBlock;
  }();

  _proto.getNonce =
  /*#__PURE__*/
  function () {
    var _getNonce =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee10(_ref10) {
      var user, governanceToken, governanceDelegationToken;
      return runtime_1.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              user = _ref10.user, governanceToken = _ref10.governanceToken;
              governanceDelegationToken = this.getContractInstance(governanceToken); // eslint-disable-next-line no-underscore-dangle

              _context10.next = 4;
              return governanceDelegationToken._nonces(user);

            case 4:
              return _context10.abrupt("return", _context10.sent.toString());

            case 5:
            case "end":
              return _context10.stop();
          }
        }
      }, _callee10, this);
    }));

    function getNonce(_x10) {
      return _getNonce.apply(this, arguments);
    }

    return getNonce;
  }();

  _proto.getDelegateeAddress =
  /*#__PURE__*/
  function () {
    var _getDelegateeAddress =
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    runtime_1.mark(function _callee11(delegatee) {
      var delegateeAddress;
      return runtime_1.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              if (!canBeEnsAddress(delegatee)) {
                _context11.next = 7;
                break;
              }

              _context11.next = 3;
              return this.config.provider.resolveName(delegatee);

            case 3:
              delegateeAddress = _context11.sent;

              if (delegateeAddress) {
                _context11.next = 6;
                break;
              }

              throw new Error("Address " + delegatee + " is not a valid ENS address");

            case 6:
              return _context11.abrupt("return", delegateeAddress);

            case 7:
              return _context11.abrupt("return", delegatee);

            case 8:
            case "end":
              return _context11.stop();
          }
        }
      }, _callee11, this);
    }));

    function getDelegateeAddress(_x11) {
      return _getDelegateeAddress.apply(this, arguments);
    }

    return getDelegateeAddress;
  }();

  return GovernanceDelegationTokenService;
}(BaseService);

tslib.__decorate([GovDelegationValidator, tslib.__param(0, IsEthAddress('user')), tslib.__param(0, IsEthAddressOrENS('delegatee')), tslib.__param(0, IsEthAddress('governanceToken')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], GovernanceDelegationTokenService.prototype, "delegate", null);

tslib.__decorate([GovDelegationValidator, tslib.__param(0, IsEthAddress('user')), tslib.__param(0, IsEthAddressOrENS('delegatee')), tslib.__param(0, IsEthAddress('governanceToken')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], GovernanceDelegationTokenService.prototype, "delegateByType", null);

tslib.__decorate([GovDelegationValidator, tslib.__param(0, IsEthAddress('user')), tslib.__param(0, IsEthAddressOrENS('delegatee')), tslib.__param(0, IsEthAddress('governanceToken')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], GovernanceDelegationTokenService.prototype, "delegateBySig", null);

tslib.__decorate([GovDelegationValidator, tslib.__param(0, IsEthAddress('user')), tslib.__param(0, IsEthAddressOrENS('delegatee')), tslib.__param(0, IsEthAddress('governanceToken')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], GovernanceDelegationTokenService.prototype, "delegateByTypeBySig", null);

tslib.__decorate([GovDelegationValidator, tslib.__param(0, IsEthAddressOrENS('delegatee')), tslib.__param(0, IsEthAddress('governanceToken')), tslib.__param(0, Is0OrPositiveAmount('nonce')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], GovernanceDelegationTokenService.prototype, "prepareDelegateSignature", null);

tslib.__decorate([GovDelegationValidator, tslib.__param(0, IsEthAddressOrENS('delegatee')), tslib.__param(0, IsEthAddress('governanceToken')), tslib.__param(0, Is0OrPositiveAmount('nonce')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], GovernanceDelegationTokenService.prototype, "prepareDelegateByTypeSignature", null);

tslib.__decorate([GovDelegationValidator, tslib.__param(0, IsEthAddress('delegator')), tslib.__param(0, IsEthAddress('governanceToken')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], GovernanceDelegationTokenService.prototype, "getDelegateeByType", null);

tslib.__decorate([GovDelegationValidator, tslib.__param(0, IsEthAddress('user')), tslib.__param(0, IsEthAddress('governanceToken')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], GovernanceDelegationTokenService.prototype, "getPowerCurrent", null);

tslib.__decorate([GovDelegationValidator, tslib.__param(0, IsEthAddress('user')), tslib.__param(0, IsEthAddress('governanceToken')), tslib.__param(0, IsPositiveAmount('blockNumber')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], GovernanceDelegationTokenService.prototype, "getPowerAtBlock", null);

tslib.__decorate([GovDelegationValidator, tslib.__param(0, IsEthAddress('user')), tslib.__param(0, IsEthAddress('governanceToken')), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", Promise)], GovernanceDelegationTokenService.prototype, "getNonce", null);

var TxBuilder =
/*#__PURE__*/
function (_BaseTxBuilder) {
  _inheritsLoose(TxBuilder, _BaseTxBuilder);

  function TxBuilder(network, injectedProvider, defaultProviderKeys) {
    var _this;

    if (network === void 0) {
      network = exports.Network.mainnet;
    }

    _this = _BaseTxBuilder.call(this, network, injectedProvider, defaultProviderKeys) || this;

    _this.getLendingPool = function (market) {
      if (!_this.lendingPools[market]) {
        _this.lendingPools[market] = new LendingPool(_this.configuration, _this.erc20Service, _this.synthetixService, _this.wethGatewayService, _this.liquiditySwapAdapterService, _this.repayWithCollateralAdapterService, market);
      }

      return _this.lendingPools[market];
    };

    _this.lendingPools = {};
    _this.baseDebtTokenService = new BaseDebtToken(_this.configuration, _this.erc20Service);
    _this.wethGatewayService = new WETHGatewayService(_this.configuration, _this.baseDebtTokenService, _this.erc20Service);
    _this.liquiditySwapAdapterService = new LiquiditySwapAdapterService(_this.configuration);
    _this.repayWithCollateralAdapterService = new RepayWithCollateralAdapterService(_this.configuration);
    _this.aaveGovernanceV2Service = new AaveGovernanceV2Service(_this.configuration);
    _this.governanceDelegationTokenService = new GovernanceDelegationTokenService(_this.configuration);
    return _this;
  }

  return TxBuilder;
}(BaseTxBuilder);

Object.defineProperty(exports, 'BigNumber', {
  enumerable: true,
  get: function () {
    return BigNumber.BigNumber;
  }
});
exports.API_ETH_MOCK_ADDRESS = API_ETH_MOCK_ADDRESS;
exports.BigNumberZD = BigNumberZD;
exports.DEFAULT_APPROVE_AMOUNT = DEFAULT_APPROVE_AMOUNT;
exports.DEFAULT_NULL_VALUE_ON_TX = DEFAULT_NULL_VALUE_ON_TX;
exports.ETH_DECIMALS = ETH_DECIMALS;
exports.HALF_RAY = HALF_RAY;
exports.HALF_WAD = HALF_WAD;
exports.LTV_PRECISION = LTV_PRECISION;
exports.MAX_UINT_AMOUNT = MAX_UINT_AMOUNT;
exports.RAY = RAY;
exports.RAY_DECIMALS = RAY_DECIMALS;
exports.SECONDS_PER_YEAR = SECONDS_PER_YEAR;
exports.SUPER_BIG_ALLOWANCE_NUMBER = SUPER_BIG_ALLOWANCE_NUMBER;
exports.SURPLUS = SURPLUS;
exports.TxBuilderV2 = TxBuilder;
exports.USD_DECIMALS = USD_DECIMALS;
exports.WAD = WAD;
exports.WAD_RAY_RATIO = WAD_RAY_RATIO;
exports.aaveGovernanceV2Addresses = aaveGovernanceV2Addresses;
exports.binomialApproximatedRayPow = binomialApproximatedRayPow;
exports.calculateAvailableBorrowsETH = calculateAvailableBorrowsETH;
exports.calculateAverageRate = calculateAverageRate;
exports.calculateCompoundedInterest = calculateCompoundedInterest;
exports.calculateHealthFactorFromBalances = calculateHealthFactorFromBalances;
exports.calculateHealthFactorFromBalancesBigUnits = calculateHealthFactorFromBalancesBigUnits;
exports.calculateIncentivesAPY = calculateIncentivesAPY;
exports.calculateLinearInterest = calculateLinearInterest;
exports.calculateReserveDebt = calculateReserveDebt;
exports.calculateReserveDebtSuppliesRaw = calculateReserveDebtSuppliesRaw;
exports.calculateRewards = calculateRewards;
exports.calculateSupplies = calculateSupplies;
exports.commonContractAddressBetweenMarketsV2 = commonContractAddressBetweenMarketsV2;
exports.computeRawUserSummaryData = computeRawUserSummaryData$1;
exports.computeUserReserveData = computeUserReserveData$1;
exports.distinctContractAddressBetweenMarketsV2 = distinctContractAddressBetweenMarketsV2;
exports.distinctStakingAddressesBetweenTokens = distinctStakingAddressesBetweenTokens;
exports.enabledNetworksByService = enabledNetworksByService;
exports.formatReserves = formatReserves$1;
exports.formatUserSummaryData = formatUserSummaryData$1;
exports.gasLimitRecommendations = gasLimitRecommendations;
exports.getCompoundedBalance = getCompoundedBalance;
exports.getCompoundedStableBalance = getCompoundedStableBalance;
exports.getEthAndUsdBalance = getEthAndUsdBalance;
exports.getLinearBalance = getLinearBalance;
exports.getReserveNormalizedIncome = getReserveNormalizedIncome;
exports.normalize = normalize;
exports.normalizeBN = normalizeBN;
exports.pow10 = pow10;
exports.rayDiv = rayDiv;
exports.rayMul = rayMul;
exports.rayPow = rayPow;
exports.rayToDecimal = rayToDecimal;
exports.rayToWad = rayToWad;
exports.uniswapEthAmount = uniswapEthAmount;
exports.v1 = index;
exports.v2 = index$1;
exports.valueToBigNumber = valueToBigNumber;
exports.valueToZDBigNumber = valueToZDBigNumber;
exports.wadDiv = wadDiv;
exports.wadMul = wadMul;
exports.wadToRay = wadToRay;
//# sourceMappingURL=protocol-js.cjs.development.js.map
