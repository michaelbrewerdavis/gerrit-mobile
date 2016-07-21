import { createAction } from 'redux-actions'
import api, { loadErrorHandler } from './api'
import { immutableFromJS } from '../helpers'

export const setComments = createAction('setComments')
export const setDraftComments = createAction('setDraftComments')
export const addComment = createAction('addComment')
export const editComment = createAction('editComment')
export const cancelEditComment = createAction('cancelEditComment')

// internal
const updateDraftComment = createAction('updateDraftComment')
const removeDraftComment = createAction('removeDraftComment')

export function deleteComment(changeId, revisionId, comment) {
  return (dispatch, getState) => {
    dispatch(removeDraftComment(comment))
    if (comment.get('is_new')) {
      return
    }
    return api.data.request('/changes/' + changeId + '/revisions/' + revisionId + '/drafts/' + comment.get('id'), {
      method: 'DELETE'
    })
    .then(() => dispatch(loadDraftComments(changeId)))
    .catch(loadErrorHandler(dispatch))
  }
}

export function saveComment(changeId, revisionId, comment) {
  return (dispatch, getState) => {
    dispatch(updateDraftComment(comment))

    let url = null
    if (comment.get('is_new')) {
      url = '/changes/' + changeId + '/revisions/' + revisionId + '/drafts'
    } else {
      url = '/changes/' + changeId + '/revisions/' + revisionId + '/drafts/' + comment.get('id')
    }
    return api.data.request(url, {
      method: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({
        message: comment.get('message'),
        line: comment.get('line'),
        path: comment.get('path'),
        in_reply_to: comment.get('in_reply_to')
      })
    })
    .then(() => dispatch(loadDraftComments(changeId)))
    .catch(loadErrorHandler(dispatch))
  }
}

export function loadDraftComments(changeId) {
  return (dispatch, getState) => {
    api.data.request('/changes/' + changeId + '/drafts')
    .then( (response) => {
      dispatch(setDraftComments( immutableFromJS(response) ))
    })
  }
}
