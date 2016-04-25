import React from 'react'
import { connect } from 'react-redux'
import actions from './actions'

function Chrome(props, state) {
  if (props.state.app.get('isLoading')) {
    return <div>Loading!</div>
  } else {
    return props.children
  }
}

export default connect(
  (state) => ({ state }),
  actions
)(Chrome)
