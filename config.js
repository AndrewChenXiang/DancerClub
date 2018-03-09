/**
 * Created by chenxiang on 2018/3/5.
 */
var path = require('path');

var config = {
    // debug 为 true 时，用于本地调试
    debug: true,
    port:3000,
    get mini_assets(){return !this.debug;},
    host:'localhost',
    description: 'Dance Club 专业网站',
    keywords:'舞蹈，社区，Dance,Club,node,javascript',
    db:'mongodb://andrew:12345llh@192.168.1.119/node_club_dev',
    log_dir: path.join(__dirname, 'logs')
}
module.exports=config;
