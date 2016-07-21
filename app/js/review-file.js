import React from 'react'
import { Map, List } from 'immutable'
import { connect } from 'react-redux'
import actions from './actions'
import { Link } from 'react-router'
import { immutableFromJS } from './helpers'
import autosize from 'autosize'
import nav from './footer'

require('../css/app.css')

const LINES_TO_COLLAPSE = 10

class Comment extends React.Component {
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
          <div className='action-bar'>
            <input type='button' onClick={this.saveComment} value='Save' className='btn btn-primary btn-sm btn-standard navbar-btn dropdown-toggle' />
            <input type='button' onClick={this.cancelEdit} value='Cancel' className='btn btn-primary btn-sm btn-standard navbar-btn dropdown-toggle' />
          </div>
        )
      } else {
        return (
          <div className='action-bar'>
            <input type='button' onClick={this.editComment} value='Edit' className='btn btn-primary btn-sm btn-standard navbar-btn dropdown-toggle' />
            <input type='button' onClick={this.deleteComment} value='Delete' className='btn btn-primary btn-sm btn-standard navbar-btn dropdown-toggle' />
          </div>
        )
      }
    } else {
      return (
        <div className='action-bar'>
          <input type='button' onClick={this.replyToComment} value='Reply' className='btn btn-primary btn-sm btn-standard navbar-btn dropdown-toggle' />
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

function getCommentsForLine(props, type) {
  let { comments, lineNumber, ...rest } = props
  if (!comments) { return null }

  comments = comments.getIn([lineNumber, type])
  if (!comments || !comments.size) { return null }

  comments = comments.sort().valueSeq()
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

function DiffLine(props) {
  const onClick = props.addComment.bind(null, { editing: true, filename: props.filename, path: props.filename, line: props.lineNumber, patch_set: props.patchNumber })
  return (
    <div>
      <div className={props.style} onClick={onClick}>
        <div className='line-number'>{props.lineNumber}</div>
        <div className='line-content'>{props.line}</div>
      </div>
      { getCommentsForLine(props, 'committed') }
      { getCommentsForLine(props, 'draft') }
    </div>
  )
}

function DiffBlock(props) {
  const { lines, ...rest } = props
  return (
    <div>
    {
      lines.map((line, index) => {
        const lineNumber = props.startingLineNumber + index
        return (
          <DiffLine {...rest}
            key={index}
            line={line}
            lineNumber={lineNumber} />
        )
      }).toJS()
    }
    </div>
  )
}

class ExpandableDiffBlock extends React.Component {
  constructor() {
    super()
    this.state = { expanded: false }
    this._doExpand = this.doExpand.bind(this)
  }

  shouldExpand() {
    return this.state.expanded || this.props.lines.size < 2 * LINES_TO_COLLAPSE
  }

  doExpand() {
    this.setState({ expanded: true })
  }

  preLines() {
    if (this.props.startingLineNumber === 1) {
      return List()
    }
    return this.props.lines.slice(0, LINES_TO_COLLAPSE)
  }

  render() {
    if (this.shouldExpand()) {
      return (
        <DiffBlock {...this.props} />
      )
    } else {
      return (
        <div className='expandable-diff-block'>
          <DiffBlock {...this.props} lines={this.preLines()} />
          <div className='expandable-diff-expand' onClick={this._doExpand}>
            ...{this.props.lines.size - 2 * LINES_TO_COLLAPSE} lines collapsed...
          </div>
          <DiffBlock {...this.props}
            lines={this.props.lines.slice(-LINES_TO_COLLAPSE)}
            startingLineNumber={this.props.startingLineNumber + this.props.lines.size - LINES_TO_COLLAPSE} />
        </div>
      )
    }
  }
}

function DiffItem(props) {
  const { diff, comments, lineNumbers, ...rest } = props
  return (
    <div className='file-diff-block'>
    {
      props.diff.get('ab') ? <ExpandableDiffBlock {...rest} comments={comments.get('b')} lines={diff.get('ab')} startingLineNumber={lineNumbers.get('b')} style='line' /> : ''
    }
    {
      props.diff.get('a') ? <DiffBlock {...rest} comments={comments.get('a')} lines={diff.get('a')} startingLineNumber={lineNumbers.get('a')} style='line file-diff-block-a' /> : ''
    }
    {
      props.diff.get('b') ? <DiffBlock {...rest} comments={comments.get('b')} lines={diff.get('b')} startingLineNumber={lineNumbers.get('b')} style='line file-diff-block-b' /> : ''
    }
    </div>
  )
}

function incrementLineNumbers(lineNumbers, diff) {
  if (diff.get('a')) {
    lineNumbers = lineNumbers.set('a', lineNumbers.get('a') + diff.get('a').size)
  }
  if (diff.get('b')) {
    lineNumbers = lineNumbers.set('b', lineNumbers.get('b') + diff.get('b').size)
  }
  if (diff.get('ab')) {
    lineNumbers = lineNumbers.set('a', lineNumbers.get('a') + diff.get('ab').size)
    lineNumbers = lineNumbers.set('b', lineNumbers.get('b') + diff.get('ab').size)
  }
  return lineNumbers
}

function ReviewFileDiff(props) {
  const diff = props.diff || Map()
  const content = diff.get('content') || List()
  let startingLineNumbers = Map({ a: 1, b: 1 })

  return (
    <div className='file-diff'>
    {
      content.map((diff, index) => {
        const lineNumbers = startingLineNumbers
        startingLineNumbers = incrementLineNumbers(lineNumbers, diff)
        return <DiffItem {...props} key={index} diff={diff} lineNumbers={lineNumbers} />
      }).valueSeq().toJS()
    }
    </div>
  )
}

class ReviewFile extends React.Component {
  getPatchNumber(revision) {
    return this.props.state.change.getIn(['changeDetail', 'revisions', revision, '_number'])
  }

  getCommentsForPatchSet(patchNumber) {
    let lineNumbersToComments = Map()
    const types = ['committed', 'draft']

    types.forEach((type) => {
      const allComments = this.props.state.change.getIn(['comments', type, this.props.params.fileName]) || List()
      const commentsForRevision = allComments.filter((comment) => ( comment.get('patch_set') === (patchNumber) ))
      commentsForRevision.forEach((comment) => {
        const line = comment.get('line')
        const id = comment.get('id')
        lineNumbersToComments = lineNumbersToComments.setIn([line, type, id], comment)
      })
    })
    return lineNumbersToComments
  }

  comments() {
    return Map({
      b: this.getCommentsForPatchSet( this.getPatchNumber(this.props.params.revisionId) )
    })
  }

  parentLocation() {
    return '/changes/' + this.props.state.change.get('currentChange')
  }

  nextLocation(offset) {
    const files = this.props.state.change.getIn([
      'changeDetail',
      'revisions',
      this.props.params.revisionId,
      'files'])
    if (files) {
      const currentFile = this.props.state.file.get('currentFile')
      const filenames = files.keySeq()
      const index = filenames.indexOf(currentFile)
      const newIndex = index + offset
      if (newIndex >= 0 && newIndex < filenames.size) {
        return '/changes/' + this.props.state.change.get('currentChange') +
          '/revisions/' + this.props.params.revisionId +
          '/files/' + filenames.get(newIndex)
      }
    }
    return this.parentLocation()
  }

  render() {
    const { state, ...props } = this.props
    return (
      <div className='file has-footer'>
        <nav.Header {...this.props} content={
          <div className='file-header-info'>
            <div className='header-title file-header-change'>
              { state.change.getIn(['changeDetail', 'subject']) }
            </div>
            <div className='header-title file-name'>
              { state.file.get('currentFile')}
            </div>
          </div>
        } />
        <div className='header-body'>
          <ReviewFileDiff {...props}
            filename={ state.file.get('currentFile') }
            patchNumber={ this.getPatchNumber(this.props.params.revisionId) }
            diff={ state.file.get('fileDetail') }
            comments={this.comments()}
            changeId={this.props.params.changeId}
            revisionId={this.props.params.revisionId} />
        </div>
        <nav.Footer {...this.props} leftNav={
          nav.makeLink(
            this.parentLocation(),
            nav.glyph('chevron-up'))
        } rightNav={[
          nav.makeLink(
            this.nextLocation(-1),
            [nav.glyph('chevron-left'), nav.glyph('chevron-left')]),
          nav.makeLink(
            this.nextLocation(1),
            [nav.glyph('chevron-right'), nav.glyph('chevron-right')])
        ]} />
      </div>
    )
  }

  checkCurrentFile() {
    const changeId = this.props.params.changeId
    const revisionId = this.props.params.revisionId
    const fileName = this.props.params.fileName
    const loadedChangeId = this.props.state.change.get('currentChange')
    const loadedRevisionId = this.props.state.change.getIn(['changeDetail', 'current_revision'])
    const loadedFileName = this.props.state.file.get('currentFile')

    if (changeId !== loadedChangeId || fileName !== loadedFileName) {
      this.props.loadFile(changeId, revisionId, fileName)
    }
  }

  componentDidMount() {
    this.checkCurrentFile()
  }

  componentDidUpdate() {
    this.checkCurrentFile()
  }
}

export default connect(
  (state) => ({ state }),
  actions
)(ReviewFile)
