import React from 'react'
import Immutable, { List } from 'immutable'
import classNames from 'classnames'
import Linkify from 'react-linkify'
import { Link } from 'react-router'
import { makePath } from '../helpers'

require('../../css/app.css')

class Message extends React.Component {
  constructor(props) {
    super(props)
    this.state = { expanded: undefined }
    this.messageBody = this.props.message.get('message').replace('\n\n', '\n')
    this._toggleState = this.toggleState.bind(this)
    let lines = this.messageBody.split('\n')
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
          <Linkify>
            <div className='message-expanded-body'>{this.messageBody}</div>
            {
              this.props.comments.map((list, file) => (
                <div key={file} className='comment-file'>
                  <Link to={makePath({...this.props, fileId: file})}>
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
          </Linkify>
        </div>
      )
    }
  }

  render() {
    const panelClass = classNames('panel', 'panel-default', {
      'panel-super': isImportant(this.props.message)
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

function addCommentsToMessage(allComments, message) {
  const messageTime = message.get('date')
  const filteredComments = {}
  allComments.get('committed').map((list, filename) => {
    const filteredList = list.filter((comment) => (comment.get('updated') === messageTime))
    if (filteredList.size > 0) {
      filteredComments[filename] = filteredList
    }
  })
  return message.set('comments', Immutable.fromJS(filteredComments))
}

function isImportant(message) {
  if (message.get('comments').size > 0) {
    return true
  }
  if (message.get('message').match(/^Uploaded patch set/)) {
    return false
  }
  const filteredUsers = ['hudson', 'jenkins', 'firework']
  const user = message.getIn(['author', 'username'])
  if (!filteredUsers.includes(user)) {
    return true
  }
  if (message.get('message').match(/\b\S+[+-]\d+\b/)) {
    // vote
    return true
  }
  return false
}

export default class MessageList extends React.Component {
  constructor() {
    super()
    this.state = { expanded: false }
    this.toggleExpanded = this.toggleExpanded.bind(this)
  }

  toggleExpanded() {
    this.setState({ expanded: !this.state.expanded })
  }

  isExpanded() {
    return this.state.expanded
  }

  render() {
    let messages = this.props.messages || List()
    messages = messages.map((m) => addCommentsToMessage(this.props.comments, m))
    if (!this.isExpanded()) {
      messages = messages.filter((m) => isImportant(m))
    }
    return (
      <div className='container messages'>
        <div className='detail-row change-label'>
          <h4>History</h4>
          <button onClick={this.toggleExpanded} className='btn btn-xs btn-default btn-outline'>
            { this.isExpanded() ? 'Show Less' : 'Show All'}
          </button>
        </div>
        <div className='panel-group'>
        {
          messages.map((message) => {
            return (
              <Message {...this.props} key={message.get('id')}
                message={message}
                comments={message.get('comments')}
                />
            )
          }).toArray()
        }
        </div>
      </div>
    )
  }
}
