import $ from 'jquery'
import cookie from 'cookie'
import actions from './basic'

const api = {
  request: (path, options = {}) => {
    return new Promise((resolve, reject) => {
      $.ajax($.extend(true, {
        url: '/api' + path,
        dataFilter: (data) => {
          return data.substr(data.indexOf('\n') + 1)
        }
      }, getXSRFHeader(), options))
      .done((response, status, xhr) => {
        resolve(response)
      })
      .fail((error, status, xhr) => {
        reject(error)
      })
    })
  }
}
export default api

export function loadErrorHandler(dispatch) {
  return (error) => {
    console.log('error', error) // eslint-disable-line no-console
    dispatch(actions.setError(error.message || error.statusText))
    dispatch(actions.currentChange(null))
    dispatch(actions.setCurrentFile(null))
    dispatch(actions.setLoading(false))
  }
}

function getXSRFHeader() {
  const cookies = cookie.parse(window.document.cookie)
  if (cookies.XSRF_TOKEN) {
    return { headers: {'X-Gerrit-Auth': cookies.XSRF_TOKEN} }
  } else {
    return {}
  }
}
