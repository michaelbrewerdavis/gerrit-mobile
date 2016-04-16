import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import { connect, Provider } from 'react-redux'
import { createAction, handleActions } from 'redux-actions'
import thunk from 'redux-thunk'
import Immutable, { Map } from 'immutable'
import $ from 'jquery'

require('../css/app.css')

function Change(props, state) {
  return (
    <div className="gerrit-change" onClick={() => { props.selectChange(props.change.get('id')) }}>
      <div className="gerrit-change-description">
        <div className="gerrit-change-subject">{props.change.get('subject')}</div>
        <div className="gerrit-change-details">
          <div className="gerrit-change-details-id">{props.change.get('_number')}</div>
          <div className="gerrit-change-details-project">{props.change.get('project')}</div>
          { props.includeUsername ? <div className="gerrit-change-details-username">{props.change.getIn(['owner','username'])}</div> : '' }
        </div>
      </div>
      <div className="gerrit-change-icons">
      </div>
    </div>
  )
}
function Changes(props, state) {
  const changes = props.changes || []
  return (
    <div className="gerrit-changes">
      <div className="gerrit-changes-label">{props.label}</div>
      {
        changes.map((change) => {
          return <Change key={change.get('id')} change={change} selectChange={props.selectChange} includeUsername={props.includeUsername}/>
        })
      }
    </div>
  )
}
function User(props, state) {
  var fragment = []
  if (props.user) {
    fragment = [
      <div className="gerrit-user-username" key="user">{props.user.get('username')}</div>,
      <img className="gerrit-user-avatar" key="avatar" src={props.user.getIn(['avatars', 0, 'url'])} />
    ]
  }
  return (
    <div className="gerrit-user">
      {fragment}
    </div>
  )
}

function DashboardHeader(props, state) {
  return (
    <div id="gerrit-dashboard-header">
      <div className="gerrit-dashboard-header-title" onClick={ () => props.loadDashboard() }>
        Dashboard
      </div>
      <div className="gerrit-dashboard-error">{props.state.get('error')}</div>
      <User user={props.state.get('userData')} />
    </div>
  );
}

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div id="gerrit-dashboard">
        <DashboardHeader loadDashboard={this.props.loadDashboard} state={this.props.state} />
        <Changes
          label="My changes"
          changes={this.props.state.getIn(['changes', 'outgoing'])}
          selectChange={this.props.selectChange}
          includeUsername={false} />
        <Changes
          label="Incoming changes"
          changes={this.props.state.getIn(['changes', 'incoming'])}
          selectChange={this.props.selectChange}
          includeUsername={true} />
      </div>
    )
  }

  componentDidMount() {
    if (!this.props.state.get('dashboardError')
        && !this.props.state.get('changes'))
    {
      this.props.loadDashboard();
    }
  }
}
