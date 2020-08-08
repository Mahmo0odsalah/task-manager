import client from "../caching/redis.js";

const checkCache = async (req, res, next) => {
  client.get(req.params.id, (err, reply) => {
    console.log(reply);
    if (reply) {
      return res.send(JSON.parse(reply));
    }
    next();
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
