import React from 'react'
import { Map } from 'immutable'

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

export default class ReviewFile extends React.Component {
  render() {
    return (
      <div className='file'>
        <div className='header file-header'>
          <div className='file-header-info'>
            <div className='header-title file-header-change'>
              { this.props.state.getIn(['changeDetail', 'subject']) }
            </div>
            <div className='header-title file-name'>
              {this.props.file}
            </div>
          </div>
          <div className='up-button file-up' onClick={() => this.props.selectFile(null)}>
            Up
          </div>
        </div>
        <div className='header-body'>
          <ReviewFileDiff diff={this.props.state.get('fileDetail')} />
        </div>
      </div>
    )
  }

  componentDidMount() {
    if (!this.props.state.get('fileDetail')) {
      this.props.loadFile(this.props.change, this.props.revision, this.props.file)
    }
  }
}
