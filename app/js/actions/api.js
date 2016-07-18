import $ from 'jquery'
import actions from './basic'

export function makeAPICall(path, options = {}, prefix = '/api/a') {
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
        return makeAPICall(path, options, prefix)
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

export function loadErrorHandler(dispatch) {
  return (error) => {
    console.log('error')
    console.log(error)
    dispatch(actions.setError(error.message || error.statusText))
    dispatch(actions.currentChange(null))
    dispatch(actions.currentFile(null))
    dispatch(actions.setLoading(false))
  }
}
