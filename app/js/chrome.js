import React from 'react'
import { connect } from 'react-redux'
import actions from './actions'

function Loading(props, state) {
  return (
    <div className='modal loading-modal' role='dialog'>
      <div className='spinner'>
        <div className='double-bounce1'></div>
        <div className='double-bounce2'></div>
      </div>
    </div>
  )
}
function Chrome(props, state) {
  let loading = null
  if (props.state.app.get('isLoading')) {
    loading = <Loading />
  }

  return (
    <div>
      { props.children }
      { loading }
    </div>
  )
}

export default connect(
  (state) => ({ state }),
  actions
)(Chrome)
