import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import { connect, Provider } from 'react-redux'
import { createAction, handleActions } from 'redux-actions'
import thunk from 'redux-thunk'
import Immutable, { Map } from 'immutable'
import $ from 'jquery'

import Dashboard from './dashboard'
import ReviewChange from './review-change'
import ReviewFile from './review-file'

require('../css/app.css')

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.state.get('isLoading')) {
      return this.renderLoading()
    } else if (this.props.state.get('selectedChange') &&
                this.props.state.get('selectedRevision') &&
                this.props.state.get('selectedFile')) {
      return <ReviewFile {...this.props}
        change={this.props.state.get('selectedChange')}
        revision={this.props.state.get('selectedRevision')}
        file={this.props.state.get('selectedFile')} />
    } else if (this.props.state.get('selectedChange')) {
      return <ReviewChange {...this.props} change={this.props.state.get('selectedChange')} />
    } else {
      return <Dashboard {...this.props} />
    }
  }

  renderLoading() {
    return (<div>Loading!!!</div>)
  }
}

const actions = {
  loadDashboard: loadDashboard,
  loadChange: loadChange,
  loadFile: loadFile,
  setLoading: createAction('setLoading'),
  setDashboardError: createAction('setDashboardError'),
  setError: createAction('setError'),
  setUserData: createAction('setUserData'),
  setChanges: createAction('setChanges'),
  selectChange: createAction('selectChange'),
  selectFile: createAction('selectFile'),
  setChangeDetail: createAction('setChangeDetail'),
  setFileDetail: createAction('setFileDetail')
};

const ReduxedApp = connect(
    state => ({ state }),
    actions
  )(App);

const reducer = handleActions({
    setLoading: (state, action) => {
      return state.set('isLoading', action.payload)
    },
    setDashboardError: (state, action) => {
      return state.set('dashboardError', action.payload)
    },
    setError: (state, action) => {
      return state.set('error', action.payload)
    },
    setUserData: (state, action) => {
      return state.set('userData', action.payload)
    },
    setChanges: (state, action) => {
      return state.set('changes', action.payload)
    },
    selectChange: (state, action) => {
      console.log('selected ' + action.payload)
      return state
        .set('selectedChange', action.payload)
        .set('changeDetail', null)
    },
    setChangeDetail: (state, action) => {
      return state
        .set('changeDetail', action.payload)
        .set('selectedRevision', action.payload.get('current_revision'))
    },
    selectFile: (state, action) => {
      return state
        .set('selectedFile', action.payload)
        .set('fileDetail', null)
    },
    setFileDetail: (state, action) => {
      return state.set('fileDetail', action.payload)
    }
}, Map());


function loadDashboard() {
  return (dispatch, getState) => {
    dispatch(actions.setLoading(true))

    return makeAPICall('/login', false)
    .catch( (error) => {
      // ignore login error - may be CORS error on redirect
      console.log(error)
    })
    .then( () => {
      return Promise.all([
        makeAPICall('/accounts/self'),
        makeAPICall('/changes/?q=is:open+owner:self&q=is:open+reviewer:self+-owner:self&o=LABELS&o=DETAILED_ACCOUNTS'),
      ])
    })
    .then( (responses) => {
      console.log(responses)
      dispatch(actions.setUserData( immutableFromJS(responses[0]) ))
      dispatch(actions.setChanges(immutableFromJS({
        outgoing: responses[1][0],
        incoming: responses[1][1]
      })))
      dispatch(actions.setError(null))
      dispatch(actions.setLoading(false))
    })
    .catch( (error) => {
      loadErrorHandler(dispatch)(error)
      dispatch(actions.setDashboardError(true))
    })
  }
}

function loadChange(changeId) {
  return (dispatch, getState) => {
    dispatch(actions.setLoading(true))
    return makeAPICall('/changes/' + changeId + '/detail?o=CURRENT_REVISION&o=CURRENT_COMMIT&o=ALL_FILES')
    .then( (response) => {
      console.log(response)
      dispatch(actions.setChangeDetail( immutableFromJS(response) ))
      dispatch(actions.setLoading(false))
    })
    .catch( loadErrorHandler(dispatch) )
  }
}

function loadFile(change, revision, fileId) {
  return (dispatch, getState) => {
    dispatch(actions.setLoading(true))
    return makeAPICall('/changes/' + change + '/revisions/' + revision + '/files/' + encodeURIComponent(fileId) + '/diff')
    .then( (response) => {
      console.log(response)
      dispatch(actions.setFileDetail( immutableFromJS(response) ))
      dispatch(actions.setLoading(false))
    })
    .catch( loadErrorHandler(dispatch) )
  }
}

function loadErrorHandler(dispatch) {
  return (error) => {
    console.log('error')
    console.log(error)
    dispatch(actions.setError(error.message || error.statusText))
    dispatch(actions.selectChange(null))
    dispatch(actions.selectFile(null))
    dispatch(actions.setLoading(false))
  }
}

function immutableFromJS(js) {
  return typeof js !== 'object' || js === null ? js :
    Array.isArray(js) ?
      Immutable.Seq(js).map(immutableFromJS).toList() :
      Immutable.Seq(js).map(immutableFromJS).toMap();
}

function makeAPICall(path, requireAuth = true) {
  if (requireAuth) {
    path = '/a' + path
  }
  return new Promise( (resolve, reject) => {
    $.ajax({
      url: '/api' + path,
      dataType: 'json',
      dataFilter: (data) => {
        return data.substr( data.indexOf('\n') + 1 );
      }
    })
    .done( (response) => {
      resolve(response)
    })
    .fail( (error) => {
      reject(error);
    })
  })
}

const store = createStore(reducer, applyMiddleware(thunk));

ReactDOM.render(
  <Provider store={store}>
    <ReduxedApp />
  </Provider>,
  document.getElementById('gerrit-mobile-container'));
