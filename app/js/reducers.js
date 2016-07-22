import { routerReducer as routing } from 'react-router-redux'
import { handleActions } from 'redux-actions'
import { combineReducers } from 'redux'
import { combineReducers as combineReducersImmutable } from 'redux-immutable'
import { Map } from 'immutable'
import commentReducers from './reducers/comments'

const setData = (state, action) => action.payload || Map()
const mergeData = (state, action) => {
  return state.merge(action.payload || Map())
}
const clearData = () => Map()
const serialReducer = (fns) => {
  return (state, action) => {
    return fns.reduce(
      (prevState, fn) => fn(prevState, action),
      state)
  }
}
const app = handleActions({
  setLoading: (state, action) => {
    return state.set('isLoading', action.payload)
  },
  setDashboardError: (state, action) => {
    return state.set('dashboardError', action.payload)
  },
  setError: (state, action) => {
    return state.set('error', action.payload)
  },
  clearData
}, Map())

const user = handleActions({
  setUser: setData,
  clearData
}, Map())

const changes = handleActions({
  setChanges: setData,
  clearData
}, Map())

const change = serialReducer([
  handleActions({
    clearData,
    setChangeDetail: mergeData
  }),
  combineReducersImmutable({
    comments: commentReducers,

    currentChange: handleActions({
      currentChange: (state, action) => action.payload || Map()
    }, Map())
  }, Map())
])

const file = handleActions({
  setCurrentFile: (state, action) => {
    return state.set('currentFile', action.payload)
  },
  setFileDiff: (state, action) => {
    return state.set('diff', action.payload)
  },
  clearData
}, Map())

export const reducers = combineReducers({
  app,
  user,
  changes,
  change,
  file,
  routing
})
