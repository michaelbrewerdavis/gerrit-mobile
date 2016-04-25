import { createAction } from 'redux-actions'
import Immutable from 'immutable'
import $ from 'jquery'

export const actions = {
  loadDashboard: loadDashboard,
  loadChange: loadChange,
  loadFile: loadFile,
  setLoading: createAction('setLoading'),
  setDashboardError: createAction('setDashboardError'),
  setError: createAction('setError'),
  setUserData: createAction('setUserData'),
  setChanges: createAction('setChanges'),
  currentChange: createAction('currentChange'),
  currentFile: createAction('currentFile'),
  setChangeDetail: createAction('setChangeDetail'),
  setFileDetail: createAction('setFileDetail')
}

function loadDashboard() {
  return (dispatch, getState) => {
    dispatch(actions.setLoading(true))

    return makeAPICall('/login', false)
    .catch( (error) => {
      // ignore login error - may be CORS error on redirect
      console.log(error)
    })
    .then( () => {
      return Promise.all([
        makeAPICall('/accounts/self'),
        makeAPICall('/changes/?q=is:open+owner:self&q=is:open+reviewer:self+-owner:self&o=LABELS&o=DETAILED_ACCOUNTS')
      ])
    })
    .then( (responses) => {
      console.log(responses)
      dispatch(actions.setUserData( immutableFromJS(responses[0]) ))
      dispatch(actions.setChanges(immutableFromJS({
        outgoing: responses[1][0],
        incoming: responses[1][1]
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
      makeAPICall('/changes/' + changeId + '/comments')
    ])
    .then( (responses) => {
      console.log(responses)
      let changeDetail = responses[0]
      changeDetail['comments'] = responses[1]
      dispatch(actions.setChangeDetail( immutableFromJS(changeDetail) ))
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

function loadErrorHandler(dispatch) {
  return (error) => {
    console.log('error')
    console.log(error)
    dispatch(actions.setError(error.message || error.statusText))
    dispatch(actions.currentChange(null))
    dispatch(actions.currentFile(null))
    dispatch(actions.setLoading(false))
  }
}

function immutableFromJS(js) {
  return typeof js !== 'object' || js === null
    ? js
    : Array.isArray(js)
      ? Immutable.Seq(js).map(immutableFromJS).toList()
      : Immutable.Seq(js).map(immutableFromJS).toMap()
}

function makeAPICall(path, requireAuth = true) {
  if (requireAuth) {
    path = '/a' + path
  }
  return new Promise((resolve, reject) => {
    $.ajax({
      url: '/api' + path,
      dataType: 'json',
      dataFilter: (data) => {
        return data.substr(data.indexOf('\n') + 1)
      }
    })
    .done((response) => {
      resolve(response)
    })
    .fail((error) => {
      reject(error)
    })
  })
}
