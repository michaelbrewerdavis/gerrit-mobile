import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import { connect, Provider } from 'react-redux'
import { createAction, handleActions } from 'redux-actions'
import thunk from 'redux-thunk'
import Immutable, { List, Map } from 'immutable'
import $ from 'jquery'
import { Link } from 'react-router'
import { actions } from './actions'

require('../css/app.css')

function FileListItem(props, state) {
  return (
    <Link to={'/changes/' + props.changeId + '/revisions/' + props.revision + '/files/' + encodeURIComponent(props.filename)}>
    <div className='file-list-item'>
      <div className='file-list-item-name'>{props.filename}</div>
    </div>
    </Link>
  )
}

function FileList(props, state) {
  let files = props.files || Map()
  files = files.sortBy((value, key) => key)
  return (
    <div className='section file-list'>
    {
      files.map((value, key) => {
        return <FileListItem key={key} filename={key} attrs={value}
          selectFile={props.selectFile}
          changeId={props.changeId}
          revision={props.revision} />
      }).valueSeq().toArray()
    }
    </div>
  )
}

function Messages(props, state) {
  const messages = props.messages || List()
  return (
    <div className='section messages'>
    {
      messages.map((message) => {
        return <div className='message' key={message.get('id')}>{message.get('message')}</div>
      }).toArray()
    }
    </div>
  )
}

class ReviewChange extends React.Component {
  render() {
    const changeDetail = this.props.state.change.get('changeDetail') || Map()
    const currentRevision = changeDetail.getIn(['revisions', changeDetail.get('current_revision')]) || Map()
    const files = currentRevision.get('files') || Map()

    return (
      <div className='change'>
        <div className='header change-header'>
          <div className='header-title change-header-title'>
            {changeDetail.get('_number')} -- {changeDetail.get('subject')}
          </div>
          <Link to='/'>
            <div className='up-button change-return-to-dashboard'>Up</div>
          </Link>
        </div>
        <div className='body change-body'>
          <div className='section change-commit-message'>
            { currentRevision.getIn([ 'commit', 'message' ])}
          </div>
          <FileList files={files} selectFile={this.props.selectFile} changeId={changeDetail.get('id')} revision={changeDetail.get('current_revision')} />
          {/* <Messages messages={changeDetail.get('messages')} comments={changeDetail.get('comments')} /> */}
        </div>
      </div>
    )
  }

  componentDidMount() {
    const changeId = this.props.params.changeId
    if (!this.props.state.change.get('changeDetail') ||
      changeId !== this.props.state.change.getIn(['changeDetail', 'id'])) {
      this.props.loadChange(this.props.params.changeId)
    }
  }
}

export default connect(
  (state) => ({ state }),
  actions
)(ReviewChange)
