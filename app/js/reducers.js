import { routerReducer } from 'react-router-redux'
import { createAction, handleActions } from 'redux-actions'
import { combineReducers } from 'redux'
import Immutable, { Map } from 'immutable'

const appReducer = handleActions({
  setLoading: (state, action) => {
    return state.set('isLoading', action.payload)
  },
  setDashboardError: (state, action) => {
    return state.set('dashboardError', action.payload)
  },
  setError: (state, action) => {
    return state.set('error', action.payload)
  }
}, Map())

const dashboard = handleActions({
  setUserData: (state, action) => {
    return state.set('userData', action.payload)
  },
  setChanges: (state, action) => {
    return state.set('changes', action.payload)
  }
}, Map())

const change = handleActions({
  currentChange: (state, action) => {
    return state.set('currentChange', action.payload)
  },
  setChangeDetail: (state, action) => {
    return state
      .set('changeDetail', action.payload)
      .set('selectedRevision', action.payload.get('current_revision'))
  }
}, Map())

const file = handleActions({
  currentFile: (state, action) => {
    return state.set('currentFile', action.payload)
  },
  setFileDetail: (state, action) => {
    return state.set('fileDetail', action.payload)
  }
}, Map())

export const reducers = combineReducers({
  app: appReducer,
  dashboard,
  change,
  file,
  routing: routerReducer
})
