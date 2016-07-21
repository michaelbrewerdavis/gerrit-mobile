import React from 'react'
import { Map, List } from 'immutable'
import { getCommentsForLine } from './file-comments'

require('../../css/app.css')

const LINES_TO_COLLAPSE = 10

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

export default function Diff(props) {
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
