var httpProxy = require('http-proxy')
var express = require('express');
require('dotenv').config()

/*
  Server needs to:
    - serve static/compiled assets
    - proxy api requests
*/
var app = express();

// serve static/compiled assets
app.use(express.static('public'))

// proxy api requests
console.log(process.env)

var apiProxy = httpProxy.createProxyServer({
  target: process.env.GERRIT_HOST,
  secure: false
});

apiProxy.on('error', function(err, req, res) {
  console.log('error: ' + req.url)
  console.log(req.url)
})

app.all("/api/*", function(req, res){
  req.url = req.url.replace(/^\/api\//, "/a/")
  console.log('proxying:' + req.url)
  apiProxy.web(req, res);
});

app.listen(3000);
