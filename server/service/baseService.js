/**
 * Created by yuhi on 15/3/19.
 * 基础服务类，其他服务类，请继承它
 */
'use strict'
var mongodbDao = require('../storage/mongodbDao');
var redisDao = require('../storage/redisDao');
var ObjectID = require('mongodb').ObjectID;
var commonUtil = require('../helpers/commonUtil');
var Q = require('q');

class BaseService {

    constructor(tableName) {
        this.TABLE_NAME = tableName;
    }

    /*
     * 保存
     * @prams:newData json对象
     * @return:Object 保存的对象
     */
    save(newData) {
        return mongodbDao.save(this.TABLE_NAME, newData);

    }

    /*
     * 获取数量
     * @prams:queryData  查询条件的数据,可以直接为id的字符串，也可以用json
     * @return:int 数据总数
     */
    getCount(queryData) {
        return mongodbDao.getCount(this.TABLE_NAME, queryData);
    }

    /*
     * 根据查询条件获取一条信息
     * @prams:queryData  查询条件的数据,可以直接为id的字符串，也可以用json
     * @return:Object
     */
    findOne(queryData) {
        return mongodbDao.findOne(this.TABLE_NAME, queryData)
    }

    /*
     * 根据查询条件获取信息
     * @prams:queryData string/json 查询条件的数据,可以直接为id的字符串，也可以用json
     * @prams:sort json             排序参数
     * @return:[Object]
     */
    query(queryData, sort) {
        return mongodbDao.query(this.TABLE_NAME, queryData, sort)
    }

    /*
     * 删除
     * @prams:queryData string/json  查询条件的数据,可以直接为id的字符串，也可以用json
     * @return: int                  被删除的数量
     */
    remove(queryData) {
        return mongodbDao.remove(this.TABLE_NAME, queryData);
    }

    /*
     * 普通更新 .方式为$set
     * @prams:queryData string/json 查询条件的数据,可以直接为id的字符串，也可以用json
     * @prams:newData json          需要更新的数据 ,该处的newData，会被内部$set,所以高级的更新需要借助updateAdv来实现�更新，，,f
     * @prams:multi  boolean        是否批量更新
     * @return: int                 被更新的数量 ,成功就为1, 没有查到就为0。
     */
    update(queryData, newData, multi) {
        if (multi) {
            return mongodbDao.updateBatch(this.TABLE_NAME, queryData, newData)
        } else {
            return mongodbDao.update(this.TABLE_NAME, queryData, newData);
        }
    }

    /*
     * 高级更新，可以运用mongodb的各种高级更新方法
     * @prams:queryData string/json 查询条件的数据,可以直接为id的字符串，也可以用json
     * @prams:newData json          需要更新的数据，以及高级更新方法，比如：$inc，$addToSet，$pull等
     * @return: int                 被更新的数量 ,成功就为1, 没有查到就为0。
     */
    updateAdv(queryData, newData) {
        return mongodbDao.updateAdv(this.TABLE_NAME, queryData, newData)
    }

    /*
     * 获取分页查询
     * @prams:queryData string/json 查询条件的数据,可以直接为id的字符串，也可以用json
     * @prams:sort  json             排序
     * @prams:start int              开始的数据下标
     * @prams:limit int              每页的数据数量
     * @return: json.total  int      总数据数
     * @return: json.records  [Object]   返回的数据
     */
    findPagingData(queryData, start, limit, sort) {
        var pageRequest = {};
        pageRequest.start = start;
        pageRequest.limit = limit;
        pageRequest.sort = sort ? sort : {createTime: -1};
        return mongodbDao.findPagingData(this.TABLE_NAME, queryData, pageRequest);
    }

    /*
     * 查找并删除， 原子操作
     * @prams:queryData string/json 查询条件的数据,可以直接为id的字符串，也可以用json
     * @prams:newData          json 更新的数据
     * @prams:sort json             排序
     * @return:[Object]             返回的更新数据
     */
    findAndModify(queryData, newData, sort) {
        return mongodbDao.findAndModify(this.TABLE_NAME, queryData, newData, sort)
    }

    /*
     * 查找并删除， 原子操作
     * @prams:queryData string/json 查询条件的数据,可以直接为id的字符串，也可以用json
     * @prams:newData          json 更新的数据
     * @prams:sort json             排序
     * @return:[Object]             返回的更新数据
     */
    findAndRemove(queryData, sort) {
        return mongodbDao.findAndRemove(this.TABLE_NAME, queryData, sort);
    }

}

module.exports = BaseService;