/**
 * Created by yuhi on 15-4-7.
 */
var config = require('../../config');
var redis = require("redis");
var Q = require('q');
var client = redis.createClient(config.redisport, config.redishost, {
    auth_pass: ''
});
var geo = require('georedis').initialize(client);

var redisClient = {

    getRedisClient: function() {
        return client;
    },

    expire: function(key, seconds) {
        var deferred = Q.defer();
        if (typeof(key) == 'undefined') {
            deferred.reject('redis expire meet a error of key is underfined');
        } else {
            client.expire(key, seconds, function(err, cacheData) {
                if (err) deferred.reject(new Error(err));
                deferred.resolve(cacheData);
            });
        }
        return deferred.promise;
    },

    hgetall: function(key) {
        var deferred = Q.defer();
        if (typeof(key) == 'undefined') {
            deferred.reject('redis hgetall meet a error of key is underfined');
        } else {
            client.hgetall(key, function(err, cacheData) {
                if (err) deferred.reject(new Error(err));
                deferred.resolve(cacheData);
            });
        }
        return deferred.promise;
    },

    get: function(key) {
        var deferred = Q.defer();
        if (typeof(key) == 'undefined') {
            deferred.reject('redis hget meet a error of key is undefined');
        } else {
            client.get(key, function(err, cacheData) {
                if (err) deferred.reject(new Error(err));
                deferred.resolve(cacheData);
            });
        }
        return deferred.promise;
    },

    set: function(key, data) {
        var deferred = Q.defer();
        if (typeof(key) == 'undefined') {
            deferred.reject('redis hget meet a error of key is undefined');
        } else {
            client.set(key, data, function(err, cacheData) {
                if (err) deferred.reject(new Error(err));
                deferred.resolve(cacheData);
            });
        }
        return deferred.promise;
    },

    hget: function(key, field) {
        var deferred = Q.defer();
        if (typeof(key) == 'undefined') {
            deferred.reject('redis hget meet a error of key is undefined');
        } else {
            client.hget(key, field, function(err, cacheData) {
                if (err) deferred.reject(new Error(err));
                deferred.resolve(cacheData);
            });
        }
        return deferred.promise;
    },

    hset: function(key, attribute, data) {
        var deferred = Q.defer();
        if (typeof(key) == 'undefined') {
            deferred.reject('redis hset meet a error of key is undefined');
        } else {
            client.hset(key, attribute, data, function(err, cacheData) {
                if (err) deferred.reject(new Error(err));
                deferred.resolve(cacheData);
            });
        }
        return deferred.promise;
    },

    hdel: function(key, field) {
        var deferred = Q.defer();
        if (typeof(key) == 'undefined') {
            deferred.reject('redis hdel meet a error of key is undefined');
        } else {
            client.hdel(key, field, function(err, cacheData) {
                if (err) deferred.reject(new Error(err));
                deferred.resolve(cacheData);
            });
        }
        return deferred.promise;
    },

    del: function(key) {
        var deferred = Q.defer();
        if (typeof(key) == 'undefined') {
            deferred.reject('redis del meet a error of key is undefined');
        } else {
            client.del(key, function(err, cacheData) {
                if (err) deferred.reject(new Error(err));
                deferred.resolve(cacheData);
            });
        }
        return deferred.promise;
    },

    keys: function(pattern) {
        var deferred = Q.defer();
        if (typeof(pattern) == 'undefined') {
            deferred.reject('redis keys meet a error of key is undefined');
        } else {
            client.keys(pattern, function(err, cacheData) {
                if (err) deferred.reject(new Error(err));
                deferred.resolve(cacheData);
            });
        }
        return deferred.promise;
    },

    get: function(key) {
        var deferred = Q.defer();
        if (typeof(key) == 'undefined') {
            deferred.reject('redis hget meet a error of key is undefined');
        } else {
            client.get(key, function(err, cacheData) {
                if (err) deferred.reject(new Error(err));
                deferred.resolve(cacheData);
            });
        }
        return deferred.promise;
    },

    set: function(key, data) {
        var deferred = Q.defer();
        if (typeof(key) == 'undefined') {
            deferred.reject('redis hget meet a error of key is undefined');
        } else {
            client.set(key, data, function(err, cacheData) {
                if (err) deferred.reject(new Error(err));
                deferred.resolve(cacheData);
            });
        }
        return deferred.promise;
    },

    //////////////////////////////////////////////////////// ZSET /////////////////////////////////////////////////////////////
    zadd: function(key, score, member) {
        var deferred = Q.defer();
        if (typeof(key) == 'undefined') {
            deferred.reject('redis zadd meet a error of key is undefined');
        } else {
            client.zadd(key, score, member, function(err, cacheData) {
                if (err) deferred.reject(new Error(err));
                deferred.resolve(cacheData);
            });
        }
        return deferred.promise;
    },

    zrem: function(key, member) {
        var deferred = Q.defer();
        if (typeof(key) == 'undefined') {
            deferred.reject('redis zrem meet a error of key is undefined');
        } else {
            client.zrem(key, member, function(err, cacheData) {
                if (err) deferred.reject(new Error(err));
                deferred.resolve(cacheData);
            });
        }
        return deferred.promise;
    },

    /**
     * Get the number of members in a sorted set
     */
    zcard: function(key) {
        var deferred = Q.defer();
        if (typeof(key) == 'undefined') {
            deferred.reject('redis zcard meet a error of key is undefined');
        } else {
            client.zcard(key, function(err, cacheData) {
                if (err) deferred.reject(new Error(err));
                deferred.resolve(cacheData);
            });
        }
        return deferred.promise;
    },

    /**
     * Return a range of members in a sorted set, by index
     */
    zrange: function(key, start, stop) {
        var deferred = Q.defer();
        if (typeof(key) == 'undefined') {
            deferred.reject('redis zrange meet a error of key is undefined');
        } else {
            client.zrange(key, start, stop, function(err, cacheData) {
                if (err) deferred.reject(new Error(err));
                deferred.resolve(cacheData);
            });
        }
        return deferred.promise;
    },

    // ######################## GEO ########################

    /**
     * 添加地理位置
     * @param {String} name 地理位置名称
     * @param {object} location 地理位置坐标对象,比如：{latitude: 43.646838, longitude: -79.403723}
     * @returns {*|promise}
     */
    addLocation: function(name, location) {
        var deferred = Q.defer();
        geo.addLocation(name, location, function(err, reply) {
            if (err) deferred.reject(err);
            else deferred.resolve(reply);
        })
        return deferred.promise;
    },

    /**
     * 批量添加地理位置
     * @param {array} name 地理位置对象的数组
     * 如：{
     *       'Toronto': {latitude: 43.6667, longitude: -79.4167},
     *       'Philadelphia': {latitude: 39.9523, longitude: -75.1638},
     *       'Palo Alto': {latitude: 37.4688, longitude: -122.1411},
     *       'San Francisco': {latitude: 37.7691, longitude: -122.4449},
     *       'St. John\'s': {latitude: 47.5500, longitude: -52.6667}
     *    }
     * @returns {*|promise}
     */
    addLocations: function(list) {
        var deferred = Q.defer();
        geo.addLocations(list, function(err, reply) {
            if (err) deferred.reject(err);
            else deferred.resolve(reply);
        })
        return deferred.promise;
    },

    /**
     * 根据地理名词获取坐标
     * @param {String} name 地理位置名称
     * @returns {*|promise}
     */
    location: function(name) {
        var deferred = Q.defer();
        geo.location(name, function(err, location) {
            if (err) deferred.reject(err);
            else deferred.resolve(location);
        })
        return deferred.promise;
    },

    /**
     * 根据批量地理名词获取坐标
     * @param {list} name 地理位置名称
     * 比如：['Toronto', 'Philadelphia', 'Palo Alto', 'San Francisco', 'Ottawa']
     * @returns {*|promise}
     */
    locations: function(list) {
        var deferred = Q.defer();
        geo.location(list, function(err, locations) {
            if (err) deferred.reject(err);
            else deferred.resolve(locations);
        })
        return deferred.promise;
    },

    /**
     * 获取以指定坐标为中心，指定距离为半径范围内的地理坐标
     * @param {object} location 地理位置坐标对象,比如：{latitude: 43.646838, longitude: -79.403723}
     * @param {num} unit 距离
     * @param {object} options 高级属性 设置
     * var options = {
     *         withCoordinates: true, // Will provide coordinates with locations, default false 
     *         withHashes: true, // Will provide a 52bit Geohash Integer, default false 
     *         withDistances: true, // Will provide distance from query, default false 
     *         order: 'ASC', // or 'DESC' or true (same as 'ASC'), default false 
     *         units: 'm', // or 'km', 'mi', 'ft', default 'm' 
     *         count: 100, // Number of results to return, default undefined 
     *         accurate: true // Useful if in emulated mode and accuracy is important, default false 
     *      }
     * @returns {*|promise}
     */
    nearbyLocation: function(location, unit, options) {
        var deferred = Q.defer();
        geo.nearby(location, unit, options, function(err, locations) {
            if (err) deferred.reject(err);
            else deferred.resolve(locations);
        })
        return deferred.promise;
    },

    /**
     * 获取以指定地址名称为中心，指定距离为半径范围内的地理坐标
     * @param {string} name 地理位置名称
     * @param {num} unit 距离
     * @param {object} options 高级属性 设置
     * var options = {
     *         withCoordinates: true, // Will provide coordinates with locations, default false 
     *         withHashes: true, // Will provide a 52bit Geohash Integer, default false 
     *         withDistances: true, // Will provide distance from query, default false 
     *         order: 'ASC', // or 'DESC' or true (same as 'ASC'), default false 
     *         units: 'm', // or 'km', 'mi', 'ft', default 'm' 
     *         count: 100, // Number of results to return, default undefined 
     *         accurate: true // Useful if in emulated mode and accuracy is important, default false 
     *      }
     * @returns {*|promise}
     */
    nearbyName: function(name, unit, options) {
        var deferred = Q.defer();
        geo.nearby(name, unit, options, function(err, locations) {
            if (err) deferred.reject(err);
            else deferred.resolve(locations);
        })
        return deferred.promise;
    },

    /**
     * 根据地理名词移除坐标
     * @param {string} name 地理位置名称
     * @returns {*|promise}
     */
    removeLocation: function(name) {
        var deferred = Q.defer();
        geo.removeLocation(name, function(err, reply) {
            if (err) deferred.reject(err);
            else deferred.resolve(reply);
        })
        return deferred.promise;
    },

    /**
     * 批量根据地理名词移除坐标
     * @param {list} list 地理位置名称的数组,比如：['Toronto', 'Philadelphia', 'Palo Alto', 'San Francisco', 'Ottawa']
     * @returns {*|promise}
     */
    removeLocations: function(list) {
        var deferred = Q.defer();
        geo.removeLocations(list, function(err, reply) {
            if (err) deferred.reject(err);
            else deferred.resolve(reply);
        })
        return deferred.promise;
    },

    /**
     * 获取2个地址间的距离
     * @param {object} locationA 地理位置名称，通过addLocation添加进去的名字
     * @param {object} locationB 地理位置名称，通过addLocation添加进去的名字
     * @param {object} options 高级属性 设置
     * var options = {
     *         withCoordinates: true, // Will provide coordinates with locations, default false 
     *         withHashes: true, // Will provide a 52bit Geohash Integer, default false 
     *         withDistances: true, // Will provide distance from query, default false 
     *         order: 'ASC', // or 'DESC' or true (same as 'ASC'), default false 
     *         units: 'm', // or 'km', 'mi', 'ft', default 'm' 
     *         count: 100, // Number of results to return, default undefined 
     *         accurate: true // Useful if in emulated mode and accuracy is important, default false 
     *      }
     * @returns {*|promise}
     */
    distance: function(locationA, locationB, options) {
        var deferred = Q.defer();
        geo.distance(locationA, locationB, options,
            function(err, reply) {
                if (err) deferred.reject(err);
                else deferred.resolve(reply);
            })
        return deferred.promise;
    }


};
module.exports = redisClient;

client.on("error", function(err) {
    logger.error("Error :" + err);
});