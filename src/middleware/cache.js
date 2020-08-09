import client from "../caching/redis.js";

const checkCache = async (key) => {
  client.get(key, (err, reply) => {
    if (reply) {
      console.log(reply);
      return JSON.parse(reply);
    }
    return null;
  });
};

const setCache = async (key, value) => {
  client.set(String(key), JSON.stringify(value));
  client.expire(String(key), 120);
};

const deletCache = async (key) => {
  client.del(key);
};

export { checkCache, setCache, deletCache };
