/**
 * Created by yuhi on 15/3/19.
 */
var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var config = require('../../config');
var Server = require('mongodb').Server;
var ReplSet = require('mongodb').ReplSet;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;
var Q = require('q');
var sprintf = require("sprintf-js").sprintf;
var mongoClient = require('mongodb').MongoClient;
//正式环境
var url = sprintf("mongodb://%s:%d,%s:%d/%s?replicaSet=%s", config.dbhost1, config.dbport1, config.dbhost2, config.dbport2, config.dbname, config.replSetName);

var MongoDbDao = {

    _db: null,

    //dao对象初始化
    init: function(callback) {
        console.info('mongodb instance start..')
        var me = this;
        // if (process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'PRODUCTION') {
        //     mongoClient.connect(url, function(err, db) {
        //         if (err) {
        //             console.error("connect err:", err);
        //         }
        //         var adminDb = db.admin();
        //         adminDb.authenticate(config.dbusername, config.dbpwd, function(err, result) {
        //             if (err) {
        //                 console.error("authenticate err:", err);
        //             }
        //             me._db = db;
        //         });
        //     });
        // } else {
        console.info('develop model');
        me._db = new Db(config.dbname, new Server(config.dbhost, config.dbport, {
            auto_reconnect: true
        }, {
            safe: true
        }));
        me._db.open(function(err, db) {
            if (err) {
                console.log('====== mongodb - err ======', err);
            } else {
                me._db = db;
                if (callback) {
                    callback();
                }
            }
        });
        // }
    },

    save: function(collection, data) {
        var currentTime = this.getProcessedCurrentTime();
        if (data && data.length) {
            var _len = data.length;
            for (var i = 0; i < _len; i++) {
                data[i].createTime = currentTime;
                data[i].isDeleted = false;
            }
        } else {
            data['createTime'] = currentTime;
            data['isDeleted'] = false;
        }
        var deferred = Q.defer();
        this._db.collection(collection).insert(data, {
            w: 1
        }, function(err, datas) {
            if (err) {
                deferred.reject(new Error(err));
            } else {
                deferred.resolve(datas.ops[0]);
            }
        });
        return deferred.promise;
    },

    query: function(collection, selector, sort) {
        var deferred = Q.defer();
        if (typeof(selector) == 'string') {
            selector = {
                _id: ObjectID.createFromHexString(selector)
            };
        }
        if (!sort) {
            sort = {
                createTime: -1
            };
        }
        this.addDefaultCondition(selector);
        this._db.collection(collection).find(selector).sort(sort).toArray(function(err, datas) {
            if (err) {
                deferred.reject(new Error(err));
            } else {
                deferred.resolve(datas);
            }
        });
        return deferred.promise;
    },

    queryAdv: function(collection, selector, projection, sort) {
        var deferred = Q.defer();
        this.addDefaultCondition(selector);
        this._db.collection(collection).find(selector, projection).sort(sort).toArray(function(err, datas) {
            if (err) {
                deferred.reject(new Error(err));
            } else {
                deferred.resolve(datas);
            }
        });
        return deferred.promise;
    },

    findOne: function(collection, selector) {
        var deferred = Q.defer();
        if (typeof(selector) == 'string') {
            selector = {
                _id: ObjectID.createFromHexString(selector)
            };
        }
        this._db.collection(collection).findOne(selector, function(err, datas) {
            if (err) {
                deferred.reject(new Error(err));
            } else {
                deferred.resolve(datas);
            }
        });
        return deferred.promise;
    },

    findBySort: function(collection, selector, sort, limit) {
        var deferred = Q.defer();
        this._db.collection(collection).find(selector).skip(0).limit(limit - 0).sort(sort).toArray(function(err, datas) {
            if (err) {
                deferred.reject(new Error(err));
            } else {
                deferred.resolve(datas);
            }
        });
        return deferred.promise;
    },

    pagingQuery: function(collection, selector, sort, start, limit) {
        var deferred = Q.defer();
        this.addDefaultCondition(selector);
        var sort = sort ? sort : {
            createTime: -1
        };
        this._db.collection(collection).find(selector).sort(sort).skip(start).limit(limit).toArray(function(err, datas) {
            if (err) {
                deferred.reject(new Error(err));
            } else {
                deferred.resolve(datas);
            }
        });
        return deferred.promise;
    },

    /**
     * 获取分页数据
     * @param {String} collection 表名
     * @param (Object) selector 查询过滤条件
     * @param {Object} pageRequest 分页排序信息
     * @returns {*|promise}
     */
    findPagingData: function(collection, selector, pageRequest) {
        var deferred = Q.defer();
        var me = this;
        me.addDefaultCondition(selector);
        me.getCount(collection, selector).then(function(count) {
            var start = parseInt(pageRequest.start);
            var limit = parseInt(pageRequest.limit);
            me.pagingQuery(collection, selector, pageRequest.sort, start, limit).then(function(data) {
                deferred.resolve({
                    total: count,
                    records: data
                });
            });
        }).catch(function(err) {
            deferred.reject(new Error(err));
        });
        return deferred.promise;
    },

    getCount: function(collection, selector) {
        var deferred = Q.defer();
        this._db.collection(collection).find(selector).count(function(err, count) {
            if (err) {
                deferred.reject(new Error(err));
            } else {
                deferred.resolve(count);
            }
        });
        return deferred.promise;
    },

    update: function(collection, selector, newData) {
        var deferred = Q.defer();
        var currentTime = this.getProcessedCurrentTime();
        if (typeof(selector) == 'string') {
            selector = {
                _id: ObjectID.createFromHexString(selector)
            };
        }
        newData['updateTime'] = currentTime;
        this._db.collection(collection).update(selector, {
            $set: newData
        }, {
            w: 1,
            upsert: true
        }, function(err, datas) {
            if (err) {
                deferred.reject(new Error(err));
            } else {
                deferred.resolve(datas);
            }
        });
        return deferred.promise;
    },

    updateAdv: function(collection, selector, updateObj) {
        var deferred = Q.defer();
        var currentTime = this.getProcessedCurrentTime();
        if (typeof(selector) == 'string') {
            selector = {
                _id: ObjectID.createFromHexString(selector)
            };
        }
        if (updateObj.$set) {
            updateObj.$set['updateTime'] = currentTime;
        } else {
            updateObj['$set'] = {
                updateTime: currentTime
            };
        }
        this._db.collection(collection).update(selector, updateObj, {
            w: 1,
            upsert: true
        }, function(err, data) {
            if (err) {
                deferred.reject(new Error(err));
            } else {
                deferred.resolve(data);
            }
        });
        return deferred.promise;
    },

    updateBatch: function(collection, selector, newData) {
        var deferred = Q.defer();
        var currentTime = this.getProcessedCurrentTime();
        newData['updateTime'] = currentTime;
        this._db.collection(collection).update(selector, {
            $set: newData
        }, {
            w: 1,
            upsert: false,
            multi: true
        }, function(err, datas) {
            if (err) {
                deferred.reject(new Error(err));
            } else {
                deferred.resolve(datas);
            }
        });
        return deferred.promise;
    },

    remove: function(collection, selector) {
        var deferred = Q.defer();
        if (typeof(selector) == 'string') {
            selector = {
                _id: ObjectID.createFromHexString(selector)
            };
        }
        this._db.collection(collection).remove(selector, {
            w: 1
        }, function(err, data) {
            if (err) {
                deferred.reject(new Error(err));
            } else {
                deferred.resolve(data);
            }
        });
        return deferred.promise;
    },

    /**
     * 查询并修改,该操作为一个原子操作
     *  @param remove:boolean 返回之前就删除对象
     *  @param new:true 返回已更改的对象
     *  @param fields 指定返回的字段，默认为全部
     *  @param upsert:boolean 匹配的不存在，就创建并插入数据
     */
    findAndModify: function(collection, selector, newData, sort) {
        var deferred = Q.defer();
        var sort = sort ? sort : {
            createTime: -1
        };
        if (typeof(selector) == 'string') {
            selector = {
                _id: ObjectID.createFromHexString(selector)
            };
        }
        this._db.collection(collection).findAndModify(selector, sort, newData, {
            w: 1,
            new: true,
            upsert: true
        }, function(err, data) {
            if (err) {
                deferred.reject(new Error(err));
            } else {
                deferred.resolve(data);
            }
        });
        return deferred.promise;
    },

    /**
     * 查询并删除,该操作为一个原子操作
     */
    findAndRemove: function(collection, selector, sort) {
        var deferred = Q.defer();
        var sort = sort ? sort : {
            createTime: -1
        };
        if (typeof(selector) == 'string') {
            selector = {
                _id: ObjectID.createFromHexString(selector)
            };
        }
        this._db.collection(collection).findAndRemove(selector, sort, function(err, data) {
            if (err) {
                deferred.reject(new Error(err));
            } else {
                deferred.resolve(data);
            }
        });
        return deferred.promise;
    },

    /**
     * 自增id 暂时弃用
     * @param  collection 类名
     */
    /**
     getNextSequence: function (collection) {
        var deferred = Q.defer();
        this.findAndModify({
            query: { _id: name },
            update: { $inc: { seq: 1 } },
            new: true
        }).then(function (id) {
            deferred.resolve(id);
        }).catch(function (err) {
            deferred.reject(new Error(err));
        });
        return deferred.promise;
    },
     */

    /**
     * 默认查询加上 isDeleted: false
     * @param {Object} selector 查询参数
     */
    addDefaultCondition: function(selector) {
        // selector['isDeleted'] = false;
    },

    /**
     * Mongodb的时间有偏差，加上偏差的时间，得到处理过的当前时间
     * @returns {Date}
     */
    getProcessedCurrentTime: function() {
        var date = new Date();
        var newHour = date.getHours() + 8;
        date.setHours(newHour);
        return date;
    }
};

MongoDbDao.init();

module.exports = MongoDbDao;