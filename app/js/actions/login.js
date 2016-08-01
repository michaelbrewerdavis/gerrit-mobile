import { immutableFromJS } from '../helpers'
import actions from './basic'
import api from './api'

export function login() {
  return (dispatch, getState) => {
    if (!getState().user.isEmpty()) {
      return Promise.resolve()
    }

    return api.request('/login')
    .catch( (error) => {
      // ignore non-auth login error - may be CORS error on redirect
      if (error.status !== 401 && error.status !== 403) {
        // do nothing
      } else {
        dispatch(actions.setError(error))
        throw error
      }
    })
    .then( () => {
      return api.request('/accounts/self/')
    })
    .then( (response) => {
      const user = response
      dispatch(actions.setUser( immutableFromJS(user) ))
    })
  }
}

export function logout() {
  return (dispatch) => {
    dispatch(actions.startLoading('logout'))
    dispatch(actions.clearData())
    return api.request('/logout')
    // eslint-disable-next-line handle-callback-err
    .catch((error) => {
      // expect redirect error here
    })
    .then(() => {
      return api.request('/', {
        username: 'xxx',
        password: 'xxx',
        headers: { 'Authorization': 'Basic xxx' }
      })
    })
    // eslint-disable-next-line handle-callback-err
    .catch((error) => {
      // expect 401 error here
    })
    .then(() => {
      window.location.reload()
    })
  }
}
