var express = require('express'),
  logger = require('morgan'),
  path = require('path'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  app = express();

app.set('views', path.join(__dirname, 'dist/views'));
app.set('view engine', 'html');

//use stuff
app.use(logger('dev'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({
  extended: false,
  limit: '50mb'
}));

// app.use(express.static(path.join(__dirname, 'bower_components')));
// app.use(express.static(path.join(__dirname, 'node_modules')));
app.use(express.static(path.join(__dirname, 'dist')));

const routes = require('./routes');
app.use('/', routes);

var http = require('http').Server(app);

// http.listen(process.env.PORT || 9020);
http.listen(process.env.PORT || 9020);


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
    res.status(err.status || 500).send({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500).send({
    message: err.message,
    error: {}
  });
});