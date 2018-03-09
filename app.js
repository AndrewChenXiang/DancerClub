/**
 * Created by chenxiang on 2018/3/4.
 */
var express=require('express');
var config=require('./config');
var Loader=require('loader');
var LoaderConnect=require('loader-connect');
var _=require("lodash");
var assets={};

if(config.mini_assets)
{
    try{
        assets=require('./assets.josn');
    }
    catch (e){
        logger.error('You must execute `make build` before start app when mini_assets is true.');
    }

}


require('./models');
var app=express();
var web_router=require("./web_router");
var path = require('path');
var logger=require('./common/logger');
var staticDir = path.join(__dirname, 'public');
var errorhandler=require('errorhandler')
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs-mate'));
app.locals._layoutFile = 'layout.html';

if(config.debug)
{
    app.use(LoaderConnect.less(__dirname));
}


app.use('/public', express.static(staticDir));

_.extend(app.locals,{
   config:config,
   assets:assets,
   Loader:Loader
});

app.locals.config=config;
app.use("/",web_router);



var urlinfo = require('url').parse(config.host);
config.hostname = urlinfo.hostname || config.host;
if(!module.parent)
{
    app.listen(config.port,function () {
        logger.info('NodeClub listening on port', config.port);
        logger.info('God bless love....');
        logger.info('You can debug your app with http://' + config.hostname + ':' + config.port);
        logger.info('');
    });
}

if(config.debug)
{
    app.use(errorhandler());
}
else
{
    app.use(function (err,req,res,next) {
        logger.error(err);
        return rs.status(500).send('500 status')
    })
}
module.exports=app;
