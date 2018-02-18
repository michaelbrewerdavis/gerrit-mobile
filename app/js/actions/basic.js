import { createAction } from 'redux-actions'

export default {
  clearData: createAction('clearData'),
  startLoading: createAction('startLoading'),
  stopLoading: createAction('stopLoading'),
  clearLoading: createAction('clearLoading'),
  setError: createAction('setError'),
  setUser: createAction('setUser'),
  setCurrentChangeId: createAction('setCurrentChangeId'),
  setCurrentRevisionId: createAction('setCurrentRevisionId'),
  setCurrentBaseRevisionId: createAction('setCurrentBaseRevisionId'),
  setCurrentFileId: createAction('setCurrentFileId'),
  setChanges: createAction('setChanges'),
  setChange: createAction('setChange'),
  setFile: createAction('setFile'),
  setFiles: createAction('setFiles'),
  startSearch: createAction('startSearch'),
  stopSearch: createAction('stopSearch'),
  clearSearch: createAction('clearSearch'),
  setCurrentSearch: createAction('setCurrentSearch'),
  setSearchResults: createAction('setSearchResults')
}
