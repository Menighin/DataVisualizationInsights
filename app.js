var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var Mongoose = require('Mongoose');
var db = Mongoose.connection;
var routes = require('./routes/index');
var users = require('./routes/users');


db.on('error', console.error);
db.once('open', function() {
  console.log('Conectado ao MongoDB.');

  var userSchema = new Mongoose.Schema({
    username: String,
    email: String
  });

  var User = Mongoose.model('User', userSchema);

  module.exports = User;

  // var user1 = new User({
  //   username: 'FromNodeJS',
  //   email: 'fromnodejs@visualcode.com'
  // });

  // user1.save(function(err, user1) {
  //   if (err) return console.error(err);
  //   console.log('Salvo: ');
  //   console.log(user1);
  // });

});

Mongoose.connect('mongodb://localhost/dvinsights');

var app = express();
app.listen(3000);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use('/scripts', express.static(path.join(__dirname, 'public')));

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
