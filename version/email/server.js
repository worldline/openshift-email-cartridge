var express = require('express');
var swagger = require('swagger-jack');
var http = require('http');
var fs = require('fs')

// PID


fs.writeFile(process.env.OPENSHIFT_MAILAPI_LOG_DIR+'/node.pid', process.pid, function (err) {
  if (err) throw err;
  console.log('It\'s saved!');
});
// creates a single server to serve static files
var app = express();
// bodyParser and methodOverride
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use('/api', function (req, res, next){
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Expires', 'Thu, 01 Dec 1994 16:00:00 GMT');
  res.setHeader('Max-Age', '0');
  res.setHeader('Pragma', 'no-cache');
  next();
});

// configure swagger jack
app.use(swagger.generator(
  app,
  {
    swaggerVersion: "1.1",
    apiVersion: '2.0',
    basePath: 'http://'+process.env.OPENSHIFT_APP_DNS+'/mailapi/api/',
    description: ''
  },
  [
    {
      api: require('./api.json'),
      controller: require('./lib/emails')
    }
  ])
);
// handle favicon
app.use(express.favicon('./public/favicon.ico'));
// configure swagger jack
app.use(swagger.validator(app));
app.use(swagger.errorHandler());
app.use(app.router);

// last resort: static
app.use("/mailapi/",express.static(process.env.OPENSHIFT_MAILAPI_DIR+'version/email/public/'));

// for unprocessed page, return 404
app.use(function(req, res, next) {
  var error = new Error('Not found: ' + req.url);
  error.status = 404;
  next(error);
});

// handle server error
app.use(function(err, req, res, next)
{
  if (err)
  {
    var statusCode = err.status || 500;
    res.json({
        error:{
          message: err.message
        }
      }, statusCode
    );
  }
});

var server = http.createServer(app);
var port= process.env.OPENSHIFT_MAILAPI_PORT || 8080;
var ip= process.env.OPENSHIFT_MAILAPI_HOST || ""
console.log("try listening on"+ip+":"+port)
server.listen(port,ip, function(err){
  if(err)
    return console.log("Failed to start server: ", err);
});
