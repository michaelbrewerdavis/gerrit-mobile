import React from 'react'
import { Map, List } from 'immutable'
import { connect } from 'react-redux'
import actions from './actions'
import * as nav from './nav'
import Diff from './components/file-diff'

require('../css/app.css')

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
          '/files/' + encodeURIComponent(filenames.get(newIndex))
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
          <Diff {...props}
            filename={ state.file.get('currentFile') }
            patchNumber={ this.getPatchNumber(this.props.params.revisionId) }
            diff={ state.file.get('fileDetail') }
            comments={this.comments()}
            changeId={this.props.params.changeId}
            revisionId={this.props.params.revisionId} />
        </div>
        <nav.Footer {...this.props} leftNav={
          <nav.NavButton location={this.parentLocation()}>
            <nav.Glyph name='chevron-up' />
          </nav.NavButton>
        } rightNav={[
          <nav.NavButton location={this.nextLocation(-1)} key='left'>
            <nav.Glyph name='chevron-left' />
            <nav.Glyph name='chevron-left' />
          </nav.NavButton>,
          <nav.NavButton location={this.nextLocation(1)} key='right'>
            <nav.Glyph name='chevron-right' />
            <nav.Glyph name='chevron-right' />
          </nav.NavButton>
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

    if (changeId !== loadedChangeId || fileName !== loadedFileName || revisionId !== loadedRevisionId) {
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
