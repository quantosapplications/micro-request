import { RedisValueHelper } from '@quantos/redis-helper';
import redis from 'redis';
import { Entity } from './interfaces/entity';

/** Init a redis client */
let redisClient: redis.RedisClient;

function initRedisClient(): void {
    if (process.env.REDIS_PORT && process.env.REDIS_HOST) {
        console.log('[@quantos/micro-request][Init redis client] Creating client on ' + process.env.REDIS_HOST + ':' + process.env.REDIS_PORT);
        redisClient = redis.createClient(Number.parseInt(process.env.REDIS_PORT), process.env.REDIS_HOST, {enable_offline_queue: false});
        redisClient.on('error', (error: any) => {
            console.error('[@quantos/micro-request][Init redis client] ' + error);
            redisClient = null;
            setTimeout(() => initRedisClient(), 10000);
        });
    }
}
initRedisClient();

export class RedisCache {

    static async get<T>(id: any, cachePrefix?: string): Promise<T | null> {
        if (!redisClient) { return null; }
        const cache = new RedisValueHelper<T>({ client: redisClient, prefix: cachePrefix });
        const cached = await cache.getCached(`${id}`);
        if (cached) { return cached; }
    }

    static async getMany<Y, T extends Entity<Y>>(ids: Y[], cachePrefix?: string): Promise<T[]> {
        if (!redisClient) { return null; }
        const cache = new RedisValueHelper<T>({ client: redisClient, prefix: cachePrefix });
        const cacheds = await cache.getCacheds(ids.map(String));
        if (cacheds) { return cacheds; }
    }

    static async set<Y, T extends Entity<Y>>(id: Y, data: T, cachePrefix?: string): Promise<void> {
        if (!redisClient) { return; }
        const cache = new RedisValueHelper<T>({ client: redisClient, prefix: cachePrefix });
        await cache.setCached(`${id}`, data); 
    }

}
