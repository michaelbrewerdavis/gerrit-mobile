import { createAction } from 'redux-actions'

export default {
  clearData: createAction('clearData'),
  setLoading: createAction('setLoading'),
  setDashboardError: createAction('setDashboardError'),
  setError: createAction('setError'),
  setUser: createAction('setUser'),
  setChanges: createAction('setChanges'),
  currentChange: createAction('currentChange'),
  setCurrentFile: createAction('setCurrentFile'),
  setChangeDetail: createAction('setChangeDetail'),
  setFileDiff: createAction('setFileDiff')
}
