import { routerReducer as routing } from 'react-router-redux'
import { handleActions } from 'redux-actions'
import { combineReducers } from 'redux'
import { combineReducers as combineReducers_Immutable } from 'redux-immutable'
import Immutable, { Map } from 'immutable'
import commentReducers from './reducers/comments'

const app = handleActions({
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

const user = handleActions({
  setUserData: (state, action) => {
    return action.payload
  }
}, Map())

const dashboard = handleActions({
  setChanges: (state, action) => {
    return state.set('changes', action.payload)
  }
}, Map())

const change = combineReducers_Immutable({
  comments: commentReducers,

  currentChange: handleActions({
    currentChange: (state, action) => action.payload
  }, Map()),

  changeDetail: handleActions({
    setChangeDetail: (state, action) => action.payload
  }, Map()),

  selectedRevision: handleActions({
    setChangeDetail: (state, action) => action.payload.get('current_revision')
  }, '')
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
  app,
  user,
  dashboard,
  change,
  file,
  routing
})
