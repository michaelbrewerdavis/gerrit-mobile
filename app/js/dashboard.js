import React from 'react'
import ReactDOM from 'react-dom'
import { Link } from 'react-router'
import { createStore, applyMiddleware } from 'redux'
import { connect, Provider } from 'react-redux'
import { createAction, handleActions } from 'redux-actions'
import thunk from 'redux-thunk'
import Immutable, { Map } from 'immutable'
import $ from 'jquery'
import actions from './actions'
import * as nav from './footer'

require('../css/app.css')

function Change(props, state) {
  return (
    <Link to={'/changes/' + props.change.get('id')}>
      <div className='dashboard-change'>
        <div className='dashboard-change-description'>
          <div className='dashboard-change-subject'>{props.change.get('subject')}</div>
          <div className='dashboard-change-details'>
            <div className='dashboard-change-details-id'>{props.change.get('_number')}</div>
            <div className='dashboard-change-details-project'>{props.change.get('project')}</div>
            { props.includeUsername ? <div className='dashboard-change-details-username'>{props.change.getIn(['owner', 'username'])}</div> : '' }
          </div>
        </div>
        <div className='change-icons'>
        </div>
      </div>
    </Link>
  )
}
function Changes(props, state) {
  const changes = props.changes || []
  return (
    <div className='dashboard-changes'>
      <div className='dashboard-changes-label'>{props.label}</div>
      {
        changes.map((change) => {
          return <Change key={change.get('id')} change={change} includeUsername={props.includeUsername} />
        })
      }
    </div>
  )
}

function DashboardHeader(props, state) {
  return (
    <nav.Header {...props} content={
      <div className='file-name file-header-info'>
        Dashboard
        <div className='dashboard-error'>{props.state.app.get('error')}</div>
      </div>
    } />
  )
}

class Dashboard extends React.Component {
  render() {
    return (
      <div id='dashboard'>
        <DashboardHeader state={this.props.state} />
        <Changes
          label='My changes'
          changes={this.props.state.dashboard.getIn(['changes', 'outgoing'])}
          includeUsername={false} />
        <Changes
          label='Incoming changes'
          changes={this.props.state.dashboard.getIn(['changes', 'incoming'])}
          includeUsername={true} />
      </div>
    )
  }

  componentDidMount() {
    if (!this.props.state.app.get('dashboardError') && !this.props.state.dashboard.get('changes')) {
      this.props.loadDashboard()
    }
  }
}

export default connect(
  (state) => ({ state }),
  actions
)(Dashboard)
