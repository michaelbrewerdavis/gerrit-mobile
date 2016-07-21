const httpProxy = require('http-proxy')
const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const reauth = require('./server/reauthorize')
const rewriteCookies = require('./server/rewrite-cookies')

require('dotenv').config()

/*
  Server needs to:
    - serve static/compiled assets
    - proxy api requests
*/
const app = express()

// serve static/compiled assets
app.use(express.static('public'))
app.use(session({
  secret: process.env.GERRIT_MOBILE_SECRET,
  name: process.env.GERRIT_MOBILE_COOKIE || 'gerrit-mobile-session',
  saveUninitialized: false,
  resave: false
}))

const api = express()
const apiProxy = createProxy()
apiProxy.on('proxyRes', reauth.interceptChallenge)
api.use(reauth.addAuthHeader)
api.all('/*', apiProxy.web.bind(apiProxy))

const auth = express()
const authProxy = createProxy()

auth.use('/logout', function(req, res, next) {
  req.session.regenerate(next)
})

auth.get('/createPassword', function(req, res) {
  res.redirect(process.env.GERRIT_HOST + '#/settings/http-password')
})

auth.post('/store', bodyParser.urlencoded(), function(req, res) {
  req.session.credentials = req.body
  res.send({ result: 'OK' })
})

auth.all('/*', authProxy.web.bind(authProxy))

app.use('/auth', auth)
app.use('/api', api)
app.listen(3000)

function createProxy() {
  const apiProxy = httpProxy.createProxyServer({
    target: process.env.GERRIT_HOST,
    secure: false,
    autoRewrite: true,
    changeOrigin: true
  })
  apiProxy.on('proxyRes', rewriteCookies)

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
