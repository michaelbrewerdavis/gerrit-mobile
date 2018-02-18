import React from 'react'
import { connect } from 'react-redux'

import Changes from './components/changes'
import actions from './actions'
import * as nav from './nav'

require('../css/app.css')

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
