import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import { connect, Provider } from 'react-redux'
import { createAction, handleActions } from 'redux-actions'
import thunk from 'redux-thunk'
import Immutable, { Map } from 'immutable'
import $ from 'jquery'

require('../css/app.css')

function FileListItem(props, state) {
  return (
    <div className='file-list-item'>
      <div className='file-list-item-name' onClick={() => { props.selectFile(props.filename) }}>{props.filename}</div>
    </div>
  )
}

export default class ReviewChange extends React.Component {
  render() {
    const changeDetail = this.props.state.get('changeDetail') || Map()
    const currentRevision = changeDetail.getIn(['revisions', changeDetail.get('current_revision')]) || Map()
    const files = currentRevision.get('files') || Map()

    return (
      <div className='change'>
        <div className='header change-header'>
          <div className='header-title change-header-title'>
            {changeDetail.get('_number')} -- {changeDetail.get('subject')}
          </div>
          <div className='up-button change-return-to-dashboard' onClick={() => this.props.selectChange(null)}>Up</div>
        </div>
        <div className='body change-body'>
          <div className='change-commit-message'>
            { currentRevision.getIn([ 'commit', 'message' ])}
          </div>
          <div className='file-list'>
          {
            files.map((value, key) => {
              return <FileListItem key={key} filename={key} attrs={value}
                selectFile={this.props.selectFile} />
            }).valueSeq().toArray()
          }
          </div>
        </div>
      </div>
    )
  }

  componentDidMount() {
    if (!this.props.state.get('changeDetail')) {
      this.props.loadChange(this.props.change)
    }
  }
}
