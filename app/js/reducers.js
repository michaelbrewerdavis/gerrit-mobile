import { routerReducer as routing } from 'react-router-redux'
import { handleActions } from 'redux-actions'
import { combineReducers } from 'redux'
import { combineReducers as combineReducersImmutable } from 'redux-immutable'
import { Map, Set } from 'immutable'
import commentReducers from './reducers/comments'

const setData = (state, action) => action.payload || Map()
const clearData = () => Map()

const app = combineReducersImmutable({
  loadsInProgress: handleActions({
    startLoading: (loads, action) => loads.add(action.payload),
    stopLoading: (loads, action) => loads.delete(action.payload),
    clearLoading: (loads, action) => Set()
  }, Set()),
  searchesInProgress: handleActions({
    startSearch: (searches, action) => searches.add(action.payload),
    stopSearch: (searches, action) => searches.delete(action.payload),
    clearSearch: (loads, action) => Set()
  }, Set()),
  error: handleActions({
    setError: setData
  }, '')
})

const current = combineReducersImmutable({
  changeId: handleActions({
    setCurrentChangeId: setData
  }, ''),
  revisionId: handleActions({
    setCurrentRevisionId: setData
  }, ''),
  baseRevisionId: handleActions({
    setCurrentBaseRevisionId: setData
  }, ''),
  fileId: handleActions({
    setCurrentFileId: setData
  }, ''),
  search: handleActions({
    setCurrentSearch: setData
  }, '')
})

const user = handleActions({
  setUser: setData,
  clearData
}, Map())

const changes = handleActions({
  setChanges: setData,
  clearData
}, Map())

const change = handleActions({
  setChange: setData,
  clearData
}, Map())

const comments = commentReducers

const files = handleActions({
  setFiles: setData,
  clearData
}, Map())

const file = handleActions({
  setFile: setData,
  clearData
}, Map())

const searchResults = handleActions({
  setSearchResults: setData,
  clearData
}, Map())

export const reducers = combineReducers({
  app,
  user,
  current,
  changes,
  change,
  comments,
  files,
  file,
  routing,
  searchResults
})
