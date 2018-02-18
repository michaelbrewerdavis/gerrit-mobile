import React from 'react'
import Change from './change'

require('../../css/app.css')

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

export default Changes
