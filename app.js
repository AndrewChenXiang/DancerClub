/**
 * Created by chenxiang on 2018/3/4.
 */
var express=require('express');
var config=require('./config');
var Loader=require('loader');
var session = require('express-session');
var RedisStore=require('connect-redis')(session);
var LoaderConnect=require('loader-connect');

var path = require('path');
var logger=require('./common/logger');
var _=require("lodash");
var assets={};
var bodyParser=require('body-parser');
var csurf = require('csurf');
var compress=require('compression');

if(config.mini_assets)
{
    try{
        assets=require('./assets.json');
    }
    catch (e){
        logger.error('You must execute `make build` before start app when mini_assets is true.');
    }

}



var app=express();
var web_router=require("./web_router");
require('./models');
var auth=require('./middlewares/auth');
var staticDir = path.join(__dirname, 'public');
var errorhandler=require('errorhandler')
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs-mate'));
app.locals._layoutFile = 'layout.html';
app.use(bodyParser.json({limit: '1mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));
app.use(require('cookie-parser')(config.session_secret));
app.use(compress());
if(config.debug)
{
    app.use(LoaderConnect.less(__dirname));
}

app.use(function (req,res,next) {
    res.locals.csrf=req.csrfToken?req.csrfToken():'';
    next();
})
app.use('/public', express.static(staticDir));
_.extend(app.locals,require("./common/render_helper"));
_.extend(app.locals,{
   config:config,
   assets:assets,
   Loader:Loader
});



app.use(session({
    secret:config.session_secret,
    store:new RedisStore({
        port:config.redis_port,
        host:config.redis_host,
        db:config.redis_db,
        pass:config.redis_password
    }),
    resave:false,
    saveUninitialized:false
}));

var urlinfo = require('url').parse(config.host);
config.hostname = urlinfo.hostname || config.host;

app.use(auth.authUser);

app.use("/",web_router);
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
