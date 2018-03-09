/**
 * Created by chenxiang on 2018/3/5.
 */
var config=require('../config');
var pathLib=require('path');
var env=process.env.NODE_ENV || "development";

var log4js=require('log4js');
log4js.configure({
    appenders:{
        console:{type:'console'},
        cheese:{type:'file',filename:pathLib.join(config.log_dir, 'cheese.log')}
    },
    categories:{
        default:{appenders:['console'],level:'info'}
    }
});
var logger=log4js.getLogger('info');
module.exports=logger;
