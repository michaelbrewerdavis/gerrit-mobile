import { immutableFromJS } from '../helpers'
import actions from './basic'
import api from './api'

function authenticate() {
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
        dispatch(actions.setDashboardError(true))
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

const inProgress = {
  login: null
}
export function login() {
  return (dispatch) => {
    if (inProgress.login) {
      return inProgress.login
    } else {
      dispatch(actions.setLoading(true))
      const newLogin = dispatch(authenticate())
        .then(() => {
          dispatch(actions.setLoading(false))
          inProgress.login = null
        })
      inProgress.login = newLogin
      return newLogin
    }
  }
}

export function logout() {
  return (dispatch) => {
    dispatch(actions.setLoading(true))
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
