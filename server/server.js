/**
 * Created by yuhi on 15/11/10.
 */


var config = require('../config');
var http = require('http');

function Server(rootApp) {
    this.rootApp = rootApp;
    this.httpServer = null;
    this.config = config;
}

Server.prototype.start = function (externalApp) {
    var self = this,
        rootApp = externalApp ? externalApp : self.rootApp;
    var server = http.createServer(rootApp);
    self.httpServer = rootApp.listen(config.port);
    console.log('app server start,plz visite http://localhost:' + config.port);
    self.httpServer.on('error', function (error) {
        if (error.errno === 'EADDRINUSE') {
            console.error(
                '(EADDRINUSE) Cannot start Hacker News.',
                'Port ' + config.port + ' is already in use by another program.',
                'Is another node instance already running?'
                );
        } else {
            console.error(
                '(Code: ' + error.errno + ')',
                'There was an error starting your server.'
                );
        }
        process.exit(-1);
    });
    self.httpServer.on('connection', function () {
        //        todo
    });
    self.httpServer.on('listening', function () {
        //       todo
    });

}

Server.prototype.stop = function (externalApp) {
    //    todo
}

module.exports = Server;
