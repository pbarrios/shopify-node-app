const redis = require('redis');
const { promisify } = require('util');

module.exports = class Redis {
    constructor(options) {
        this.client = redis.createClient(options);
      
        this.client.on('connect', function() {
          console.log('Connected to Redis');
        });
    }

    saveShop(key, obj) {
        console.log(`storing shop ${key}...`);
        console.debug(obj);
        this.client.hmset(key, obj, function (err, reply) {
            if (err) throw err;
        });
    }
  
    getShop(key, callback) {
        this.client.hgetall(key, (err, obj) => {
            if (err) throw err;
            callback(obj);
        });
    }

    removeShop(key) {
        this.client.del(key, (err) => {
            if (err) console.error(err.message);
        });
    }
};