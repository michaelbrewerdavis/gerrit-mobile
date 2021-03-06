import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, compose, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import { Router, Route, IndexRoute, hashHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'

import Chrome from './components/chrome'
import Dashboard from './dashboard'
import Search from './search'
import ReviewChange from './review-change'
import ReviewFile from './review-file'
import { reducers } from './reducers'

require('../css/app.css')

const store = createStore(
  reducers,
  undefined,
  compose(
    applyMiddleware(thunk),
    (window.devToolsExtension ? window.devToolsExtension() : (f) => f)
  )
)

const history = syncHistoryWithStore(hashHistory, store)

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route path='/' component={Chrome}>
        <IndexRoute component={Dashboard} />
        <Route path='search' component={Search} />
        <Route path='c/:changeId'>
          <IndexRoute component={ReviewChange} />
          <Route path=':revisionId'>
            <IndexRoute component={ReviewChange} />
            <Route path='*' component={ReviewFile} />
          </Route>
        </Route>
      </Route>
    </Router>
  </Provider>,
  document.getElementById('gerrit-mobile-container'))
