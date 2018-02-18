import React from 'react'
import { Link } from 'react-router'

import StatusLabels from './status-labels'
import { makePath } from '../helpers'

require('../../css/app.css')

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

export default Change
