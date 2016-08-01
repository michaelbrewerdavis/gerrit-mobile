import React from 'react'
import autosize from 'autosize'

require('../../css/app.css')

export default class Comment extends React.Component {
  constructor() {
    super()
    this.state = { editing: false }
    this.editComment = this.editComment.bind(this)
    this.cancelEdit = this.cancelEdit.bind(this)
    this.saveComment = this.saveComment.bind(this)
    this.deleteComment = this.deleteComment.bind(this)
    this.replyToComment = this.replyToComment.bind(this)
  }

  componentDidUpdate() {
    if (this.refs.textarea) {
      autosize(this.refs.textarea)
    }
  }

  editComment() {
    this.props.editComment(this.props.comment)
  }

  cancelEdit() {
    if (this.props.comment.get('is_new')) {
      this.deleteComment()
    } else {
      this.props.cancelEditComment(this.props.comment)
    }
  }

  deleteComment() {
    this.props.deleteComment(this.props.changeId, this.props.revisionId, this.props.comment)
  }

  replyToComment() {
    this.props.addComment({
      filename: this.props.filename,
      path: this.props.filename,
      line: this.props.comment.get('line'),
      patch_set: this.props.comment.get('patch_set'),
      in_reply_to: this.props.comment.get('id'),
      editing: true
    })
  }

  saveComment() {
    const comment = this.props.comment.set('message', this.refs.textarea.value)
    this.props.saveComment(this.props.changeId, this.props.revisionId, comment)
    this.props.cancelEditComment(this.props.comment)
  }

  isEditing() {
    return this.props.comment.get('editing')
  }

  getActions() {
    if (this.props.type === 'draft') {
      if (this.isEditing()) {
        return (
          <div className='btn-toolbar'>
            <input type='button' onClick={this.saveComment} value='Save' className='btn btn-primary btn-sm' />
            <input type='button' onClick={this.cancelEdit} value='Cancel' className='btn btn-primary btn-sm' />
          </div>
        )
      } else {
        return (
          <div className='btn-toolbar'>
            <input type='button' onClick={this.editComment} value='Edit' className='btn btn-primary btn-sm' />
            <input type='button' onClick={this.deleteComment} value='Delete' className='btn btn-primary btn-sm' />
          </div>
        )
      }
    } else {
      return (
        <div className='btn-toolbar'>
          <input type='button' onClick={this.replyToComment} value='Reply' className='btn btn-primary btn-sm' />
        </div>
      )
    }
  }

  getContent() {
    if (this.isEditing()) {
      return (
        <div className='comment-edit'>
          <textarea ref='textarea' className='comment-edit-textarea' defaultValue={this.props.comment.get('message')} />
        </div>
      )
    } else {
      return (
        <div className='comment-body'>
          {this.props.comment.get('message')}
        </div>
      )
    }
  }

  getDate() {
    const updated = this.props.comment.get('updated')
    return updated ? new Date(updated).toLocaleString() : ' '
  }

  render() {
    const topLevelClass = 'comment comment-' + this.props.type
    return (
      <div className={topLevelClass}>
        <div className='comment-header'>
          <div className='comment-author'>
            { this.props.comment.getIn(['author', 'username']) }
          </div>
          <div className='comment-time'>
            { this.getDate() }
          </div>
        </div>
        { this.getContent() }
        <div className='comment-actions'>
          { this.getActions() }
        </div>
      </div>
    )
  }
}

export function getCommentsForLine(props, type) {
  let { comments, lineNumber, ...rest } = props
  if (!comments) { return null }

  comments = comments.getIn([lineNumber, type])
  if (!comments || !comments.size) { return null }

  comments = comments.sortBy(c => c.get('updated')).toArray()
  return (
    <div className='comments'>
    {
      comments.map((comment, key) => (
        <Comment {...rest} key={key} comment={comment} type={type} />
      ))
    }
    </div>
  )
}
