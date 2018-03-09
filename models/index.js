/**
 * Created by chenxiang on 2018/3/7.
 */
var mongoose=require('mongoose');
var config=require('../config');
var logger=require('../common/logger');

mongoose.connect(config.db,{
    server:{poolSize:20}
},function (err) {
    if(err)
    {
        logger.error('connect to %s error:',config.db,err.message);
        process.exit(1);
    }
});

//require('./user');
require('./message');

exports.Message=mongoose.model('Message');