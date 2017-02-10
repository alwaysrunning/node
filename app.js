var express = require("express");
var app = express();
var path = require('path');
var mongoose = require("mongoose");

var bodyParser = require('body-parser');
var multer = require('multer');
var session = require('express-session');
var route = require("./routes");

global.dbHelper = require("./common/dbHelper");

global.db = mongoose.connect("mongodb://127.0.0.1:27017/test");
app.use(session({
    secret:'secret',
    cookie:{
        maxAge:1000*60*30
    }
}));

app.set('view engine', 'html');
app.engine('.html', require('ejs').__express);

app.set('views', require('path').join(__dirname, 'views'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer())


app.use(express.static(require('path').join(__dirname, 'public')));

app.use(function(req, res, next){
    res.locals.user = req.session.user; //保存用户信息
    var err = req.session.error;  //保存结果响应信息
    res.locals.message = '';  // 保存html标签
    if (err) res.locals.message = '<div class="alert alert-danger" style="margin-bottom: 20px;color:red;">' + err + '</div>';
    next();
});

route(app);

app.get('/', function(req, res){
	res.render("login");
})


app.listen(80);