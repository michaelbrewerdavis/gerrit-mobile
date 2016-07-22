import React from 'react'
import $ from 'jquery'
import { connect } from 'react-redux'
import { Map, List } from 'immutable'

import actions from './actions'
import * as nav from './nav'
import FileList from './components/change-file-list'
import MessageList from './components/change-message-list'
import StatusLabels from './components/status-labels'

require('../css/app.css')

function pathToFile(changeId, revisionId, filename) {
  return '/changes/' + changeId + '/revisions/' + revisionId + '/files/' + encodeURIComponent(filename)
}

class ActionBar extends React.Component {
  constructor() {
    super()
    this.postReview = this.postReview.bind(this)
  }

  postReview() {
    const message = this.refs.replyText.value
    this.refs.replyText.value = ''

    const votes = {}
    const form = $(this.refs.modalForm)
    form.find('input').serializeArray().forEach((vote) => {
      votes[vote.name] = vote.value
    })
    if (message === '' && $.isEmptyObject(votes)) {
      return
    }
    this.props.postReview(
      this.props.change.get('change_id'),
      this.props.change.get('current_revision'),
      message,
      votes
    )
  }

  statusRow(key, label) {
    let responses = (label.get('all') || List()).filter((resp) => resp.get('value'))
    if (responses.size === 0) {
      responses = List([ Map() ])
    }
    return responses.map((resp, index) => {
      return (
        <tr key={key + index}
          className={ resp.get('value') > 0 ? 'success' : resp.get('value') < 0 ? 'danger' : null}>
          <th>{ (index === 0) ? key : ''}</th>
          <td>{resp.get('value')}</td>
          <td>{resp.get('username')}</td>
        </tr>
      )
    })
  }

  voteButtons(label, labelName) {
    const buttons = label.get('values').map((value, key) => (
      (
      <label key={key} className='btn btn-primary btn-outline btn-sm'>
        <input type='radio' name={labelName} value={key} />
        {key}
      </label>
    )
    ))
    return buttons.toArray()
  }
  render() {
    const labels = this.props.change.get('labels') || Map()
    return (
      <div className='container action-bar'>
        <div className='panel panel-white'>
          <div className='panel-heading detail-row'>
            <div className='action-bar-heading' role='button' data-toggle='collapse' href='#status-details' aria-expanded='false' aria-controls='status-details'>
              <StatusLabels size='md' labels={labels} />
            </div>
            <button className='btn btn-md btn-primary btn-outline' data-toggle='modal' data-target='#submit-modal'>Reply</button>
          </div>
          <div id='status-details' className='panel-collapse collapse' role='tabpanel'>
            <table className='table table-striped'>
              <tbody>
              {
                labels.map((label, key) => this.statusRow(key, label)).toArray()
              }
              </tbody>
            </table>
          </div>
        </div>
        <div className="modal fade" id="submit-modal" tabIndex="-1" role="dialog" aria-labelledby="submit-modal-label">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title" id="submit-modal-label">Reply</h4>
              </div>
              <div className="modal-body">
                <form ref='modalForm'>
                  <div>
                    <textarea ref='replyText' name='message' className='comment-edit-textarea' />
                  </div>
                  <div className="lower">
                    <div className='list-group'>
                    {
                      labels.map((label, labelName) => {
                        if (!label.get('values')) { return null }
                        return (
                          <div key={labelName} className="list-group-item detail-row">
                            <div className=''>{labelName}</div>
                            <div className='flex-center review-buttons'>
                              <div className='btn-group' data-toggle='buttons'>
                                {
                                  this.voteButtons(label, labelName)
                                }
                              </div>
                            </div>
                          </div>
                        )
                      })
                    }
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-default" data-dismiss="modal">Cancel</button>
                <button type="button" className="btn btn-primary" data-dismiss='modal' onClick={this.postReview}>Post</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

class
ReviewChange extends React.Component {
  render() {
    const changeDetail = this.props.state.change
    const comments = this.props.state.change.get('comments') || Map()
    const currentRevision = changeDetail.getIn(['revisions', changeDetail.get('current_revision')]) || Map()
    const files = currentRevision.get('files') || Map()
    const changeId = changeDetail.get('id')
    const revisionId = changeDetail.get('current_revision')

    return (
      <div className='change'>
        <nav.Header {...this.props} content={
          <div className='file-name file-header-info truncate-text'>
            {changeDetail.get('_number')} -- {changeDetail.get('subject')}
          </div>
        } />
        <div className='body change-body'>
          <div className='container change-commit-message'>
            { currentRevision.getIn([ 'commit', 'message' ])}
          </div>
          <ActionBar {...this.props} change={changeDetail} />
          <FileList files={files} selectFile={this.props.selectFile} changeId={changeId} revision={revisionId} />
          <MessageList changeId={changeId} revision={revisionId} messages={changeDetail.get('messages')} comments={comments} />
        </div>
        <nav.Footer {...this.props} leftNav={
          <nav.NavButton location={this.parentLocation()}>
            <nav.Glyph name='chevron-up' />
          </nav.NavButton>
        } rightNav={
          <nav.NavButton location={this.firstChildLocation()}>
            <nav.Glyph name='chevron-right' />
            <nav.Glyph name='chevron-right' />
          </nav.NavButton>
        } />
      </div>
    )
  }

  parentLocation() {
    return '/'
  }

  firstChildLocation() {
    const files = this.props.state.change.getIn([
      'revisions',
      this.props.state.change.get('current_revision'),
      'files'])
    if (files) {
      const filename = files.keySeq().first()
      return pathToFile(
        this.props.state.change.get('currentChange'),
        this.props.state.change.get('current_revision'),
        filename)
    }
    return '/'
  }

  checkCurrentChange() {
    const changeId = this.props.params.changeId
    if (!this.props.state.change ||
      changeId !== this.props.state.change.get('id')) {
      this.props.loadChange(this.props.params.changeId)
    }
  }

  componentDidMount() {
    this.checkCurrentChange()
  }

  componentDidUpdate() {
    this.checkCurrentChange()
  }
}

export default connect(
  (state) => ({ state }),
  actions
)(ReviewChange)
