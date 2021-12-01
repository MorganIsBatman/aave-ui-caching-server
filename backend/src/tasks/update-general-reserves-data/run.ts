import { CONFIG } from '../../config';
import { runTask } from '../task-helpers';
import { handler, running, startUp } from './handler';

CONFIG.PROTOCOL_ADDRESSES_PROVIDER_ADDRESSES.forEach((lendingPoolAddressProvider) =>
  updateGeneralReservesData(lendingPoolAddressProvider)
);

async function updateGeneralReservesData(
  lendingPoolAddressProvider: string,
  poolingInterval = CONFIG.GENERAL_RESERVES_DATA_POOLING_INTERVAL
) {
  console.log(
    `updateGeneralReservesData job starting up with poolingInterval ${
      poolingInterval / 1000
    }s for pool address ${lendingPoolAddressProvider}`
  );

  await runTask({
    runEvery: poolingInterval,
    startupHandler: startUp,
    mainHandler: () => handler(lendingPoolAddressProvider),
    runningHandler: running,
  });
}
