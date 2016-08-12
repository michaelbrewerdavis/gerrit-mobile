import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import actions from './actions'
import * as nav from './nav'
import StatusLabels from './components/status-labels'
import { makePath } from './helpers'

require('../css/app.css')

function Change(props, state) {
  const target = makePath({ changeId: props.change.get('_number') })
  return (
    <Link to={target} className='list-group-item'>
      <div className='dashboard-change'>
        <div className='dashboard-change-subject'>{props.change.get('subject')}</div>
        <div className='dashboard-change-details'>
          <div className='dashboard-change-text-details'>
            <div className='detail-row'>
              <div className='dashboard-change-detail'>{props.change.get('_number')}</div>
              &nbsp;-&nbsp;
              <div className='dashboard-change-detail'>{props.change.get('project')}</div>
            </div>
            <div className='detail-row'>
              { props.includeUsername ? <div className='dashboard-change-details-username'>{props.change.getIn(['owner', 'username'])}</div> : '' }
            </div>
          </div>
          <div className='flex-spacer' />
          <StatusLabels size='xs' labels={props.change.get('labels')} />
        </div>
      </div>
    </Link>
  )
}
function Changes(props, state) {
  const changes = props.changes || []
  return (
    <div className='dashboard-change panel-group' role='tablist'>
      <div className='panel panel-default panel-super'>
        <div className='panel-heading' role='tab'>
          <h4 className='panel-title'>
            { props.label }
          </h4>
        </div>
        <ul className='list-group'>
        {
          changes.map((change) => {
            return (
              <Change key={change.get('id')} change={change} includeUsername={props.includeUsername} />
            )
          })
        }
        </ul>
      </div>
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
    const changes = this.props.state.changes
    return (
      <div id='dashboard'>
        <DashboardHeader { ...this.props } />
        <div className='dashboard-content container'>
          <Changes
            label='My changes'
            changes={changes.get('outgoing')}
            includeUsername={false} />
          <Changes
            label='Incoming changes'
            changes={changes.get('incoming')}
            includeUsername={true} />
        </div>
      </div>
    )
  }

  componentDidMount() {
    this.props.loadDashboard()
  }
}

export default connect(
  (state) => ({ state }),
  actions
)(Dashboard)
