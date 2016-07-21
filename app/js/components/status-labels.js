import React from 'react'
import { Map } from 'immutable'
import * as nav from '../nav'

require('../../css/app.css')

function StatusLabel(props) {
  const label = props.label || Map()
  let className = 'btn-outline'
  if (label.get('rejected')) {
    className = 'btn-danger'
  } else if (label.get('disliked')) {
    className = 'btn-danger btn-outline'
  } else if (label.get('approved')) {
    className = 'btn-success'
  } else if (label.get('recommended')) {
    className = 'btn-success btn-outline'
  }
  return (
    <div className={'change-label btn btn-' + props.size + ' ' + className}>
      <nav.Glyph name={props.icon} />
    </div>
  )
}

export default function StatusLabels(props) {
  const labels = props.labels || Map()
  return (
    <div className='dashboard-change-icons'>
      <StatusLabel size={props.size} icon='hdd' label={labels.get('Verified')} />
      <StatusLabel size={props.size} icon='eye-open' label={labels.get('Code-Review')} />
      <StatusLabel size={props.size} icon='wrench' label={labels.get('QA-Review')} />
      <StatusLabel size={props.size} icon='thumbs-up' label={labels.get('Product-Review')} />
    </div>
  )
}
