import React from 'react'
import { Map, List } from 'immutable'
import { connect } from 'react-redux'
import actions from './actions'
import * as nav from './nav'
import Diff from './components/file-diff'
import { makePath, getPatchSetNumber } from './helpers'

require('../css/app.css')

class ReviewFile extends React.Component {
  getCommentsForPatchSet(patchNumber) {
    let lineNumbersToComments = Map()
    const types = ['committed', 'draft']

    types.forEach((type) => {
      const fileId = this.props.state.current.get('fileId')
      const allComments = this.props.state.comments.getIn([type, fileId]) || List()
      const commentsForRevision = allComments.filter((comment) => ( comment.get('patch_set') == (patchNumber) )) // eslint-disable-line eqeqeq
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
      a: this.getCommentsForPatchSet( getPatchSetNumber(this.props.state, this.props.state.current.get('baseRevisionId')) ),
      b: this.getCommentsForPatchSet( getPatchSetNumber(this.props.state, this.props.state.current.get('revisionId')) )
    })
  }

  parentLocation() {
    return makePath({
      ...this.props.state.current.toJS(), state: this.props.state, fileId: null })
  }

  nextLocation(offset) {
    const files = this.props.state.files
    if (!files.isEmpty()) {
      const currentFile = this.props.state.current.get('fileId')
      const filenames = files.map((v) => v.get('name')).toArray()
      const index = filenames.indexOf(currentFile)
      const newIndex = index + offset
      if (newIndex >= 0 && newIndex < filenames.length) {
        return makePath({
          ...this.props.state.current.toJS(),
          state: this.props.state,
          fileId: filenames[newIndex]
        })
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
              { state.change.get('subject') }
            </div>
            <div className='header-title file-name'>
              { state.current.get('fileId')}
            </div>
          </div>
        } />
        <div className='header-body'>
          <Diff {...props}
            filename={ state.current.get('fileId') }
            patchNumber={ getPatchSetNumber(state, this.props.params.revisionId) }
            diff={ state.file }
            comments={this.comments()}
            changeId={this.props.params.changeId}
            revisionId={this.props.params.revisionId} />
        </div>
        <nav.Footer {...this.props}
          up={this.parentLocation()}
          left={this.nextLocation(-1)}
          right={this.nextLocation(1)} />
      </div>
    )
  }

  checkCurrentFile() {
    const changeId = this.props.params.changeId
    const revisionId = this.props.params.revisionId || 'latest'
    const baseRevisionId = this.props.location.query.base || 'base'
    const fileName = this.props.params.splat

    this.props.loadFile(changeId, revisionId, baseRevisionId, fileName)
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
