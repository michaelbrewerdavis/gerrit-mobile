import { immutableFromJS, getPatchSetNumber, getRevisionId } from './helpers'
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
  loadFile,
  loadSearch
}
export default actions

function getLoadKey(...args) {
  return args.join(':')
}

function loadDashboard() {
  return (dispatch, getState) => {
    const loadKey = getLoadKey('dashboard')

    if (getState().app.get('error') !== '' ||
        getState().app.get('loadsInProgress').includes(loadKey) ||
        !getState().changes.isEmpty())
    {
      return
    }

    dispatch(actions.startLoading(loadKey))
    return dispatch(actions.login())
    .then( () => {
      return api.request('/changes/?q=is:open+owner:self&q=is:open+reviewer:self+-owner:self&o=LABELS&o=DETAILED_ACCOUNTS')
    })
    .then( (response) => {
      dispatch(actions.setChanges(immutableFromJS({
        outgoing: response[0],
        incoming: response[1]
      })))
      dispatch(actions.stopLoading(loadKey))
    })
    .catch( (error) => {
      loadErrorHandler(dispatch)(error)
    })
  }
}

function loadChange(changeId, revisionId, baseRevisionId) {
  return (dispatch, getState) => {
    const loadKey = getLoadKey('change', changeId, revisionId, baseRevisionId)

    if (getState().app.get('error') !== '' ||
        getState().app.get('loadsInProgress').includes(loadKey) ||
        (getState().current.get('changeId') === changeId &&
          getState().current.get('revisionId') === revisionId &&
          getState().current.get('baseRevisionId') === baseRevisionId))
    {
      return
    }

    dispatch(actions.startLoading(loadKey))
    dispatch(actions.login())
    .then(() => {
      return dispatch(loadChangeDetail(changeId))
    })
    .then(() => {
      return Promise.all([
        dispatch(actions.loadComments(changeId)),
        dispatch(actions.loadDraftComments(changeId)),
        dispatch(loadFiles(changeId, revisionId, baseRevisionId))
      ])
    })
    .then( (responses) => {
      dispatch(actions.setCurrentChangeId( changeId ))
      dispatch(actions.setCurrentRevisionId( revisionId ))
      dispatch(actions.setCurrentBaseRevisionId( baseRevisionId ))
      dispatch(actions.stopLoading(loadKey))
    })
    .catch(loadErrorHandler(dispatch))
  }
}

function loadChangeDetail(changeId) {
  return (dispatch, getState) => {
    return api.request('/changes/' + changeId + '/detail?o=DETAILED_LABELS&o=ALL_REVISIONS&o=CURRENT_COMMIT&o=MESSAGES&o=CURRENT_ACTIONS&o=CHANGE_ACTIONS&o=SUBMITTABLE')
    .then((response) => {
      return dispatch(actions.setChange(immutableFromJS(response)))
    })
  }
}

function loadFiles(changeId, revisionId, baseRevisionId) {
  return (dispatch, getState) => {
    if (revisionId === 'latest') {
      revisionId = getState().change.get('current_revision')
    }
    if (baseRevisionId === 'base') {
      baseRevisionId = '0'
    }
    const query = (baseRevisionId === '0') ? '' : ('?base=' + getPatchSetNumber(getState(), baseRevisionId))
    const uri = '/changes/' + changeId + '/revisions/' + getRevisionId(getState(), revisionId) + '/files' + query
    return api.request(uri)
    .then((response) => {
      const files = immutableFromJS(response).map((value, key) => value.set('name', key)).toList().sortBy((v) => v.get('name'))
      dispatch(actions.setFiles(files))
    })
  }
}

function loadFile(changeId, revisionId, baseRevisionId, fileId) {
  return (dispatch, getState) => {
    const loadKey = getLoadKey('file', changeId, revisionId, baseRevisionId, fileId)

    if (getState().app.get('error') !== '' ||
        getState().app.get('loadsInProgress').includes(loadKey) ||
        (getState().current.get('changeId') === changeId &&
          getState().current.get('revisionId') === revisionId &&
          getState().current.get('baseRevisionId') === baseRevisionId &&
          getState().current.get('fileId') === fileId))
    {
      return
    }

    dispatch(actions.startLoading(loadKey))
    dispatch(actions.login())
    .then(() => {
      return dispatch(loadChange(changeId, revisionId, baseRevisionId))
    })
    .then(() => {
      return dispatch(loadChangeDetail(changeId))
    })
    .then((response) => {
      if (baseRevisionId === 'base') {
        baseRevisionId = '0'
      }
      const query = (baseRevisionId === '0') ? '' : ('?base=' + getPatchSetNumber(getState(), baseRevisionId))
      return api.request('/changes/' + changeId + '/revisions/' + getRevisionId(getState(), revisionId) + '/files/' + encodeURIComponent(fileId) + '/diff' + query)
    })
    .then( (response) => {
      dispatch(actions.setFile( immutableFromJS(response) ))
      dispatch(actions.setCurrentFileId( fileId ))
      dispatch(actions.stopLoading(loadKey))
    })
    .catch(loadErrorHandler(dispatch))
  }
}

function loadSearch(query) {
  return (dispatch, getState) => {
    const loadKey = getLoadKey('search', query)

    if (getState().app.get('error') !== '' ||
        getState().app.get('loadsInProgress').includes(loadKey))
    {
      return
    }

    dispatch(actions.startLoading(loadKey))
    dispatch(actions.startSearch(query))
    return dispatch(actions.login())
    .then( () => {
      return api.request('/changes/?q=' + query + '&o=LABELS&o=DETAILED_ACCOUNTS')
    })
    .then( (response) => {
      dispatch(actions.setCurrentSearch(query))
      dispatch(actions.setSearchResults(immutableFromJS(response)))
      dispatch(actions.stopSearch(query))
      dispatch(actions.stopLoading(loadKey))
    })
    .catch( (error) => {
      loadErrorHandler(dispatch)(error)
    })
  }
}
