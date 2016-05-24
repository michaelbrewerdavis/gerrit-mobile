const httpProxy = require('http-proxy')
const express = require('express')
require('dotenv').config()

/*
  Server needs to:
    - serve static/compiled assets
    - proxy api requests
*/
const app = express()

// serve static/compiled assets
app.use(express.static('public'))

const apiProxy = httpProxy.createProxyServer({
  target: process.env.GERRIT_HOST,
  secure: false,
  autoRewrite: true,
  changeOrigin: true
})

apiProxy.on('error', function(err, req, res) {
  console.log('error: ' + req.url + '\n' + err.stack)
})

app.all('/api/*', function(req, res) {
  req.url = req.url.replace(/^\/api\//, '/')
  apiProxy.web(req, res)
})

app.listen(3000)
