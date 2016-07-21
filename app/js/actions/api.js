import $ from 'jquery'
import actions from './basic'

export default {
  auth: api('/auth'),
  data: api('/api/a')
}

function api(prefix = '') {
  return {
    request: (path, options = {}) => {
      return new Promise((resolve, reject) => {
        $.ajax($.extend({
          url: prefix + path,
          dataType: 'json',
          dataFilter: (data) => {
            return data.substr(data.indexOf('\n') + 1)
          }
        }, options))
        .done((response) => {
          resolve(response)
        })
        .fail((error) => {
          if (error.status === 444) {
            const headers = options.headers ? options.headers : {}
            headers['X-GerritMobileRetry'] = 1
            options.headers = headers
            return api(prefix).request(path, options)
            .then((response) => {
              resolve(response)
            })
            .catch((error) => {
              reject(error)
            })
          } else {
            reject(error)
          }
        })
      })
    }
  }
}

export function loadErrorHandler(dispatch) {
  return (error) => {
    console.log('error', error) // eslint-disable-line no-console
    dispatch(actions.setError(error.message || error.statusText))
    dispatch(actions.currentChange(null))
    dispatch(actions.currentFile(null))
    dispatch(actions.setLoading(false))
  }
}
