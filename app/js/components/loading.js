import React from 'react'

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

export default Loading
