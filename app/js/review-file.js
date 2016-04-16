import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import { connect, Provider } from 'react-redux'
import { createAction, handleActions } from 'redux-actions'
import thunk from 'redux-thunk'
import Immutable, { Map } from 'immutable'
import $ from 'jquery'

require('../css/app.css')

function DiffItem(props, state) {
  const diffBlock = (lines, style) => {
    return lines.map((line, index) => {
      return <div key={index} className={style}>{line}</div>
    }).toJS()
  };

  //   return lines.map((line) => {
  //     return <div className={style}>{line}</div>
  //   }
  // }
  // debugger
  return (
    <div className="gerrit-review-file-diff-block">
    {
      props.diff.get('ab') ? diffBlock(props.diff.get('ab')) : ''
    }
    {
      props.diff.get('a') ? diffBlock(props.diff.get('a'), 'gerrit-review-file-diff-block-a') : ''
    }
    {
      props.diff.get('b') ? diffBlock(props.diff.get('b'), 'gerrit-review-file-diff-block-b') : ''
    }
    </div>
  )
}

function ReviewFileDiff(props, state) {
  const diff = props.diff || Map()
  const content = diff.get('content') || Map()

  return (
    <div className="gerrit-review-file-diff">
    {
      content.map((diff, index) => {
        return <DiffItem key={index} diff={diff} />
      }).valueSeq().toJS()
    }
    </div>
  )
}

export default class ReviewFile extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="gerrit-review-file">
        <div className="gerrit-review-file-header">
          <div className="gerrit-review-file-header-info">
            <div className="gerrit-review-file-header-change">
              { this.props.state.getIn(['changeDetail','subject']) }
            </div>
            <div className="gerrit-review-file-name">
              {this.props.file}
            </div>
          </div>
          <div className="up-button gerrit-review-file-up" onClick={() => this.props.selectFile(null)}>
            Up
          </div>
        </div>
        <ReviewFileDiff diff={this.props.state.get('fileDetail')} />
      </div>
    )
  }

  componentDidMount() {
    if (!this.props.state.get('fileDetail')) {
      this.props.loadFile(this.props.change, this.props.revision, this.props.file)
    }
  }
}
