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
      return api.data.request('/changes/?q=is:open+owner:self&q=is:open+reviewer:self+-owner:self&o=LABELS&o=DETAILED_ACCOUNTS')
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
          api.data.request('/changes/' + changeId + '/detail?o=CURRENT_REVISION&o=CURRENT_COMMIT&o=ALL_FILES'),
          api.data.request('/changes/' + changeId + '/comments'),
          dispatch(actions.loadDraftComments(changeId))
        ])
        .then( (responses) => {
          if (responses) {
            const changeDetail = responses[0]
            const comments = responses[1]

            dispatch(actions.setChangeDetail( immutableFromJS(changeDetail) ))
            dispatch(actions.setComments( immutableFromJS(comments) ))
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
        dispatch(actions.currentFile( fileId ))
        return dispatch(loadChange(change))
        .then( (response) => {
          dispatch(actions.setLoading(true))
          return api.data.request('/changes/' + change + '/revisions/' + revision + '/files/' + encodeURIComponent(fileId) + '/diff')
        })
        .then( (response) => {
          dispatch(actions.setFileDetail( immutableFromJS(response) ))
          dispatch(actions.setLoading(false))
        })
      }
    })
    .catch(loadErrorHandler(dispatch))
  }
}
