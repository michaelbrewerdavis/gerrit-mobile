import { createAction } from 'redux-actions'
import Immutable from 'immutable'
import $ from 'jquery'
import { push } from 'react-router-redux'
import { immutableFromJS } from '../helpers'
import actions from './basic'
import api, { loadErrorHandler } from './api'
import { hashHistory } from 'react-router'

function authenticate() {
  return (dispatch, getState) => {
    if (!getState().user.isEmpty()) {
      return Promise.resolve()
    }

    return api.auth.request('/login')
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
      return api.auth.request('/accounts/self/')
    })
    .then( (response) => {
      const user = response
      dispatch(actions.setUserData( immutableFromJS(user) ))
    })
  }
}

function getDigestPassword() {
  return (dispatch, getState) => {
    if (getState().user.get('digest_password')) {
      return Promise.resolve()
    }

    return api.auth.request('/accounts/self/password.http')
    .catch((error) => {
      if (error.status === 404) {
        // dispatch(push('/createPassword'))
        hashHistory.push('/createPassword')
      }
      throw error
    })
    .then( (response) => {
      return dispatch(storeDigestPassword(response))
    })
  }
}

function storeDigestPassword(digestPassword) {
  return (dispatch, getState) => {
    let user = getState().user
    user = user.set('digest_password', digestPassword)
    dispatch(actions.setUserData( user ))

    return api.auth.request('/store', {
      method: 'POST',
      data: {
        username: user.get('username'),
        password: digestPassword
      }
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
        .then(() => dispatch(getDigestPassword()))
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
    dispatch(actions.clearData())
    return api.auth.request('/login', {
      headers: {
        authorization: 'Basic 0000'
      }
    })
    .catch((err) => {
      if (err.statusCode !== 401) {
        throw err
      }
    })
    .then(() => dispatch(login()))
  }
}
