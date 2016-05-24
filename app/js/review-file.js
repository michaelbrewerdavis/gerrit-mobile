import React from 'react'
import { Map, List } from 'immutable'
import { connect } from 'react-redux'
import { actions } from './actions'
import { Link } from 'react-router'
import { immutableFromJS } from './helpers'

require('../css/app.css')

const LINES_TO_COLLAPSE = 10

function Comment(props) {
  return (
    <div className='comment'>
      <div className='comment-header'>
        <div className='comment-author'>
          { props.comment.getIn(['author', 'username']) }
        </div>
        <div className='comment-time'>
          { new Date(props.comment.get('updated')).toLocaleString() }
        </div>
      </div>
      <div className='comment-body'>
        {props.comment.get('message')}
      </div>
    </div>
  )
}

function getCommentsForLine(lineNumber, comments) {
  if (!comments) { return null }

  comments = comments.get(String(lineNumber))
  if (!comments || !comments.size) { return null }

  comments = comments.sort().valueSeq()
  return (
    <div className='comments'>
    {
      comments.map((comment, key) => (
        <Comment key={key} comment={comment} />
      ))
    }
    </div>
  )
}
function DiffLine(props) {
  return (
    <div>
      <div className={props.style}>
        <div className='line-number'>{props.lineNumber}</div>
        <div className='line-content'>{props.line}</div>
      </div>
      { getCommentsForLine(props.lineNumber, props.comments) }
    </div>
  )
}

function DiffBlock(props) {
  return (
    <div>
    {
      props.lines.map((line, index) => {
        return (
          <DiffLine key={index}
            line={line}
            comments={props.comments}
            lineNumber={props.startingLineNumber + index}
            style={props.style} />
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
  return (
    <div className='file-diff-block'>
    {
      props.diff.get('ab') ? <ExpandableDiffBlock comments={props.comments.get('b')} lines={props.diff.get('ab')} startingLineNumber={props.lineNumbers.get('b')} style='line' /> : ''
    }
    {
      props.diff.get('a') ? <DiffBlock comments={props.comments.get('a')} lines={props.diff.get('a')} startingLineNumber={props.lineNumbers.get('a')} style='line file-diff-block-a' /> : ''
    }
    {
      props.diff.get('b') ? <DiffBlock comments={props.comments.get('b')} lines={props.diff.get('b')} startingLineNumber={props.lineNumbers.get('b')} style='line file-diff-block-b' /> : ''
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
        return <DiffItem key={index} comments={props.comments} diff={diff} lineNumbers={lineNumbers} />
      }).valueSeq().toJS()
    }
    </div>
  )
}

class ReviewFile extends React.Component {
  getCommentsForRevision(revision) {
    const allComments = this.props.state.change.getIn(['changeDetail', 'comments', this.props.params.fileName]) || List()
    const patchNumber = this.props.state.change.getIn(['changeDetail', 'revisions', revision, '_number'])
    const commentsForRevision = allComments.filter((comment) => ( comment.get('patch_set') === (patchNumber) ))
    const lineNumbersToComments = {}
    commentsForRevision.forEach((comment) => {
      const line = comment.get('line')
      const date = Date.parse(comment.get('updated'))
      if (!lineNumbersToComments[line]) {
        lineNumbersToComments[line] = {}
      }
      lineNumbersToComments[line][date] = comment
    })
    return immutableFromJS(lineNumbersToComments)
  }

  comments() {
    return Map({
      b: this.getCommentsForRevision(this.props.params.revisionId)
    })
  }

  render() {
    return (
      <div className='file'>
        <div className='header file-header'>
          <div className='file-header-info'>
            <div className='header-title file-header-change'>
              { this.props.state.change.getIn(['changeDetail', 'subject']) }
            </div>
            <div className='header-title file-name'>
              {this.props.state.file.get('currentFile')}
            </div>
          </div>
          <Link to={'/changes/' + this.props.state.change.get('currentChange')}>
            <div className='up-button file-up'>
              Up
            </div>
          </Link>
        </div>
        <div className='header-body'>
          <ReviewFileDiff diff={this.props.state.file.get('fileDetail')} comments={this.comments()} />
        </div>
      </div>
    )
  }

  componentDidMount() {
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
}

export default connect(
  (state) => ({ state }),
  actions
)(ReviewFile)
