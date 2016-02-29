'use strict'
var Q = require('q');
var request = require('request');
var querystring = require('querystring');
var constants = require('../helpers/constants');
/**
 * 百度地图服务
 */
class BaiduMapService {

    /**
     * 根据经纬度获取城市
     * @param {string} lng 经度
     * @param {string} lat 纬度
     * @returns {*|promise}
     */
    getCity(lat, lng) {
        var defered = Q.defer();
        request('http://api.map.baidu.com/geocoder/v2/?ak=' + constants.BaiduConstants.MAPAK + '&callback=renderReverse&location=' + lat + ',' + lng + '&output=json&pois=1', function(error, response, body) {
            if (!error && response.statusCode == 200) {
                response.setEncoding('utf8');
                res.setHeader("Content-Type", "text/html");
                if (!error) {
                    defered.resolve(body);
                } else {
                    defered.reject(error);
                }
            }
        });
        return defered.promise;
    }

    /**
     * 根据关键字和经纬度获取自动匹配且排序号的地址(传入经纬度后，返回结果将以距离进行排序)
     * @param {string} keyword 关键字
     * @param {string} longitude 经度
     * @param {string} latitude 纬度
     * @returns {*|promise}
     */
    getAutoCompleteAddresses(keyword, longitude, latitude) {
        var deferred = Q.defer();
        var queryParam = {
            query: keyword,
            region: '上海',
            output: 'json',
            ak: constants.BaiduConstants.MAPAK
        };
        if (longitude && latitude) {
            queryParam.location = latitude + ',' + longitude;
        }
        var url = 'http://api.map.baidu.com/place/v2/suggestion?' + querystring.stringify(queryParam);
        request(url, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var data = JSON.parse(body);
                deferred.resolve(data.result);
            } else {
                deferred.reject(new Error(err));
            }
        });
        return deferred.promise;
    }

    /**
     * 计算两个点之间的距离,单位为米，m.
     * @param {boolean} isReturnPromise 是否返回Promise的数据
     * @returns {*}
     */
    getDistanceOfTwoPoints(lng1, lat1, lng2, lat2, isReturnPromise) {
        var EARTH_RADIUS = 6378.137;
        var radLat1 = lat1 * Math.PI / 180.0;
        var radLat2 = lat2 * Math.PI / 180.0;
        var a = radLat1 - radLat2;
        var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
        var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
            Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
        s = s * EARTH_RADIUS;
        s = Math.round(s * 10000) / 10000;
        s = s.toFixed(3);
        s = parseFloat(s) * 1000;
        return isReturnPromise ? Q(s) : s;
    }

    /**
     * 根据详细的地址获取对应的经纬度
     * @param {string} address 详细的地址
     */
    getLngLatByAddress(specificAddress) {
        var deferred = Q.defer();
        var queryParam = {
            address: specificAddress,
            city: '上海市',
            output: 'json',
            ak: constants.BaiduConstants.MAPAK
        };
        var url = 'http://api.map.baidu.com/geocoder/v2/?' + querystring.stringify(queryParam);
        request(url, function(error, response, body) {
            if (!error) {
                var data = JSON.parse(body);
                deferred.resolve(data);
            } else {
                deferred.reject(new Error(err));
            }
        });
        return deferred.promise;
    }

    /**
     * 根据对应的经纬度获取详细的地址
     * @param {string} address 详细的地址
     */
    getAddressByLngLat(longitude, latitude) {
        var deferred = Q.defer();
        var queryParam = {
            location: latitude + ',' + longitude,
            output: 'json',
            ak: constants.BaiduConstants.MAPAK,
            pois: 1
        };
        var url = 'http://api.map.baidu.com/geocoder/v2/?' + querystring.stringify(queryParam);
        request(url, function(error, response, body) {
            if (!error) {
                var data = JSON.parse(body);
                deferred.resolve(data);
            } else {
                deferred.reject(new Error(err));
            }
        });
        return deferred.promise;
    }

};

module.exports = new BaiduMapService();