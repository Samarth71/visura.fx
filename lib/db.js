const { Redis } = require('@upstash/redis');

const redis = new Redis({
    url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN
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
