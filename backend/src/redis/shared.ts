import Redis from 'ioredis';

export const getRedis = () => {

  const { env } = process;
  return new Redis(parseInt(env.REDIS_PORT), env.REDIS_HOST, {
    password: env.REDIS_PASSWORD,
    retryStrategy(times): number {
      return Math.max(times * 100, 3000);
    }
  });
}


const cacheRedis = getRedis();

export const setExpireDataInRedis = async (
  key: string,
  value: string,
  seconds = 60
): Promise<string | null> => {
  return await cacheRedis.set(key, value, 'EX', seconds);
};

export const getExpireDataInRedis = async (key: string): Promise<string | null> =>
  cacheRedis.get(key);
