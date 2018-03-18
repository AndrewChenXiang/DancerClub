/**
 * Created by chenxiang on 2018/3/5.
 */
var path = require('path');

var config = {
    // debug 为 true 时，用于本地调试
    debug: true,
    port:3000,
    session_secret:'dancerclubsessionsecret',
    redis_host: '192.168.1.119',
    redis_port: 6379,
    redis_db: 0,
    name:'Dancer Club',
    admins: { user_login_name: true },
    auth_cookie_name: 'dancer_club',
    redis_password: '12345llh',
    site_icon:"/public/images/dancerclub.png",
    site_logo:"/public/images/dancerclub.png",
    get mini_assets(){return !this.debug;},
    host:'localhost',
    description: 'Dance Club 专业网站',
    keywords:'舞蹈，社区，Dance,Club,node,javascript',
    db:'mongodb://andrew:12345llh@192.168.1.119/node_club_dev',
    site_static_host:'http://localhost:3000',
    mail_opts: {
        host: 'smtp.qq.com',
        port: 465,
        auth: {
            user: '1013829451@qq.com',
            pass: 'tkvthahwjahubced'
        },
        ignoreTLS: true,
    },
    log_dir: path.join(__dirname, 'logs')

}
module.exports=config;
