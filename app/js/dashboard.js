import React from 'react'
import ReactDOM from 'react-dom'
import { Link } from 'react-router'
import { createStore, applyMiddleware } from 'redux'
import { connect, Provider } from 'react-redux'
import { createAction, handleActions } from 'redux-actions'
import thunk from 'redux-thunk'
import Immutable, { Map } from 'immutable'
import $ from 'jquery'
import { actions } from './actions'

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
function User(props, state) {
  let fragment = []
  if (props.user) {
    fragment = [
      <div className='user-username' key='user'>{props.user.get('username')}</div>,
      <img className='user-avatar' key='avatar' src={props.user.getIn(['avatars', 0, 'url'])} />
    ]
  }
  return (
    <div className='user'>
      {fragment}
    </div>
  )
}

function DashboardHeader(props, state) {
  return (
    <div id='dashboard-header'>
      <div className='dashboard-header-title' onClick={props.loadDashboard}>
        Dashboard
      </div>
      <div className='dashboard-error'>{props.state.app.get('error')}</div>
      <User user={props.state.user} />
    </div>
  )
}

class Dashboard extends React.Component {
  render() {
    return (
      <div id='dashboard'>
        <DashboardHeader loadDashboard={this.props.loadDashboard} state={this.props.state} />
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
