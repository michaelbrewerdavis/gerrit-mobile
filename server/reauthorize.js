/**
  Reauthorizes based on stored credentials
  */
const authHeader = require('auth-header')
const md5 = require('js-md5')

module.exports = {
  interceptChallenge: (proxyRes, req, res) => {
    if (proxyRes.statusCode === 401 && !req.headers['x-gerrit-intercept-challenge']) {
      req.session.challenge = proxyRes.headers['www-authenticate']
      delete proxyRes.headers['www-authenticate']

      proxyRes.statusCode = 444
    }
  },

  addAuthHeader: (req, res, next) => {
    const session = req.session || {}
    const newAuth = createDigestHeader(req.method, req.url, session.challenge, session.credentials)
    if (newAuth) {
      req.headers.authorization = newAuth
    }
    next()
  }
}

function createDigestHeader(method, uri, challengeStr, credentials) {
  if (credentials && challengeStr) {
    const challenge = authHeader.parse(challengeStr).params
    const response = {
      username: credentials.username,
      realm: challenge.realm,
      nonce: challenge.nonce,
      uri: uri,
      qop: challenge.qop,
      cnonce: 'xxx',
      nc: 0
    }
    const ha1 = md5(credentials.username + ':' + challenge.realm + ':' + credentials.password)
    const ha2 = md5(method + ':' + uri)
    const digest = md5(ha1 + ':' + challenge.nonce + ':' + response.nc + ':' + response.cnonce + ':' + challenge.qop + ':' + ha2)
    response.response = digest
    return authHeader.format({
      scheme: 'Digest',
      params: response
    })
  }
  return null
}
