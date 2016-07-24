import { immutableFromJS } from './helpers'
import * as commentActions from './actions/comments'
import basicActions from './actions/basic'
import api, { loadErrorHandler } from './actions/api'
import * as loginActions from './actions/login'

const actions = {
  ...commentActions,
  ...basicActions,
  ...loginActions,
  loadDashboard,
  loadChange,
  loadFile
}
export default actions

function loadDashboard() {
  return (dispatch, getState) => {
    return dispatch(actions.login())
    .then( () => {
      dispatch(actions.setLoading(true))
      return api.request('/changes/?q=is:open+owner:self&q=is:open+reviewer:self+-owner:self&o=LABELS&o=DETAILED_ACCOUNTS')
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
      dispatch(actions.setDashboardError(true))
      loadErrorHandler(dispatch)(error)
    })
  }
}

function loadChange(changeId) {
  return (dispatch, getState) => {
    return dispatch(actions.login())
    .then( () => {
      if (getState().change.get('currentChange') === changeId) {
        return Promise.resolve()
      } else {
        dispatch(actions.currentChange( changeId ))
        dispatch(actions.setLoading(true))
        return Promise.all([
          api.request('/changes/' + changeId + '/detail?o=DETAILED_LABELS&o=ALL_REVISIONS&o=CURRENT_COMMIT&o=MESSAGES&o=CURRENT_ACTIONS&o=CHANGE_ACTIONS&o=ALL_FILES'),
          api.request('/changes/' + changeId + '/comments'),
          dispatch(actions.loadDraftComments(changeId))
        ])
        .then( (responses) => {
          if (responses) {
            const changeDetail = immutableFromJS(responses[0])
            const comments = immutableFromJS(responses[1])
            dispatch(actions.setChangeDetail(changeDetail))
            dispatch(actions.setComments(comments))
          }
          dispatch(actions.setLoading(false))
        })
      }
    })
    .catch(loadErrorHandler(dispatch))
  }
}

function loadFile(change, revision, fileId) {
  return (dispatch, getState) => {
    return dispatch(actions.login())
    .then(() => {
      if (getState().change.get('currentChange') === change && getState().file.get('currentFile') === fileId) {
        return Promise.resolve('already loaded')
      } else {
        dispatch(actions.setCurrentFile( fileId ))
        return dispatch(loadChange(change))
        .then( (response) => {
          dispatch(actions.setLoading(true))
          return api.request('/changes/' + change + '/revisions/' + revision + '/files/' + encodeURIComponent(fileId) + '/diff')
        })
        .then( (response) => {
          dispatch(actions.setFileDiff( immutableFromJS(response) ))
          dispatch(actions.setLoading(false))
        })
      }
    })
    .catch(loadErrorHandler(dispatch))
  }
}
