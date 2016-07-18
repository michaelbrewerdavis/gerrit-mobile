import { createAction } from 'redux-actions'
import Immutable from 'immutable'
import $ from 'jquery'
import { immutableFromJS } from './helpers'
import * as commentActions from './actions/comments'
import basicActions from './actions/basic'
import { makeAPICall, loadErrorHandler } from './actions/api'

export const actions = {
  ...commentActions,
  ...basicActions,
  login,
  loadDashboard,
  loadChange,
  loadFile
}

function login() {
  return (dispatch, getState) => {
    if (!getState().user.isEmpty()) {
      return Promise.resolve()
    }
    dispatch(actions.setLoading(true))

    return makeAPICall('/auth/login', {}, '')
    .catch( (error) => {
      // ignore non-auth login error - may be CORS error on redirect
      if (error.status !== 401 && error.status !== 403) {
        console.log(error)
      } else {
        dispatch(actions.setDashboardError(true))
        throw error
      }
    })
    .then( () => {
      return Promise.all([
        makeAPICall('/auth/accounts/self/', {}, ''),
        makeAPICall('/auth/accounts/self/password.http', {}, '')
      ])
    })
    .then( (responses) => {
      const user = responses[0]
      const digestPassword = responses[1]
      dispatch(actions.setUserData( immutableFromJS(user) ))

      return makeAPICall('/auth/store', {
        method: 'POST',
        data: {
          username: user.username,
          password: digestPassword
        }
      }, '')
    })
    .then( () => {
      dispatch(actions.setLoading(false))
    })
  }
}

function loadDashboard() {
  return (dispatch, getState) => {
    actions.login()(dispatch, getState)
    .then( () => {
      dispatch(actions.setLoading(true))
      return makeAPICall('/changes/?q=is:open+owner:self&q=is:open+reviewer:self+-owner:self&o=LABELS&o=DETAILED_ACCOUNTS')
    })
    .then( (response) => {
      dispatch(actions.setChanges(immutableFromJS({
        outgoing: response[0],
        incoming: response[1]
      })))
      dispatch(actions.setError(null))
      dispatch(actions.setLoading(false))
    })
    .catch( (error) => {
      loadErrorHandler(dispatch)(error)
      dispatch(actions.setDashboardError(true))
    })
  }
}

function loadChange(changeId) {
  return (dispatch, getState) => {
    if (getState().change.get('currentChange') === changeId) {
      return Promise.resolve('already loaded')
    }
    dispatch(actions.currentChange( changeId ))
    dispatch(actions.setLoading(true))
    return Promise.all([
      makeAPICall('/changes/' + changeId + '/detail?o=CURRENT_REVISION&o=CURRENT_COMMIT&o=ALL_FILES'),
      makeAPICall('/changes/' + changeId + '/comments'),
      dispatch(actions.loadDraftComments(changeId))
    ])
    .then( (responses) => {
      const changeDetail = responses[0]
      const comments = responses[1]

      dispatch(actions.setChangeDetail( immutableFromJS(changeDetail) ))
      dispatch(actions.setComments( immutableFromJS(comments) ))
      dispatch(actions.setLoading(false))
    })
    .catch(loadErrorHandler(dispatch))
  }
}

function loadFile(change, revision, fileId) {
  return (dispatch, getState) => {
    if (getState().change.get('currentChange') === change && getState().file.get('currentFile') === fileId) {
      return Promise.resolve('already loaded')
    }
    dispatch(actions.currentFile( fileId ))
    loadChange(change)(dispatch, getState)
    .then( (response) => {
      dispatch(actions.setLoading(true))
      return makeAPICall('/changes/' + change + '/revisions/' + revision + '/files/' + encodeURIComponent(fileId) + '/diff')
    })
    .then( (response) => {
      console.log(response)
      dispatch(actions.setFileDetail( immutableFromJS(response) ))
      dispatch(actions.setLoading(false))
    })
    .catch(loadErrorHandler(dispatch))
  }
}
