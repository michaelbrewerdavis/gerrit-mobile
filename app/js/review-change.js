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

function pathToFile(changeId, revisionId, filename) {
  return '/changes/' + changeId + '/revisions/' + revisionId + '/files/' + encodeURIComponent(filename)
}

function FileListItem(props, state) {
  return (
    <Link to={pathToFile(props.changeId, props.revision, props.filename)}>
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

class Message extends React.Component {
  constructor(props) {
    super(props)
    this.state = { expanded: false }
    this.messageBody = this.props.message.get('message')
    let lines = this.messageBody.split('\n\n')
    if (lines.length > 1) {
      this.firstLine = lines.slice(0, 2).join(' ')
      this.rest = lines.slice(2).join('\n')
    } else {
      this.firstLine = this.messageBody
      this.rest = ''
    }
  }

  toggleState() {
    this.setState({ expanded: !this.state.expanded })
  }

  getExpanded() {
    if (this.state.expanded) {
      return (
        <div className='message-expanded'>
          <div className='message-expanded-body'>{this.firstLine}<br />{this.rest}</div>
          {
            this.props.comments.map((list, file) => (
              <div className='comment-file'>
                <Link to={pathToFile(this.props.changeId, this.props.revision, file)}>
                  <div className='comment-filename'>{file}</div>
                </Link>
                {
                  list.map((comment) => (
                    <div className='comment-row'>
                      <div className='comment-line'>{comment.get('line')}</div>
                      <div className='comment-body'>{comment.get('message')}</div>
                    </div>
                  ))
                }
              </div>
            )).valueSeq().toJS()
          }
        </div>
      )
    }
  }

  render() {
    return (
      <div className='message'>
        <div className='message-short' onClick={this.toggleState.bind(this)}>
          <div className='message-author'>{this.props.message.getIn(['author', 'username'])}</div>
          <div className='message-title'>{this.firstLine}</div>
        </div>
        { this.getExpanded() }
      </div>
    )
  }
}

function commentsForMessage(allComments, message) {
  const messageTime = message.get('date')
  const filteredComments = {}
  allComments.map((list, filename) => {
    const filteredList = list.filter((comment) => (comment.get('updated') === messageTime))
    if (filteredList.size > 0) {
      filteredComments[filename] = filteredList
    }
  })
  return Immutable.fromJS(filteredComments)
}

function Messages(props, state) {
  const messages = props.messages || List()
  return (
    <div className='section messages'>
    {
      messages.map((message) => {
        return <Message key={message.get('id')}
                changeId={props.changeId}
                revision={props.revision}
                message={message}
                comments={commentsForMessage(props.comments, message)} />
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
    const changeId = changeDetail.get('id')
    const revisionId = changeDetail.get('current_revision')

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
          <FileList files={files} selectFile={this.props.selectFile} changeId={changeId} revision={revisionId} />
          <Messages changeId={changeId} revision={revisionId} messages={changeDetail.get('messages')} comments={changeDetail.get('comments')} />
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
