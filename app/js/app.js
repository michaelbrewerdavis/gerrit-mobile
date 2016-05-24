import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import { connect, Provider } from 'react-redux'
import { createAction, handleActions } from 'redux-actions'
import thunk from 'redux-thunk'
import Immutable, { Map } from 'immutable'
import $ from 'jquery'
import { Router, Route, IndexRoute, Link, hashHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'

import Chrome from './chrome'
import Dashboard from './dashboard'
import ReviewChange from './review-change'
import ReviewFile from './review-file'
import { actions } from './actions'
import { reducers } from './reducers'

require('../css/app.css')

const store = createStore(
  reducers,
  applyMiddleware(thunk)
//  (window.devToolsExtension ? window.devToolsExtension() : (f) => f)
)

const history = syncHistoryWithStore(hashHistory, store)

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route path='/' component={Chrome}>
        <IndexRoute component={Dashboard} />
        <Route path='changes/:changeId'>
          <IndexRoute component={ReviewChange} />
          <Route path='revisions/:revisionId'>
            <Route path='files/:fileName' component={ReviewFile} />
          </Route>
        </Route>
      </Route>
    </Router>
  </Provider>,
  document.getElementById('gerrit-mobile-container'))
