let _configure = {};
let jsonCtrl = require('./json.controller');
let renderCtrl = require('./render.controller');

module.exports = Object.assign({}, {
    configure: function(configure){
        _configure = configure;
    },
    getConfig: function(){
        return _configure;
    }
}, renderCtrl, jsonCtrl);