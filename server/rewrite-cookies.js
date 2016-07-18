function rewriteCookies(proxyRes, req, res) {
  const domain = req.baseUrl
  if (domain && proxyRes.headers['set-cookie']) {
    const cookies = proxyRes.headers['set-cookie']
    proxyRes.headers['set-cookie'] = cookies.map( (a) => {
      return a.replace(/Path=([^;]*);/, 'Path=' + domain + '$1;' )
    })
  }
}

module.exports = rewriteCookies
