import client from "../caching/redis.js";

const checkCache = (key) => {
  return new Promise((resolve, reject) => {
    client.get(key, (err, reply) => {
      if (reply) {
        resolve(reply);
      }
      reject(err);
    });
  });
};

const setCache = async (key, value) => {
  client.set(key, value);
  client.expire(key, 120);
};

const deletCache = async (key) => {
  client.del(key);
};

export { checkCache, setCache, deletCache };
