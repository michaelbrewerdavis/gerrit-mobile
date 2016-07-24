'use strict';
const url = require('url')

function rewriteCookies(proxyRes, req, res) {
  const domain = req.baseUrl
  if (domain && proxyRes.headers['set-cookie']) {
    const cookies = proxyRes.headers['set-cookie']
    proxyRes.headers['set-cookie'] = cookies.map( (a) => {
      return a.replace(/Path=([^;]*);/, 'Path=' + domain + '$1;' )
    })
  }
}

function rewriteLocation(proxyRes, req, res) {
  const domain = req.baseUrl
  if (domain && proxyRes.headers['location']) {
    let location = proxyRes.headers['location']
    if (location.indexOf('/') === 0) {
      location = domain + location
    } else {
      const parsed = url.parse(location)
      parsed.protocol = req.protocol
      parsed.pathname = domain + parsed.pathname
      location = url.format(parsed)
    }
    proxyRes.headers['location'] = location
  }
}

module.exports = {
  rewriteCookies,
  rewriteLocation
}
