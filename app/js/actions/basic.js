import { createAction } from 'redux-actions'

export default {
  clearData: createAction('clearData'),
  setLoading: createAction('setLoading'),
  setDashboardError: createAction('setDashboardError'),
  setError: createAction('setError'),
  setUser: createAction('setUser'),
  setChanges: createAction('setChanges'),
  currentChange: createAction('currentChange'),
  currentFile: createAction('currentFile'),
  setChangeDetail: createAction('setChangeDetail'),
  setFileDetail: createAction('setFileDetail')
}
