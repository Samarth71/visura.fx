const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

const KEY = 'capsules';

async function getCapsules() {
  const data = await redis.get(KEY);
  return data || [];
}

async function saveCapsules(capsules) {
  await redis.set(KEY, capsules);
}

module.exports = { getCapsules, saveCapsules };
