import client from "../caching/redis.js";

const checkCache = async (req, res, next) => {
  client.get(req.params.id, (err, reply) => {
    if (reply) {
      return res.send(JSON.parse(reply));
    }
    next();
  });
};

const setCache = async (key, value) => {
  await client.set(key, JSON.stringify(value));
  await client.expire(key, 120);
};

export { checkCache, setCache };
