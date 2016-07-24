const httpProxy = require('http-proxy')
const express = require('express')
const rewrite = require('./server/rewrite')

require('dotenv').config()

/*
  Server needs to:
    - serve static/compiled assets
    - proxy api requests
*/
const app = express()

// serve static/compiled assets
app.use(express.static('public'))

const auth = express()
const authProxy = createProxy()

auth.all('/*', authProxy.web.bind(authProxy))
app.use('/api', auth)

app.listen(3000)

function createProxy() {
  const apiProxy = httpProxy.createProxyServer({
    target: process.env.GERRIT_HOST,
    secure: false,
    autoRewrite: true,
    changeOrigin: true
  })
  apiProxy.on('proxyRes', rewrite.rewriteCookies)
  apiProxy.on('proxyRes', rewrite.rewriteLocation)

  if (process.env.LOG_REQUESTS) {
    apiProxy.on('error', function(err, req, res) {
      console.log('error: ' + req.url + '\n' + err.stack) // eslint-disable-line no-console
    })
    apiProxy.on('proxyReq', function(proxyReq, req, res, options) {
      console.log('request', req.method, req.url, req.headers)// eslint-disable-line no-console
    })
    apiProxy.on('proxyRes', (proxyRes, req, res) => {
      console.log('response', proxyRes.statusCode, proxyRes.headers) // eslint-disable-line no-console
    })
  }
  return apiProxy
}
