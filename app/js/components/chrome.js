import React from 'react'
import { connect } from 'react-redux'
import actions from '../actions'
import Loading from './loading'

function Error(props, state) {
  return (
    <div className='modal error-modal' role='dialog'>
      <div className='alert alert-danger'>{props.error}</div>
    </div>
  )
}
function Chrome(props, state) {
  let loading = null
  let error = null
  if (props.state.app.get('error')) {
    error = <Error error={props.state.app.get('error')} />
  } else if (!props.state.app.get('loadsInProgress').isEmpty()) {
    loading = <Loading />
  }

  return (
    <div>
      { props.children }
      { loading }
      { error }
    </div>
  )
}

export default connect(
  (state) => ({ state }),
  actions
)(Chrome)
