/**
 * Created by chenxiang on 2018/3/4.
 */

var express = require('express');
var site=require('./controllers/site');
var router=express.Router();
router.get('/',site.index);

module.exports=router;
