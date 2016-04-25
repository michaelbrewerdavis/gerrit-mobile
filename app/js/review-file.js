import React from 'react'
import { Map } from 'immutable'
import { connect } from 'react-redux'
import { actions } from './actions'
import { Link } from 'react-router'

require('../css/app.css')

function DiffItem(props, state) {
  const diffBlock = (lines, style) => {
    return lines.map((line, index) => {
      return <div key={index} className={style}>{line}</div>
    }).toJS()
  }

  //   return lines.map((line) => {
  //     return <div className={style}>{line}</div>
  //   }
  // }
  // debugger
  return (
    <div className='file-diff-block'>
    {
      props.diff.get('ab') ? diffBlock(props.diff.get('ab')) : ''
    }
    {
      props.diff.get('a') ? diffBlock(props.diff.get('a'), 'file-diff-block-a') : ''
    }
    {
      props.diff.get('b') ? diffBlock(props.diff.get('b'), 'file-diff-block-b') : ''
    }
    </div>
  )
}

function ReviewFileDiff(props, state) {
  const diff = props.diff || Map()
  const content = diff.get('content') || Map()

  return (
    <div className='file-diff'>
    {
      content.map((diff, index) => {
        return <DiffItem key={index} diff={diff} />
      }).valueSeq().toJS()
    }
    </div>
  )
}

class ReviewFile extends React.Component {
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
          <ReviewFileDiff diff={this.props.state.file.get('fileDetail')} />
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
