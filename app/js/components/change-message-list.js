import React from 'react'
import Immutable, { List } from 'immutable'
import classNames from 'classnames'
import { Link } from 'react-router'

require('../../css/app.css')

function pathToFile(changeId, revisionId, filename) {
  return '/changes/' + changeId + '/revisions/' + revisionId + '/files/' + encodeURIComponent(filename)
}

class Message extends React.Component {
  constructor(props) {
    super(props)
    this.state = { expanded: undefined }
    this.messageBody = this.props.message.get('message')
    this._toggleState = this.toggleState.bind(this)

    let lines = this.messageBody.split('\n\n')
    if (lines.length > 1) {
      this.firstLine = lines.slice(0, 2).join(' ')
      this.rest = lines.slice(2).join('\n')
    } else {
      this.firstLine = this.messageBody
      this.rest = ''
    }
  }

  hasComments() {
    return this.props.comments.size > 0
  }

  isExpanded() {
    if (typeof this.state.expanded !== 'undefined') {
      return this.state.expanded
    }
    return this.hasComments()
  }

  toggleState() {
    this.setState({ expanded: !this.isExpanded() })
  }

  getExpanded() {
    if (this.isExpanded()) {
      return (
        <div key='expanded' className='message-expanded panel-body'>
          <div className='message-expanded-body'>{this.firstLine}<br />{this.rest}</div>
          {
            this.props.comments.map((list, file) => (
              <div key={file} className='comment-file'>
                <Link to={pathToFile(this.props.changeId, this.props.revision, file)}>
                  <div className='comment-filename'>{file}</div>
                </Link>
                {
                  list.map((comment) => (
                    <div key={comment.get('id')} className='comment-row'>
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
    const panelClass = classNames('panel', 'panel-default', {
      'panel-super': this.hasComments()
    })
    const headingClass = classNames('panel-heading', {
      'panel-heading-small': !this.isExpanded()
    })
    const date = new Date(this.props.message.get('date')).toLocaleString()
    return (
      <div className={panelClass}>
        <div key='heading' className={headingClass} onClick={this._toggleState}>
          <div className='detail-row'>
            <div className='message-title'>{this.firstLine}</div>
            <div className='message-author'>{this.props.message.getIn(['author', 'username'])}</div>
          </div>
          {
            this.isExpanded() ? <div className='detail-row message-date'>{date}</div> : null
          }
        </div>
        { this.getExpanded() }
      </div>
    )
  }
}

function commentsForMessage(allComments, message) {
  const messageTime = message.get('date')
  const filteredComments = {}
  allComments.get('committed').map((list, filename) => {
    const filteredList = list.filter((comment) => (comment.get('updated') === messageTime))
    if (filteredList.size > 0) {
      filteredComments[filename] = filteredList
    }
  })
  return Immutable.fromJS(filteredComments)
}

export default function MessageList(props, state) {
  const messages = props.messages || List()
  return (
    <div className='container messages'>
      <h4>History</h4>
      <div className='panel-group'>
      {
        messages.map((message) => {
          return (
            <Message key={message.get('id')}
              changeId={props.changeId}
              revision={props.revision}
              message={message}
              comments={commentsForMessage(props.comments, message)} />
          )
        }).toArray()
      }
      </div>
    </div>
  )
}
